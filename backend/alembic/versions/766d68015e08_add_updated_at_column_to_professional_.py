"""add updated_at column to professional_specialties table

Revision ID: 766d68015e08
Revises: 0f9103bfe8bf
Create Date: 2025-09-20 11:19:19.807640

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '766d68015e08'
down_revision = '0f9103bfe8bf'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add updated_at column to professional_specialties table
    op.add_column('professional_specialties', 
                  sa.Column('updated_at', sa.DateTime(timezone=True), 
                           server_default=sa.text('CURRENT_TIMESTAMP'), 
                           onupdate=sa.text('CURRENT_TIMESTAMP'), 
                           nullable=False))


def downgrade() -> None:
    # Remove updated_at column from professional_specialties table
    op.drop_column('professional_specialties', 'updated_at')
