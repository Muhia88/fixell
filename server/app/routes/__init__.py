import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # Import Flask-CORS

# 1. Globally define db instance (will be attached in create_app)
db = SQLAlchemy()

def create_app(config_class=None):
    """
    Application factory function to create and configure the Flask app.
    Initializes extensions and registers blueprints.
    """
    app = Flask(__name__)

    # Load configuration
    if config_class is None:
        from config import Config
        app.config.from_object(Config)
    else:
        app.config.from_object(config_class)

    # 2. Initialize extensions
    db.init_app(app)