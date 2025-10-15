from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
	data = request.get_json() or {}
	# placeholder: validate credentials
	return jsonify({'message': 'login stub', 'received': data}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
	data = request.get_json() or {}
	# placeholder: create user
	return jsonify({'message': 'register stub', 'received': data}), 201
