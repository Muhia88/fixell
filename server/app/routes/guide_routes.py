from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.repair_guide import RepairGuide
from app.models.saved_guide import SavedGuide
from app.services.ai_service import generate_repair_guide_content

guide_bp = Blueprint('guide_bp', __name__)


@guide_bp.route('/generate', methods=['POST'])
def generate_guide():
    data = request.get_json() or {}
    item_description = data.get('description')
    if not item_description:
        return jsonify({"msg": "Item description is required"}), 400

    guide_content = generate_repair_guide_content(item_description)
    if guide_content.startswith('Error:'):
        return jsonify({'msg': guide_content}), 500

    # Return generated guide without saving (frontend can call /save)
    return jsonify({'description': item_description, 'guide_content': guide_content}), 200


@guide_bp.route('/save', methods=['POST'])
def save_guide():
    data = request.get_json() or {}
    title = data.get('title') or data.get('description', 'Saved Guide')[:100]
    description = data.get('description')
    guide_content = data.get('guide_content')

    if not guide_content:
        return jsonify({'msg': 'guide_content is required'}), 400

    saved = SavedGuide(title=title, description=description, guide_content=guide_content)
    db.session.add(saved)
    db.session.commit()

    return jsonify(saved.to_dict()), 201


@guide_bp.route('/', methods=['GET'])
def list_saved_guides():
    guides = SavedGuide.query.order_by(SavedGuide.created_at.desc()).all()
    return jsonify([g.to_dict() for g in guides]), 200


@guide_bp.route('/<int:guide_id>', methods=['DELETE'])
def delete_saved_guide(guide_id):
    """Delete a saved guide by id."""
    try:
        guide = SavedGuide.query.get(guide_id)
        if not guide:
            return jsonify({'msg': 'Guide not found'}), 404
        db.session.delete(guide)
        db.session.commit()
        # No content response on successful delete
        return '', 204
    except Exception as e:
        current_app.logger.error(f"Failed to delete saved guide {guide_id}: {e}")
        db.session.rollback()
        return jsonify({'msg': 'Failed to delete guide'}), 500