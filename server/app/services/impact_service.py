from app.models.user_impact_event import UserImpactEvent


MONEY_ESTIMATES_KES = {
    'GUIDE_SAVED': 25.0 * 130, 
}

def create_impact_event(user_id, event_type, category, description,
                        estimated_weight_kg: float, 
                        money_override=None):
    """
    Creates and returns a new UserImpactEvent object using KES.
    The object is NOT yet added to the session.
    """

    if money_override is not None:
        money_saved = money_override
    else:
        money_saved = MONEY_ESTIMATES_KES.get(event_type, 0)

    event = UserImpactEvent(
        user_id=user_id,
        event_type=event_type,
        item_category=category or 'Other',
        description=description,
        weight_diverted_kg=estimated_weight_kg, 
        money_saved_kes=money_saved 
    )

    return event