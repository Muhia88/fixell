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
    
    _db_url = os.environ.get('DATABASE_URL')
    if _db_url and _db_url.startswith('sqlite:///'):
        rel = _db_url.replace('sqlite:///', '', 1)
        if not os.path.isabs(rel):
            rel = os.path.join(basedir, rel)
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.abspath(rel)
    else:
        SQLALCHEMY_DATABASE_URI = _db_url or 'sqlite:///' + os.path.join(basedir, 'app.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    ALLOW_DEV_GENERATE = os.environ.get('ALLOW_DEV_GENERATE', 'false').lower() in ('1', 'true', 'yes')

