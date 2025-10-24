"""add listing_id to user_impact_events

Revision ID: b30119abec0a
Revises: 8b1f2c3d4e5f
Create Date: 2025-10-23 13:24:27.420620

"""
from alembic import op
import sqlalchemy as sa


revision = 'b30119abec0a'
down_revision = '8b1f2c3d4e5f'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user_impact_events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('listing_id', sa.Integer(), nullable=True))
        batch_op.alter_column('money_saved_kes',
               existing_type=sa.DOUBLE_PRECISION(precision=53),
               nullable=True)
        batch_op.create_index(batch_op.f('ix_user_impact_events_listing_id'), ['listing_id'], unique=False)
        batch_op.create_foreign_key(None, 'listings', ['listing_id'], ['id'])



def downgrade():
    with op.batch_alter_table('user_impact_events', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_user_impact_events_listing_id'))
        batch_op.alter_column('money_saved_kes',
               existing_type=sa.DOUBLE_PRECISION(precision=53),
               nullable=False)
        batch_op.drop_column('listing_id')

