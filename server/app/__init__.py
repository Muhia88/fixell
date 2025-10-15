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

    # Import and register Blueprints for routes
    
    # 1. Register the Authentication Blueprint (Handles /api/auth/register, etc.)
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

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
