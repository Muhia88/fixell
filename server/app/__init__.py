from flask import Flask
import os
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config 
from flask_migrate import Migrate

db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Creates and configures the main Flask application instance.
    This is the application factory function.
    """
    app = Flask(__name__)
    
    app.config.from_object(config_class)

    CORS(app,
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

    @app.after_request
    def _add_cors_headers(response):
        response.headers.setdefault('Access-Control-Allow-Origin', '*')
        response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
        response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response

    db.init_app(app)
    migrate = Migrate(app, db)

    try:
        from app.routes.auth_routes import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
    except Exception:
        pass

    try:
        from app.routes.guide_routes import guide_bp
        app.register_blueprint(guide_bp, url_prefix='/api/guides')
    except Exception:
        pass

    try:
        from app.routes.listing_routes import listing_bp
        app.register_blueprint(listing_bp, url_prefix='/api/listings')
    except Exception:
        pass

    try:
        from app.routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api/users')
    except Exception:
        pass

    try:
        from app.routes.support_routes import support_bp
        app.register_blueprint(support_bp, url_prefix='/api/support')
    except Exception:
        pass

    from app.services.ai_service import generate_repair_guide_content

    @app.route('/api/guides/generate_dev', methods=['POST'])
    def generate_dev():
        from flask import request, jsonify
        data = request.get_json() or {}
        description = data.get('description')
        if not description:
            return jsonify({'msg': 'description required'}), 400
        content = generate_repair_guide_content(description)
        if content.startswith('Error:'):
            return jsonify({'msg': content}), 500
        return jsonify({'guide': content}), 200

    from app.models import user, item, listing, repair_guide, support_ticket, user_impact_event, conversation, conversation_message, saved_guide
    
    @app.route('/test')
    def test_page():
        return '<h1>Fixell Flask Application Factory Pattern Operational</h1>'

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        upload_folder = os.path.join(app.instance_path, 'uploads')
        return send_from_directory(upload_folder, filename)

    return app