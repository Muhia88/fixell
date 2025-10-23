from datetime import datetime
from app import db
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy import Column
from sqlalchemy.sql import func

class UserImpactEvent(db.Model):
    __tablename__ = "user_impact_events"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    event_type = db.Column(db.String(50), nullable=False, index=True)
    item_category = db.Column(db.String(50), nullable=False, default='Other')
    description = db.Column(db.String(255), nullable=True)
    weight_diverted_kg = db.Column(db.Float, nullable=False, default=0)
    money_saved_kes = db.Column(db.Float, nullable=True, default=0)
    listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('impact_events', lazy='dynamic'))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_type": self.event_type,
            "item_category": self.item_category,
            "description": self.description,
            "weight_diverted_kg": self.weight_diverted_kg,
            "money_saved_kes": self.money_saved_kes,
            "listing_id": self.listing_id,
            "created_at": self.created_at.isoformat(),
        }