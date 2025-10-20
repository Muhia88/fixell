from flask import Blueprint, jsonify, request
from app.models.listing import Listing
from app import db
import os
from werkzeug.utils import secure_filename
import uuid
from flask import current_app
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from flask import g
from app.utils.auth import login_required

listing_bp = Blueprint("listing_bp", __name__)

@listing_bp.route("/", methods=["GET"])
def get_listings():
    """
    GET /api/listings?page=1&limit=10
    Returns a paginated list of listings.
    """
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        user_id = request.args.get("user_id")

        query = Listing.query.order_by(Listing.created_at.desc())
        if user_id:
            try:
                uid = int(user_id)
                query = query.filter_by(user_id=uid)
            except ValueError:
                return jsonify({"success": False, "message": "user_id must be an integer"}), 400
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


@listing_bp.route('/', methods=['POST'])
@login_required
def create_listing():
    """
    POST /api/listings/
    Accepts multipart/form-data with fields: title, description, price, category, condition, location, user_id
    and files under "images" (multiple).
    Saves images to instance/uploads and stores relative paths in the images JSON column.
    """
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        price = request.form.get('price')
        category = request.form.get('category')
        condition = request.form.get('condition')
        location = request.form.get('location')
        # basic validation for title/price
        if not title or not price:
            return jsonify({'success': False, 'message': 'title and price are required'}), 400

        # authenticated user id injected by decorator
        auth_user_id = getattr(g, 'current_user_id', None)
        if not auth_user_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401

        try:
            price_val = float(price)
        except ValueError:
            return jsonify({'success': False, 'message': 'price must be a number'}), 400

        images_saved = []
        files = request.files.getlist('images')
        from app.services.supabase_service import upload_file, public_url
        for fh in files:
            if fh and fh.filename:
                filename = secure_filename(fh.filename)
                unique_name = f"{uuid.uuid4().hex}_{filename}"
                # Use a folder per user for organization
                auth_user_id = getattr(g, 'current_user_id', 'anon')
                dest_path = f"uploads/{auth_user_id}/{unique_name}"
                # read file bytes
                fh.stream.seek(0)
                data = fh.read()
                # upload to supabase storage
                try:
                    pub = upload_file(data, dest_path, content_type=fh.mimetype)
                except Exception as e:
                    current_app.logger.error('Supabase upload failed: %s', e)
                    raise
                images_saved.append(pub)

        listing = Listing(
            title=title,
            description=description,
            price=price_val,
            category=category,
            condition=condition,
            location=location,
            images=images_saved,
            user_id=int(auth_user_id)
        )

        db.session.add(listing)
        db.session.commit()

        return jsonify({'success': True, 'data': listing.to_dict()}), 201

    except Exception as e:
        print('Error creating listing:', e)
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@listing_bp.route('/<int:listing_id>', methods=['PUT'])
@login_required
def update_listing(listing_id):
    try:
        listing = Listing.query.get_or_404(listing_id)
        # ownership check
        from flask import g
        if listing.user_id != getattr(g, 'current_user_id', None):
            return jsonify({'success': False, 'message': 'Forbidden'}), 403

        # Support both JSON and multipart/form-data for updates
        content_type = request.content_type or ''
        # fields to update
        if content_type.startswith('multipart/form-data'):
            form = request.form
            files = request.files.getlist('images')
            remove_images_raw = form.get('remove_images')
            remove_images = []
            if remove_images_raw:
                try:
                    import json as _json
                    remove_images = _json.loads(remove_images_raw)
                except Exception:
                    remove_images = []

            # update basic fields from form
            for field in ('title', 'description', 'price', 'category', 'condition', 'location'):
                if field in form:
                    val = form.get(field)
                    # cast price
                    if field == 'price' and val is not None:
                        try:
                            val = float(val)
                        except Exception:
                            pass
                    setattr(listing, field, val)

            # handle image removals
            if remove_images:
                current_imgs = listing.images or []
                remaining = [img for img in current_imgs if img not in remove_images]
                # delete files for removed images (handle both supabase urls and local paths)
                from app.services.supabase_service import delete_file_by_url
                for img in remove_images:
                    try:
                        if isinstance(img, str) and img.startswith('/uploads/'):
                            # local file path - delete from instance uploads
                            upload_folder = os.path.join(current_app.instance_path, 'uploads')
                            fname = img.split('/uploads/', 1)[1]
                            fp = os.path.join(upload_folder, fname)
                            if os.path.exists(fp):
                                os.remove(fp)
                        elif isinstance(img, str) and img.startswith('http'):
                            # supabase hosted image
                            delete_file_by_url(img)
                    except Exception as e:
                        current_app.logger.warning('Failed to delete image %s: %s', img, e)
                listing.images = remaining

            # handle new uploaded files
            if files:
                from app.services.supabase_service import upload_file
                for fh in files:
                    if fh and fh.filename:
                        filename = secure_filename(fh.filename)
                        unique_name = f"{uuid.uuid4().hex}_{filename}"
                        auth_user_id = getattr(g, 'current_user_id', 'anon')
                        dest_path = f"uploads/{auth_user_id}/{unique_name}"
                        fh.stream.seek(0)
                        data = fh.read()
                        try:
                            pub = upload_file(data, dest_path, content_type=fh.mimetype)
                        except Exception as e:
                            current_app.logger.error('Supabase upload failed: %s', e)
                            raise
                        imgs = listing.images or []
                        imgs.append(pub)
                        listing.images = imgs

        else:
            data = request.get_json() or {}
            # allow updating only some fields
            for field in ('title', 'description', 'price', 'category', 'condition', 'location'):
                if field in data:
                    setattr(listing, field, data[field])

            # support removing images via JSON key
            remove_images = data.get('remove_images') or []
            if remove_images:
                current_imgs = listing.images or []
                remaining = [img for img in current_imgs if img not in remove_images]
                upload_folder = os.path.join(current_app.instance_path, 'uploads')
                for img in remove_images:
                    if isinstance(img, str) and img.startswith('/uploads/'):
                        fname = img.split('/uploads/', 1)[1]
                        fp = os.path.join(upload_folder, fname)
                        try:
                            if os.path.exists(fp):
                                os.remove(fp)
                        except Exception as e:
                            print('Warning: failed to remove file', fp, e)
                listing.images = remaining

        db.session.commit()
        return jsonify({'success': True, 'data': listing.to_dict()}), 200
    except Exception as e:
        print('Error updating listing:', e)
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@listing_bp.route('/<int:listing_id>', methods=['DELETE'])
@login_required
def delete_listing(listing_id):
    try:
        listing = Listing.query.get_or_404(listing_id)
        from flask import g
        if listing.user_id != getattr(g, 'current_user_id', None):
            return jsonify({'success': False, 'message': 'Forbidden'}), 403

        # delete image files associated with listing (Supabase or local)
        from app.services.supabase_service import delete_file_by_url
        for img in listing.images or []:
            try:
                if isinstance(img, str) and img.startswith('/uploads/'):
                    fname = img.split('/uploads/', 1)[1]
                    fp = os.path.join(current_app.instance_path, 'uploads', fname)
                    if os.path.exists(fp):
                        os.remove(fp)
                elif isinstance(img, str) and img.startswith('http'):
                    delete_file_by_url(img)
            except Exception as e:
                current_app.logger.warning('Failed to delete image for listing %s: %s', img, e)

        db.session.delete(listing)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Listing deleted'}), 200
    except Exception as e:
        print('Error deleting listing:', e)
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
