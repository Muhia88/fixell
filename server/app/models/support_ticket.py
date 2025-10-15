from datetime import datetime
from app import db


class SupportTicket(db.Model):
	__tablename__ = 'support_tickets'

	id = db.Column(db.Integer, primary_key=True)
	subject = db.Column(db.String(200), nullable=False)
	message = db.Column(db.Text, nullable=True)
	status = db.Column(db.String(32), default='open')
	created_at = db.Column(db.DateTime, default=datetime.utcnow)

	def to_dict(self):
		return {
			'id': self.id,
			'subject': self.subject,
			'message': self.message,
			'status': self.status,
			'created_at': self.created_at.isoformat() if self.created_at else None,
		}

