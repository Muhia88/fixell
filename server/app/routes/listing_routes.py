from flask import Blueprint, jsonify, request
from app.models.listing import Listing
from app import db

listing_bp = Blueprint("listing_bp", __name__, url_prefix="/api/listings")

@listing_bp.route("/", methods=["GET"])
def get_listings():
    """
    GET /api/listings?page=1&limit=10
    Returns a paginated list of listings.
    """
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        query = Listing.query.order_by(Listing.created_at.desc())
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
        print("Error:", e)
        return jsonify({"success": False, "message": str(e)}), 500
