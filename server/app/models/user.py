from app import db # Assuming 'db' is initialized in server/app/__init__.py
import bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    # Optional display name for the user
    name = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships (Optional, but good for structure)
    listings = db.relationship('Listing', backref='author', lazy='dynamic')
    repair_guides = db.relationship('RepairGuide', backref='author', lazy='dynamic')

    def __init__(self, email, password, name=None):
        self.email = email
        self.name = name
        self.set_password(password)

    def set_password(self, password):
        """Hashes the password and stores the hash."""
        # bcrypt expects bytes; store the salted hash as a utf-8 string
        if isinstance(password, str):
            password = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        # store as decoded string for DB compatibility
        self.password_hash = hashed.decode('utf-8')

    def check_password(self, password):
        """Checks the stored password hash against the provided password."""
        if isinstance(password, str):
            password = password.encode('utf-8')
        stored = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password, stored)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.email}>'

