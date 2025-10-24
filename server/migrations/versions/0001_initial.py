"""initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2025-10-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=120), nullable=False, unique=True, index=True),
        sa.Column('name', sa.String(length=120), nullable=True),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

    op.create_table('listings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('condition', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=120), nullable=True),
        sa.Column('images', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
    )
    op.create_foreign_key('fk_listings_user_id_users', 'listings', 'users', ['user_id'], ['id'])

    op.create_table('items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

    op.create_table('repair_guides',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )
    op.create_foreign_key('fk_repair_guides_user_id_users', 'repair_guides', 'users', ['user_id'], ['id'])

    op.create_table('saved_guides',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('guide_content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )

    op.create_table('support_tickets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('subject', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), server_default=sa.text("'open'")),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )


def downgrade():
    op.drop_table('support_tickets')
    op.drop_table('saved_guides')
    op.drop_constraint('fk_repair_guides_user_id_users', 'repair_guides', type_='foreignkey')
    op.drop_table('repair_guides')
    op.drop_constraint('fk_listings_user_id_users', 'listings', type_='foreignkey')
    op.drop_table('listings')
    op.drop_table('items')
    op.drop_table('users')
