from datetime import datetime
from app import db


class Listing(db.Model):
	__tablename__ = 'listings'

	id = db.Column(db.Integer, primary_key=True)
	# FK to link a listing to its author (User)
	user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
	title = db.Column(db.String(200), nullable=False)
	price = db.Column(db.Float, nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)

	def to_dict(self):
		return {
			'id': self.id,
			'user_id': self.user_id,
			'title': self.title,
			'price': self.price,
			'created_at': self.created_at.isoformat() if self.created_at else None,
		}

