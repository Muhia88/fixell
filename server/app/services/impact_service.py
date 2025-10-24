from app.models.user_impact_event import UserImpactEvent
from flask import current_app

def create_impact_event(user_id, event_type, category, description,
                        estimated_weight_kg: float,
                        money_saved_kes=None, money_override=None, listing_id=None):
    """
    Creates and returns a new UserImpactEvent object.
    Money saved is now only provided for ITEM_SOLD events.
    The object is NOT yet added to the session.
    """
    final_money_saved = 0
    if event_type == "ITEM_SOLD":
        amount = money_saved_kes if money_saved_kes is not None else money_override
        if amount is not None:
            try:
                final_money_saved = float(amount)
            except (ValueError, TypeError):
                current_app.logger.warning(f"Invalid money value '{amount}' for ITEM_SOLD event.")
                final_money_saved = 0
        else:
            current_app.logger.warning("ITEM_SOLD event created without money value.")
            final_money_saved = 0
    else:
        if money_saved_kes is not None or money_override is not None:
            current_app.logger.warning(
                f"Ignored money value for non-ITEM_SOLD event_type '{event_type}': money_saved_kes={money_saved_kes}, money_override={money_override}"
            )
        final_money_saved = 0

    event = UserImpactEvent(
        user_id=user_id,
        event_type=event_type,
        item_category=category or 'Other',
        description=description,
        weight_diverted_kg=estimated_weight_kg,
        money_saved_kes=final_money_saved,
        listing_id=listing_id
    )

    return event