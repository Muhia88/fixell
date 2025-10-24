from main import app

with app.app_context():
    from app import db
    print('DB engine:', db.engine)
