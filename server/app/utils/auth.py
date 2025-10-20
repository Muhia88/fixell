from functools import wraps
from flask import request, jsonify, current_app, g
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'Authorization header missing or malformed'}), 401
        token = auth_header.split(' ', 1)[1].strip()
        secret = current_app.config.get('SECRET_KEY')
        if not secret:
            return jsonify({'success': False, 'message': 'Server misconfigured: SECRET_KEY not set'}), 500
        try:
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'Invalid token payload'}), 401
            # attach to flask.g for downstream handlers
            g.current_user_id = int(user_id)
        except ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token expired'}), 401
        except InvalidTokenError as e:
            return jsonify({'success': False, 'message': f'Invalid token: {str(e)}'}), 401

        return f(*args, **kwargs)

    return decorated
