from flask import Blueprint, jsonify, request

guide_bp = Blueprint('guide', __name__, url_prefix='/guides')

@guide_bp.route('/', methods=['GET'])
def list_guides():
	# placeholder: return empty list
	return jsonify([]), 200

@guide_bp.route('/', methods=['POST'])
def create_guide():
	data = request.get_json() or {}
	# placeholder: create guide
	return jsonify({'message': 'create guide stub', 'received': data}), 201
