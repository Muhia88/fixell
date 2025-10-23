from flask import Blueprint, jsonify, request, current_app, g
from sqlalchemy import or_, and_, cast
from sqlalchemy import String
from app.models.listing import Listing, ListingStatus 
from app.models.user import User 
from app import db
import os
from werkzeug.utils import secure_filename
import uuid
from app.utils.auth import login_required
from app.services.impact_service import create_impact_event
from app.services.ai_service import estimate_item_weight
from werkzeug.exceptions import NotFound

listing_bp = Blueprint("listing_bp", __name__)


def _resolve_status_filter(status_str):
    """Resolve a requested status string to a value suitable for filtering the Listing.status column.
    This function is defensive because the underlying DB enum may store either the Enum.name
    (e.g. 'ACTIVE') or the Enum.value (e.g. 'active'). We try to return a value that matches
    the DB enum labels when possible; otherwise we return the Python Enum member so SQLAlchemy
    can do the right thing.
    """
    # normalize incoming
    sf = (status_str or '').strip()
    if not sf:
        sf = 'active'

    # Attempt to map to a ListingStatus member (by value or by name)
    member = None
    try:
        member = ListingStatus(sf)
    except Exception:
        try:
            member = ListingStatus[sf.upper()]
        except Exception:
            member = ListingStatus.ACTIVE

    # Prefer the enum member's value (e.g. 'active') which matches the model's intended stored value.
    # This avoids returning the Enum.name (e.g. 'ACTIVE') which may not match the DB labels.
    try:
        return member.value
    except Exception:
        try:
            return member.name
        except Exception:
            return member

