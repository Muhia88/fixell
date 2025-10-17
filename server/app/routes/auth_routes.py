from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app import db # Assuming 'db' is initialized
import jwt
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint for new user registration."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User with that email already exists'}), 409

    # 1. Create a new User instance (password is automatically hashed)
    new_user = User(email=email, password=password, name=name)

    try:
        # 2. Add to database and commit
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        # Log the error for debugging
        current_app.logger.error(f"Registration error: {e}")
        return jsonify({'message': 'An error occurred during registration'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint for existing user login, returns a JWT."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # 1. Check if user exists
    user = User.query.filter_by(email=email).first()

    # 2. Check password
    if user and user.check_password(password):
        # 3. User is authenticated, generate JWT
        # current_app.config['SECRET_KEY'] should be set in server/config.py
        secret_key = current_app.config.get('SECRET_KEY') 
        if not secret_key:
             return jsonify({'message': 'Server misconfigured: SECRET_KEY not set'}), 500
             
        token_payload = {
            'user_id': user.id,
            # Token expiration set to 24 hours
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24), 
            'iat': datetime.datetime.utcnow()
        }
        
        jwt_token = jwt.encode(token_payload, secret_key, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            # Important: return the token
            'token': jwt_token, 
            'user': user.to_dict()
        }), 200
    else:
        # Authentication failed
        return jsonify({'message': 'Invalid email or password'}), 401

