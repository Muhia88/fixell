from flask import Blueprint, jsonify, request
from app.models.listing import Listing
from app import db
from app.utils.auth import login_required
from flask import g
from app.models.user_impact_event import UserImpactEvent
from sqlalchemy import func

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


@user_bp.route('/impact', methods=['GET'])
@login_required
def get_user_impact():
    """
    GET /api/users/impact
    Returns aggregate impact stats and category breakdowns for the logged-in user.
    """
    user_id = getattr(g, 'current_user_id', None)
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    try:
        total_stats = db.session.query(
            func.count(UserImpactEvent.id).label('items_saved'),
            func.sum(UserImpactEvent.weight_diverted_kg).label('weight_diverted'),
            func.sum(UserImpactEvent.money_saved_kes).label('money_saved_kes')
        ).filter(UserImpactEvent.user_id == user_id).first()

        category_stats_raw = db.session.query(
            UserImpactEvent.item_category,
            func.count(UserImpactEvent.id).label('count')
        ).filter(UserImpactEvent.user_id == user_id).group_by(UserImpactEvent.item_category).all()

        category_stats = [
            {'name': cat, 'value': count} for cat, count in category_stats_raw
        ]

        stats = {
            'items_saved': total_stats.items_saved or 0,
            'weight_diverted': round(total_stats.weight_diverted or 0, 2),
            'money_saved': round(total_stats.money_saved_kes or 0, 2)
        }

        return jsonify({
            'success': True,
            'stats': stats,
            'by_category': category_stats
        }), 200

    except Exception as e:
        print('Error in get_user_impact:', e)
        return jsonify({'success': False, 'message': str(e)}), 500


@user_bp.route('/activity', methods=['GET'])
@login_required
def get_user_activity():
    """
    GET /api/users/activity
    Returns the 5 most recent impact events for the logged-in user.
    """
    user_id = getattr(g, 'current_user_id', None)
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    try:
        events = UserImpactEvent.query.filter_by(user_id=user_id) \
            .order_by(UserImpactEvent.created_at.desc()) \
            .limit(5) \
            .all()

        return jsonify({
            'success': True,
            'activity': [e.to_dict() for e in events]
        }), 200

    except Exception as e:
        print('Error in get_user_activity:', e)
        return jsonify({'success': False, 'message': str(e)}), 500