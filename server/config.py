import os
from dotenv import load_dotenv

# Establish the base directory to reliably find .env files
basedir = os.path.abspath(os.path.dirname(__file__))
# Load the default .env, then override with .env.local if present (local dev settings)
load_dotenv(os.path.join(basedir, '.env'))
load_dotenv(os.path.join(basedir, '.env.local'))


class Config:
    """
    Set Flask configuration variables from the .env file.
    This class makes the configuration clean and easy to manage.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-default-secret-key-for-dev'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

    # Parse ALLOW_DEV_GENERATE as boolean
    ALLOW_DEV_GENERATE = os.environ.get('ALLOW_DEV_GENERATE', 'false').lower() in ('1', 'true', 'yes')

