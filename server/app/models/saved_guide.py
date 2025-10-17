from datetime import datetime
from app import db


class SavedGuide(db.Model):
    __tablename__ = 'saved_guides'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    guide_content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'guide_content': self.guide_content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
