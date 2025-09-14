"""add_phone_separate_fields

Revision ID: c46f93734469
Revises: cc73aa9773bd
Create Date: 2025-09-13 20:34:07.651340

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c46f93734469'
down_revision = 'cc73aa9773bd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add phone_country_code and phone_number columns to professionals table
    op.add_column('professionals', sa.Column('phone_country_code', sa.String(length=10), nullable=True))
    op.add_column('professionals', sa.Column('phone_number', sa.String(length=20), nullable=True))


def downgrade() -> None:
    # Remove phone_country_code and phone_number columns from professionals table
    op.drop_column('professionals', 'phone_number')
    op.drop_column('professionals', 'phone_country_code')
