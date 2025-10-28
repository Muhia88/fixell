import pytest
from app import create_app, db
from config import Config
from datetime import datetime, timedelta


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    DEBUG = False


@pytest.fixture(scope='function')
def app():
    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


def make_token(app, user_id):
    import jwt
    secret = app.config.get('SECRET_KEY', 'test-secret')
    return jwt.encode({'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=1)}, secret, algorithm='HS256')
