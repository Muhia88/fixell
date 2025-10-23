from flask import Blueprint, jsonify, request, g, current_app
from app.models.listing import Listing, ListingStatus 
from app import db
from app.utils.auth import login_required
from app.models.user_impact_event import UserImpactEvent
from sqlalchemy import func, case

user_bp = Blueprint("user_bp", __name__)


@user_bp.route('/<int:user_id>/listings', methods=['GET'])
@login_required 
def get_user_listings(user_id):
    """
    GET /api/users/<user_id>/listings?page=1&limit=10&status=active|sold
    Returns a paginated list of listings for the specified user, filtered by status.
    Defaults to 'active' status.
    Ensures the logged-in user matches the requested user_id.
    """
    logged_in_user_id = getattr(g, 'current_user_id', None)
    if not logged_in_user_id or logged_in_user_id != user_id:
        return jsonify({'success': False, 'message': 'Forbidden'}), 403

    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        status_filter_str = request.args.get('status', 'active')
        try:
            status_filter_enum = ListingStatus(status_filter_str)
        except ValueError:
            status_filter_enum = ListingStatus.ACTIVE 

        query = Listing.query.filter_by(user_id=user_id, status=status_filter_enum) \
                             .order_by(Listing.created_at.desc())

        paginated = query.paginate(page=page, per_page=limit, error_out=False)
        listings = [listing.to_dict() for listing in paginated.items]

        return jsonify({
            'success': True,
            'page': page,
            'total_pages': paginated.pages,
            'total_listings': paginated.total,
            'status_filter': status_filter_enum.value,
            'data': listings
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting user {user_id} listings: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@user_bp.route('/impact', methods=['GET'])
@login_required
def get_user_impact():
    """
    GET /api/users/impact
    Returns aggregate impact stats (including money saved from sales)
    and category breakdowns for the logged-in user.
    """
    user_id = getattr(g, 'current_user_id', None)
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    try:
        # Count all impact events as items_saved, sum weight_diverted across all events,
        # but only sum money_saved_kes for ITEM_SOLD events to avoid counting mock money
        total_stats = db.session.query(
            func.count(UserImpactEvent.id).label('items_saved'),
            func.sum(UserImpactEvent.weight_diverted_kg).label('weight_diverted'),
            func.sum(case((UserImpactEvent.event_type == 'ITEM_SOLD', UserImpactEvent.money_saved_kes), else_=0)).label('money_saved_kes')
        ).filter(UserImpactEvent.user_id == user_id).first()

        category_stats_raw = db.session.query(
            UserImpactEvent.item_category,
            func.count(UserImpactEvent.id).label('count')
        ).filter(
            UserImpactEvent.user_id == user_id,
        ).group_by(UserImpactEvent.item_category).all()

        category_stats = [{'name': cat, 'value': count} for cat, count in category_stats_raw]

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
        current_app.logger.error(f"Error getting user impact: {e}")
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
        current_app.logger.error(f"Error getting user activity: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500