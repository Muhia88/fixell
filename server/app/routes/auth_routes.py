from flask import Blueprint, request, jsonify
from app.models.user import User
from app.__init__ import db

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Handles new user registration.
    Endpoint: /api/auth/register (due to url_prefix in __init__.py)
    Expects JSON body: {"username": "...", "email": "...", "password": "..."}
    """
    data = request.get_json()
    
    # 1. Extract and validate required fields
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Missing username, email, or password in request body"}), 400

    # 2. Check for existing user (by email, as it's unique)
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        # 409 Conflict status code indicates the resource already exists
        return jsonify({"message": "User with this email address already exists"}), 409

    # 3. Create, hash, and save the new user
    try:
        # The User constructor calls set_password, which handles the hashing
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        # 4. Return success response (201 Created)
        return jsonify({
            "message": "User registered successfully",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        # Log the error for debugging
        print(f"Database error during registration: {e}") 
        return jsonify({"message": "An internal server error occurred during registration"}), 500
