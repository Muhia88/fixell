import os
from dotenv import load_dotenv

# Determine the base directory for relative path calculation
basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables. Prefer .env.local for local development, fall back to .env
local_env = os.path.join(basedir, '.env.local')
default_env = os.path.join(basedir, '.env')
if os.path.exists(local_env):
    load_dotenv(local_env)
else:
    load_dotenv(default_env)

class Config:
    """Set Flask configuration variables from environment file."""

    # Core Settings
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Database Settings
    # Reads DATABASE_URL from environment; defaults to a local SQLite file if not set
    _db_url = os.environ.get('DATABASE_URL')
    if _db_url and _db_url.startswith('sqlite:///'):
        # Resolve relative sqlite paths to absolute paths based on basedir
        rel_path = _db_url.replace('sqlite:///', '', 1)
        if not os.path.isabs(rel_path):
            rel_path = os.path.join(basedir, rel_path)
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.abspath(rel_path)
    else:
        SQLALCHEMY_DATABASE_URI = _db_url or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
