from app import db # Assuming 'db' is initialized in server/app/__init__.py
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships (Optional, but good for structure)
    listings = db.relationship('Listing', backref='author', lazy='dynamic')
    repair_guides = db.relationship('RepairGuide', backref='author', lazy='dynamic')

    def __init__(self, email, password):
        self.email = email
        self.set_password(password)

    def set_password(self, password):
        """Hashes the password and stores the hash."""
        # Note: Werkzeug's security module uses bcrypt by default, which is good practice.
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks the stored password hash against the provided password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.email}>'

