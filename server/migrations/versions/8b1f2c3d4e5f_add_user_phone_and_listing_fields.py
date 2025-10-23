"""add user phone_number and listing status/sold_price

Revision ID: 8b1f2c3d4e5f
Revises: 2a8c0d3e1f4b
Create Date: 2025-10-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '8b1f2c3d4e5f'
down_revision = '2a8c0d3e1f4b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('phone_number', sa.String(length=20), nullable=True))
        try:
            batch_op.create_unique_constraint('uq_users_phone_number', ['phone_number'])
        except Exception:
            pass

    listing_status = postgresql.ENUM('active', 'sold', name='listingstatus')
    listing_status.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table('listings') as batch_op:
        batch_op.add_column(sa.Column('status', sa.Enum(name='listingstatus'), nullable=False, server_default='active'))
        batch_op.add_column(sa.Column('sold_price_kes', sa.Float(), nullable=True))


def downgrade():
    with op.batch_alter_table('listings') as batch_op:
        batch_op.drop_column('sold_price_kes')
        try:
            batch_op.drop_column('status')
        except Exception:
            pass

    listing_status = postgresql.ENUM('active', 'sold', name='listingstatus')
    listing_status.drop(op.get_bind(), checkfirst=True)

    with op.batch_alter_table('users') as batch_op:
        try:
            batch_op.drop_constraint('uq_users_phone_number', type_='unique')
        except Exception:
            pass
        batch_op.drop_column('phone_number')
