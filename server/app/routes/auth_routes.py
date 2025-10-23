from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app import db 
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint for new user registration."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    phone_number = data.get('phone_number')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if phone_number and not phone_number.replace('+', '').isdigit():
         return jsonify({'message': 'Invalid phone number format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User with that email already exists'}), 409

    if phone_number and User.query.filter_by(phone_number=phone_number).first():
         return jsonify({'message': 'User with that phone number already exists'}), 409

    new_user = User(email=email, name=name, phone_number=phone_number)
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        user_dict = new_user.to_dict(include_phone=False)
        return jsonify({
            'message': 'User registered successfully',
            'user': user_dict
        }), 201
    except Exception as e:
        db.session.rollback()
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

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
             return jsonify({'message': 'Server misconfigured: SECRET_KEY not set'}), 500

        token_payload = {
            'user_id': user.id,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
            'iat': datetime.datetime.now(datetime.timezone.utc)
        }

        jwt_token = jwt.encode(token_payload, secret_key, algorithm='HS256')

        user_dict = user.to_dict(include_phone=False)
        return jsonify({
            'message': 'Login successful',
            'token': jwt_token,
            'user': user_dict
        }), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401


@auth_bp.route('/profile', methods=['GET', 'PUT'])
def profile():
    """
    Handles GET (fetch profile) and PUT (update profile) requests.
    Requires Authorization: Bearer <token>
    """
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    elif auth_header:
        token = auth_header.strip()

    if not token:
        return jsonify({'message': 'Missing authorization token'}), 401

    secret_key = current_app.config.get('SECRET_KEY')
    if not secret_key:
        return jsonify({'message': 'Server misconfigured: SECRET_KEY not set'}), 500

    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            return jsonify({'message': 'Invalid token payload'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if request.method == 'GET':
            return jsonify({'user': user.to_dict(include_phone=True)}), 200

        elif request.method == 'PUT':
            data = request.get_json() or {}

            if 'name' in data:
                new_name = data.get('name')
                if not new_name or not isinstance(new_name, str) or new_name.strip() == '':
                    return jsonify({'message': 'Name field cannot be empty'}), 400
                user.name = new_name.strip()

            if 'phone_number' in data:
                new_phone = data.get('phone_number')
                if new_phone:
                    normalized = str(new_phone).strip()
                    if not normalized.replace('+', '').isdigit():
                        return jsonify({'message': 'Invalid phone number format'}), 400

                    existing = User.query.filter_by(phone_number=normalized).first()
                    if existing and existing.id != user.id:
                        return jsonify({'message': 'Phone number already in use'}), 409

                    user.phone_number = normalized
                else:
                    user.phone_number = None

            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating profile: {e}")
                return jsonify({'message': 'Failed to update profile'}), 500

            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict(include_phone=True)
            }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Profile operation error: {e}")
        return jsonify({'message': 'An error occurred during profile operation'}), 500