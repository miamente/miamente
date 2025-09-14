"""rename_therapy_approaches_to_therapy_approaches_ids

Revision ID: 1bba2b9d27de
Revises: 8748af3a6548
Create Date: 2025-09-13 16:06:57.936472

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1bba2b9d27de'
down_revision = '8748af3a6548'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename therapy_approaches column to therapy_approaches_ids
    op.alter_column('professionals', 'therapy_approaches', new_column_name='therapy_approaches_ids')


def downgrade() -> None:
    # Rename therapy_approaches_ids column back to therapy_approaches
    op.alter_column('professionals', 'therapy_approaches_ids', new_column_name='therapy_approaches')
