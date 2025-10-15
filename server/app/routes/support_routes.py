from flask import Blueprint, jsonify, request

support_bp = Blueprint('support', __name__, url_prefix='/support')

@support_bp.route('/', methods=['GET'])
def list_tickets():
	# placeholder: return empty list
	return jsonify([]), 200

@support_bp.route('/', methods=['POST'])
def create_ticket():
	data = request.get_json() or {}
	# placeholder: create ticket
	return jsonify({'message': 'create ticket stub', 'received': data}), 201
