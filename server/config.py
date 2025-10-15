import os
from dotenv import load_dotenv

# Determine the base directory for relative path calculation
basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from the .env file located in the basedir
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    """Set Flask configuration variables from environment file."""

    # Core Settings
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Database Settings
    # Reads DATABASE_URL from environment; defaults to a local SQLite file if not set
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
