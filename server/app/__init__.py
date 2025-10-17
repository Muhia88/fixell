from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config 

db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Creates and configures the main Flask application instance.
    This is the application factory function.
    """
    app = Flask(__name__)
    
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    db.init_app(app)

    try:
        from app.routes.main_routes import main_bp
        app.register_blueprint(main_bp)
    except Exception:
        pass
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

    from app.models import user, item, listing, repair_guide, support_ticket
    
    @app.route('/test')
    def test_page():
        return '<h1>Fixell Flask Application Factory Pattern Operational</h1>'

    return app
