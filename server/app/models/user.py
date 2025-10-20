from app import db 
import bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships 
    listings = db.relationship('Listing', backref='author', lazy='dynamic')
    repair_guides = db.relationship('RepairGuide', backref='author', lazy='dynamic')

    def __init__(self, email, password=None, name=None):
        self.email = email
        self.name = name
        if password:
            self.set_password(password)
        else:
            self.password_hash = ''

    # Prevent reading plaintext password
    @property
    def password(self):
        raise AttributeError("Password is write-only")

    @password.setter
    def password(self, plain):
        self.set_password(plain)

    def set_password(self, password):
        """Hashes the password with bcrypt and stores the hash (utf-8 string)."""
        if password is None:
            self.password_hash = ''
            return
        if isinstance(password, str):
            password = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        self.password_hash = hashed.decode('utf-8')

    def check_password(self, password):
        """Verify provided plaintext password against stored bcrypt hash."""
        if not self.password_hash:
            return False
        if isinstance(password, str):
            password = password.encode('utf-8')
        try:
            return bcrypt.checkpw(password, self.password_hash.encode('utf-8'))
        except ValueError:
            return False

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<User {self.email}>'