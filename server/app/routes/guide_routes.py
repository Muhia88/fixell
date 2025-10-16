from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.repair_guide import RepairGuide
from app.services.ai_service import generate_repair_guide_content

guide_bp = Blueprint('guide_bp', __name__)

@guide_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_and_save_guide():
    """
    Generates a repair guide, saves it to the database,
    and returns it to the user.
    """
    data = request.get_json()
    item_description = data.get('description')

    if not item_description:
        return jsonify({"msg": "Item description is required"}), 400

    #Get the current user's ID
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    #Call the AI service to generate the guide content
    guide_content = generate_repair_guide_content(item_description)

    if guide_content.startswith("Error:"):
        return jsonify({"msg": guide_content}), 500

    #Save the new guide to the database
    new_guide = RepairGuide(
        item_description=item_description,
        generated_content=guide_content,
        user_id=user.id
    )
    db.session.add(new_guide)
    db.session.commit()

    #Return the generated guide to the frontend
    return jsonify({
        "id": new_guide.id,
        "description": new_guide.item_description,
        "guide_content": new_guide.generated_content
    }), 201