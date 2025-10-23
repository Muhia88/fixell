from datetime import datetime
from app import db
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy import Column, String, Enum 
from sqlalchemy.sql import func
import enum 

class ListingStatus(enum.Enum):
    ACTIVE = 'active'
    SOLD = 'sold'

class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False) 
    category = db.Column(db.String(50))
    condition = db.Column(db.String(50))
    location = db.Column(db.String(120))
    images = db.Column(JSON, default=list)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(Enum(ListingStatus, values_callable=lambda obj: [e.value for e in obj]),
                       default=ListingStatus.ACTIVE, nullable=False)
    sold_price_kes = db.Column(db.Float, nullable=True) 


    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "category": self.category,
            "condition": self.condition,
            "location": self.location,
            "images": self.images or [],
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status.value if self.status else None, 
            "sold_price_kes": self.sold_price_kes,
        }