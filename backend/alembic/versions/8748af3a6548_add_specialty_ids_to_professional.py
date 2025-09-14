"""add_specialty_ids_to_professional

Revision ID: 8748af3a6548
Revises: 0dfbc50efd80
Create Date: 2025-09-13 15:59:20.723284

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8748af3a6548'
down_revision = '0dfbc50efd80'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add specialty_ids column to professionals table
    op.add_column('professionals', sa.Column('specialty_ids', sa.ARRAY(sa.String()), nullable=True))


def downgrade() -> None:
    # Remove specialty_ids column from professionals table
    op.drop_column('professionals', 'specialty_ids')
