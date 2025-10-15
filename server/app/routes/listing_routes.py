from flask import Blueprint, jsonify, request

listing_bp = Blueprint('listing', __name__, url_prefix='/listings')

@listing_bp.route('/', methods=['GET'])
def list_listings():
	# placeholder: return empty list
	return jsonify([]), 200

@listing_bp.route('/', methods=['POST'])
def create_listing():
	data = request.get_json() or {}
	# placeholder: create listing
	return jsonify({'message': 'create listing stub', 'received': data}), 201
