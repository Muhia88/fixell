from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config 

# Initialize extensions
db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Creates and configures the main Flask application instance.
    This is the application factory function.
    """
    app = Flask(__name__)
    
    # Load configuration from the Config class
    app.config.from_object(config_class)

    # Initialize CORS for cross-origin requests (essential for front-end access)
    CORS(app)

    # Initialize extensions with the app
    db.init_app(app)

    # Optional main routes
    try:
        from app.routes.main_routes import main_bp
        app.register_blueprint(main_bp)
    except Exception:
        pass

    # Register other blueprints
    try:
        from app.routes.auth_routes import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
    except Exception:
        pass

    try:
        from app.routes.guide_routes import guide_bp
        # guide_bp may define its own routes; we mount it under /api/guides
        app.register_blueprint(guide_bp, url_prefix='/api/guides')
    except Exception:
        pass

    try:
        from app.routes.listing_routes import listing_bp
        app.register_blueprint(listing_bp, url_prefix='/api/listings')
    except Exception:
        pass

    try:
        from app.routes.support_routes import support_bp
        app.register_blueprint(support_bp, url_prefix='/api/support')
    except Exception:
        pass

    # Development helper: a non-auth generate endpoint to test AI integration quickly.
    # Only enabled when FLASK_ENV is not production.
    from app.services.ai_service import generate_repair_guide_content

    @app.route('/api/guides/generate_dev', methods=['POST'])
    def generate_dev():
        from flask import request, jsonify
        # Development-only helper endpoint (no auth) - always enabled for local testing.
        data = request.get_json() or {}
        description = data.get('description')
        if not description:
            return jsonify({'msg': 'description required'}), 400
        content = generate_repair_guide_content(description)
        if content.startswith('Error:'):
            return jsonify({'msg': content}), 500
        return jsonify({'guide': content}), 200

    # 2. Register other application blueprints (if available)
    # The 'main_routes' import from your earlier file is removed as it was likely a placeholder.

    # Ensure all models are imported so SQLAlchemy knows about them 
    # when db.create_all() is called in main.py
    from app.models import user, item, listing, repair_guide, support_ticket
    
    # Optional: Add a simple test route back
    @app.route('/test')
    def test_page():
        return '<h1>Fixell Flask Application Factory Pattern Operational</h1>'

    return app
