from datetime import datetime
from app import db

class RepairGuide(db.Model):
    """
    Represents an AI-generated repair guide in the database.
    """
    __tablename__ = 'repair_guides'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        Serializes the RepairGuide object into a dictionary.
        """
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

