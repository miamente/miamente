"""remove_old_specialty_fields

Revision ID: cc73aa9773bd
Revises: 1bba2b9d27de
Create Date: 2025-09-13 16:10:46.852945

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cc73aa9773bd'
down_revision = '1bba2b9d27de'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove old specialty fields
    op.drop_column('professionals', 'specialty')
    op.drop_column('professionals', 'specialty_id')


def downgrade() -> None:
    # Add back old specialty fields
    op.add_column('professionals', sa.Column('specialty', sa.String(255), nullable=False, server_default=''))
    op.add_column('professionals', sa.Column('specialty_id', sa.UUID(as_uuid=True), nullable=True))
