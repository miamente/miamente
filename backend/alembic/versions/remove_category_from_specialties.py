"""remove category from specialties

Revision ID: remove_category_specialties
Revises: 0980bffbdccc
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'remove_category_specialties'
down_revision = '0980bffbdccc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove the category column from specialties table
    op.drop_column('specialties', 'category')


def downgrade() -> None:
    # Add the category column back to specialties table
    op.add_column('specialties', sa.Column('category', sa.String(length=100), nullable=True))
