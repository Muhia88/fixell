from flask import Blueprint, jsonify, request
from app.models.listing import Listing

user_bp = Blueprint("user_bp", __name__)


@user_bp.route('/<int:user_id>/listings', methods=['GET'])
def get_user_listings(user_id):
    """
    GET /api/users/<user_id>/listings?page=1&limit=10
    Returns a paginated list of listings for the specified user.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))

        query = Listing.query.filter_by(user_id=user_id).order_by(Listing.created_at.desc())
        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        listings = [listing.to_dict() for listing in paginated.items]

        return jsonify({
            'success': True,
            'page': page,
            'total_pages': paginated.pages,
            'total_listings': paginated.total,
            'data': listings
        }), 200

    except Exception as e:
        print('Error in get_user_listings:', e)
        return jsonify({'success': False, 'message': str(e)}), 500
