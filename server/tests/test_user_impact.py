import json
import time
import jwt
from datetime import datetime, timedelta

from app import create_app, db
from app.models.user import User
from app.models.user_impact_event import UserImpactEvent


def make_token(app, user_id):
    secret = app.config['SECRET_KEY']
    return jwt.encode({'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=1)}, secret, algorithm='HS256')


def test_user_impact_and_activity_endpoints():
    app = create_app()
    app.config['TESTING'] = True
    # Use an in-memory sqlite DB for isolation
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()

        # create a test user
        user = User(email='tester@example.com', password='password', name='Tester')
        db.session.add(user)
        db.session.commit()

        # create several impact events
        events = []
        for i in range(6):
            e = UserImpactEvent(
                user_id=user.id,
                event_type='LISTING' if i % 2 == 0 else 'GUIDE_SAVED',
                item_category='Electronics' if i % 3 == 0 else 'Furniture',
                description=f'Event {i}',
                weight_diverted_kg=1.5 + i,
                money_saved_kes=1000 + i * 10,
                created_at=datetime.utcnow() + timedelta(seconds=i)
            )
            db.session.add(e)
            events.append(e)
        db.session.commit()

        token = make_token(app, user.id)

        client = app.test_client()

        # call impact endpoint
        resp = client.get('/api/users/impact', headers={'Authorization': f'Bearer {token}'})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['success'] is True
        stats = data['stats']

        # According to new policy, only ITEM_SOLD events count toward impact totals.
        sold_events = [e for e in events if e.event_type == 'ITEM_SOLD']
        expected_items_saved = len(sold_events)
        expected_weight = sum(e.weight_diverted_kg for e in sold_events)
        expected_money = sum(e.money_saved_kes for e in sold_events)

        assert stats['items_saved'] == expected_items_saved
        assert abs(stats['weight_diverted'] - round(expected_weight, 2)) < 0.01
        assert abs(stats['money_saved'] - round(expected_money, 2)) < 0.01

        # call activity endpoint - should return 5 most recent events ordered desc
        resp2 = client.get('/api/users/activity', headers={'Authorization': f'Bearer {token}'})
        assert resp2.status_code == 200
        d2 = resp2.get_json()
        assert d2['success'] is True
        activity = d2['activity']
        assert len(activity) == 5
        # Ensure ordering: most recent first
        times = [datetime.fromisoformat(a['created_at']) for a in activity]
        assert all(times[i] >= times[i+1] for i in range(len(times)-1))


def test_deduplication_by_listing_id():
    """Ensure that when both a listing event and an ITEM_SOLD exist for the same listing_id,
    the aggregation uses the ITEM_SOLD weight (not double-counting)."""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()
        user = User(email='dedupe@example.com', password='pw', name='Dedupe')
        db.session.add(user)
        db.session.commit()

        # create a listing event (weight 2.0) and later an ITEM_SOLD for same listing_id (weight 3.5)
        e1 = UserImpactEvent(user_id=user.id, event_type='LISTING', item_category='Furniture', description='listed', weight_diverted_kg=2.0, money_saved_kes=0, listing_id=42)
        e2 = UserImpactEvent(user_id=user.id, event_type='ITEM_SOLD', item_category='Furniture', description='sold', weight_diverted_kg=3.5, money_saved_kes=500, listing_id=42)
        # also add an unrelated event without listing_id
        e3 = UserImpactEvent(user_id=user.id, event_type='GUIDE_SAVED', item_category='Books', description='guide', weight_diverted_kg=1.0, money_saved_kes=0)
        db.session.add_all([e1, e2, e3])
        db.session.commit()

        token = make_token(app, user.id)
        client = app.test_client()
        resp = client.get('/api/users/impact', headers={'Authorization': f'Bearer {token}'})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['success'] is True
        stats = data['stats']

        # weight should be: prefer ITEM_SOLD weight for listing_id 42 (3.5) + unrelated 1.0 = 4.5
        assert abs(stats['weight_diverted'] - 4.5) < 0.01
        # money_saved should be 500
        assert abs(stats['money_saved'] - 500) < 0.01
