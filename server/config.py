import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))
load_dotenv(os.path.join(basedir, '.env.local'))


class Config:
    """
    Set Flask configuration variables from the .env file.
    This class makes the configuration clean and easy to manage.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-default-secret-key-for-dev'
    
    # Require DATABASE_URL (Postgres) in production. Using Supabase Postgres is expected.
    _db_url = os.environ.get('DATABASE_URL')
    if not _db_url:
        raise RuntimeError('DATABASE_URL must be set in environment (e.g. in .env.local)')
    SQLALCHEMY_DATABASE_URI = _db_url
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # OpenAI API key
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    # Default models for OpenAI (adjust as needed). Use a chat-capable model for chat.
    OPENAI_CHAT_MODEL = os.environ.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
    # Enable an environment-gated model listing endpoint during development for diagnostics
    ENABLE_AI_MODEL_LISTING = os.environ.get('ENABLE_AI_MODEL_LISTING', 'true').lower() in ('1', 'true', 'yes')

    ALLOW_DEV_GENERATE = os.environ.get('ALLOW_DEV_GENERATE', 'false').lower() in ('1', 'true', 'yes')