@listing_bp.route("", methods=["GET"])
def get_listings():
    """
    GET /api/listings?page=1&limit=10&status=active
    Returns a paginated list of listings, filtering by ACTIVE status by default.
    """
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        user_id = request.args.get("user_id")
        q = request.args.get('q')
        category = request.args.get('category')
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        status_filter = request.args.get('status', 'active')
        valid_statuses = [s.value for s in ListingStatus]
        if status_filter not in valid_statuses:
            status_filter = 'active'

        resolved = _resolve_status_filter(status_filter)
        # resolved should be a string label; cast the DB enum to text to avoid SQLAlchemy Enum validation issues
        query = Listing.query.filter(cast(Listing.status, String) == resolved) \
                         .order_by(Listing.created_at.desc())

        if user_id:
            try:
                uid = int(user_id)
                query = query.filter_by(user_id=uid)
            except ValueError:
                return jsonify({"success": False, "message": "user_id must be an integer"}), 400

        if q:
            like_q = f"%{q}%"
            query = query.filter(or_(Listing.title.ilike(like_q), Listing.description.ilike(like_q)))

        if category:
            query = query.filter_by(category=category)

        try:
            if min_price is not None:
                mp = float(min_price)
                query = query.filter(Listing.price >= mp)
            if max_price is not None:
                xp = float(max_price)
                query = query.filter(Listing.price <= xp)
        except ValueError:
            return jsonify({"success": False, "message": "min_price/max_price must be numbers"}), 400

        paginated = query.paginate(page=page, per_page=limit, error_out=False)
        listings = [listing.to_dict() for listing in paginated.items]

        return jsonify({
            "success": True,
            "page": page,
            "total_pages": paginated.pages,
            "total_listings": paginated.total,
            "data": listings
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting listings: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@listing_bp.route('/<int:listing_id>', methods=['GET'])
def get_single_listing(listing_id):
    """
    GET /api/listings/<listing_id>
    Returns details for a single listing, including seller's phone number.
    Only returns ACTIVE listings.
    """
    try:
        resolved = _resolve_status_filter('active')
        listing = db.session.query(Listing, User).join(User, Listing.user_id == User.id) \
               .filter(Listing.id == listing_id, cast(Listing.status, String) == resolved) \
               .first()

        if not listing:
            raise NotFound("Listing not found or is not active.")

        listing_obj, author_obj = listing
        listing_data = listing_obj.to_dict()
        listing_data['author'] = author_obj.to_dict(include_phone=True)

        return jsonify({'success': True, 'data': listing_data}), 200

    except NotFound as e:
         return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Error getting single listing {listing_id}: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500

@listing_bp.route('', methods=['POST'])
@login_required
def create_listing():
    """
    POST /api/listings/
    Creates a new listing (defaults to ACTIVE status) and logs an impact event.
    """
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        price = request.form.get('price')
        category = request.form.get('category')
        condition = request.form.get('condition')
        location = request.form.get('location')

        if not title or not price:
            return jsonify({'success': False, 'message': 'Title and price (KES) are required'}), 400

        auth_user_id = getattr(g, 'current_user_id', None)
        if not auth_user_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401

        try:
            price_val = float(price)
        except ValueError:
            return jsonify({'success': False, 'message': 'Price must be a number'}), 400

        images_saved = []
        files = request.files.getlist('images')
        from app.services.supabase_service import upload_file 
        for fh in files:
             if fh and fh.filename:
                filename = secure_filename(fh.filename)
                unique_name = f"{uuid.uuid4().hex}_{filename}"
                dest_path = f"uploads/{auth_user_id}/{unique_name}"
                fh.stream.seek(0)
                data = fh.read()
                try:
                    pub = upload_file(data, dest_path, content_type=fh.mimetype)
                    images_saved.append(pub)
                except Exception as e:
                    current_app.logger.error('Supabase upload failed: %s', e)
                    return jsonify({'success': False, 'message': 'Image upload failed'}), 500

        current_app.logger.info(f"Requesting AI weight estimate for listing: {title}")
        estimated_weight = estimate_item_weight(title, description or '', category or 'Other')
        current_app.logger.info(f"AI estimated weight: {estimated_weight} kg")

        event_desc = f"Listed '{title}'"
        impact_event = create_impact_event(
            user_id=int(auth_user_id),
            event_type="ITEM_LISTED",
            category=(category or 'Other'),
            description=event_desc,
            estimated_weight_kg=estimated_weight,
            money_override=None 
        )
        db.session.add(impact_event)

        listing = Listing(
            title=title,
            description=description,
            price=price_val,
            category=category,
            condition=condition,
            location=location,
            images=images_saved,
            user_id=int(auth_user_id),
            status=ListingStatus.ACTIVE 
        )
        db.session.add(listing)
        db.session.commit()

        return jsonify({'success': True, 'data': listing.to_dict()}), 201

    except Exception as e:
        current_app.logger.error(f"Error creating listing: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@listing_bp.route('/<int:listing_id>', methods=['PUT'])
@login_required
def update_listing(listing_id):
    """ Updates an existing listing. """
    try:
        listing = Listing.query.get_or_404(listing_id)
        if listing.user_id != getattr(g, 'current_user_id', None):
            return jsonify({'success': False, 'message': 'Forbidden'}), 403

        if listing.status == ListingStatus.SOLD:
             return jsonify({'success': False, 'message': 'Cannot update a sold listing'}), 400


        content_type = request.content_type or ''
        if content_type.startswith('multipart/form-data'):
            form = request.form
            files = request.files.getlist('images')
            remove_images_raw = form.get('remove_images')
            for field in ('title', 'description', 'price', 'category', 'condition', 'location'):
                if field in form:
                    val = form.get(field)
                    if field == 'price' and val is not None:
                        try: val = float(val)
                        except Exception: pass
                    setattr(listing, field, val)
        else:
            data = request.get_json() or {}
            for field in ('title', 'description', 'price', 'category', 'condition', 'location'):
                 if field in data:
                    setattr(listing, field, data[field])

        db.session.commit()
        return jsonify({'success': True, 'data': listing.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(f"Error updating listing {listing_id}: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@listing_bp.route('/<int:listing_id>/sell', methods=['POST'])
@login_required
def mark_listing_as_sold(listing_id):
    """
    POST /api/listings/<listing_id>/sell
    Marks a listing as sold and records the final price + impact event.
    Expects JSON: { "sold_price_kes": <number> }
    """
    try:
        listing = Listing.query.get_or_404(listing_id)
        user_id = getattr(g, 'current_user_id', None)

        if listing.user_id != user_id:
            return jsonify({'success': False, 'message': 'Forbidden'}), 403

        if listing.status == ListingStatus.SOLD:
            return jsonify({'success': False, 'message': 'Listing is already marked as sold'}), 400

        data = request.get_json()
        sold_price = data.get('sold_price_kes')

        if sold_price is None:
            return jsonify({'success': False, 'message': 'sold_price_kes is required'}), 400
        try:
            sold_price_val = float(sold_price)
            if sold_price_val < 0: raise ValueError()
        except (ValueError, TypeError):
             return jsonify({'success': False, 'message': 'Invalid sold_price_kes value'}), 400

        listing.status = ListingStatus.SOLD
        listing.sold_price_kes = sold_price_val
        db.session.add(listing)

        estimated_weight = estimate_item_weight(listing.title, listing.description or '', listing.category or 'Other')

        event_desc = f"Sold '{listing.title}' for {sold_price_val:.2f} KES"
        impact_event = create_impact_event(
            user_id=user_id,
            event_type="ITEM_SOLD", 
            category=(listing.category or 'Other'),
            description=event_desc,
            estimated_weight_kg=estimated_weight,
            money_saved_kes=sold_price_val
        )
        db.session.add(impact_event)

        db.session.commit()
        return jsonify({'success': True, 'data': listing.to_dict()}), 200

    except NotFound:
        return jsonify({'success': False, 'message': 'Listing not found'}), 404
    except Exception as e:
        current_app.logger.error(f"Error marking listing {listing_id} as sold: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@listing_bp.route('/<int:listing_id>', methods=['DELETE'])
@login_required
def delete_listing(listing_id):
    """ Deletes a listing. """
    try:
        listing = Listing.query.get_or_404(listing_id)
        if listing.user_id != getattr(g, 'current_user_id', None):
            return jsonify({'success': False, 'message': 'Forbidden'}), 403

        from app.services.supabase_service import delete_file_by_url
        for img in listing.images or []:
            try:
                # Attempt to delete the image from Supabase storage
                # delete_file_by_url will raise if it cannot determine the path or delete
                delete_file_by_url(img)
            except Exception as e:
                current_app.logger.warning(f"Failed to delete image {img}: {e}")

        db.session.delete(listing)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Listing deleted'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting listing {listing_id}: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500