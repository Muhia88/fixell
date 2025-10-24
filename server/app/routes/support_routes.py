from flask import Blueprint, jsonify, request

support_bp = Blueprint('support', __name__)

@support_bp.route('/', methods=['GET'])
def list_tickets():
	return jsonify([]), 200

@support_bp.route('/', methods=['POST'])
def create_ticket():
	data = request.get_json() or {}
	return jsonify({'message': 'create ticket stub', 'received': data}), 201

