"""add_updated_at_to_professional_therapeutic_approaches

Revision ID: 0c5b9189e003
Revises: 3497d9a23d34
Create Date: 2025-09-23 23:00:01.832129

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0c5b9189e003'
down_revision = '3497d9a23d34'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add updated_at column to professional_therapeutic_approaches table
    op.add_column('professional_therapeutic_approaches', 
                  sa.Column('updated_at', sa.DateTime(timezone=True), 
                           server_default=sa.text('CURRENT_TIMESTAMP'),
                           nullable=False))


def downgrade() -> None:
    # Remove updated_at column from professional_therapeutic_approaches table
    op.drop_column('professional_therapeutic_approaches', 'updated_at')
