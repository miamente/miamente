"""Remove education field from professionals table

Revision ID: 0002
Revises: 0001
Create Date: 2025-01-09 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    """Remove education column from professionals table."""
    # Drop the education column
    op.drop_column('professionals', 'education')


def downgrade():
    """Add education column back to professionals table."""
    # Add the education column back
    op.add_column('professionals', sa.Column('education', sa.Text(), nullable=True))
