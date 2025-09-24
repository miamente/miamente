"""add_role_field_to_users_only

Revision ID: 3497d9a23d34
Revises: 766d68015e08
Create Date: 2025-09-22 00:16:28.856543

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3497d9a23d34'
down_revision = '766d68015e08'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the enum type if it doesn't exist
    user_role_enum = sa.Enum('USER', 'ADMIN', name='userrole')
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    # Add the role column with default value
    op.add_column('users', sa.Column('role', user_role_enum, nullable=False, server_default='USER'))


def downgrade() -> None:
    # Drop the role column
    op.drop_column('users', 'role')
    
    # Drop the enum type
    user_role_enum = sa.Enum('USER', 'ADMIN', name='userrole')
    user_role_enum.drop(op.get_bind())
