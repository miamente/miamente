"""Create all tables matching current models

Revision ID: 9eb63f5a9477
Revises: 
Create Date: 2025-09-18 13:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9eb63f5a9477'
down_revision = None
branch_labels = None
depends_on = None

# Constants
NOW_FUNCTION = 'now()'
PROFESSIONALS_ID_REF = 'professionals.id'


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('profile_picture', sa.Text(), nullable=True),
        sa.Column('date_of_birth', sa.DateTime(), nullable=True),
        sa.Column('emergency_contact', sa.String(length=255), nullable=True),
        sa.Column('emergency_phone', sa.String(length=20), nullable=True),
        sa.Column('preferences', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # Create professionals table
    op.create_table('professionals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('phone_country_code', sa.String(length=10), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('profile_picture', sa.Text(), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('rate_cents', sa.Integer(), nullable=False),
        sa.Column('custom_rate_cents', sa.Integer(), nullable=True),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('academic_experience', sa.Text(), nullable=True),
        sa.Column('work_experience', sa.Text(), nullable=True),
        sa.Column('certifications', sa.Text(), nullable=True),
        sa.Column('languages', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('therapy_approaches_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('specialty_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('working_hours', sa.Text(), nullable=True),
        sa.Column('emergency_contact', sa.String(length=255), nullable=True),
        sa.Column('emergency_phone', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_professionals_email'), 'professionals', ['email'], unique=False)

    # Create specialties table
    op.create_table('specialties',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.String(length=255), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )


    # Create modalities table
    op.create_table('modalities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('default_price_cents', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create therapeutic_approaches table
    op.create_table('therapeutic_approaches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.String(length=255), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create professional_specialties table
    op.create_table('professional_specialties',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('specialty_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.String(length=255), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], [PROFESSIONALS_ID_REF], ),
        sa.ForeignKeyConstraint(['specialty_id'], ['specialties.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


    # Create professional_modalities table
    op.create_table('professional_modalities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('modality_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('modality_name', sa.String(length=255), nullable=False),
        sa.Column('virtual_price', sa.Integer(), nullable=False),
        sa.Column('presencial_price', sa.Integer(), nullable=False),
        sa.Column('offers_presencial', sa.Boolean(), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['modality_id'], ['modalities.id'], ),
        sa.ForeignKeyConstraint(['professional_id'], [PROFESSIONALS_ID_REF], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create professional_therapeutic_approaches table
    op.create_table('professional_therapeutic_approaches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('therapeutic_approach_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text(NOW_FUNCTION), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], [PROFESSIONALS_ID_REF], ),
        sa.ForeignKeyConstraint(['therapeutic_approach_id'], ['therapeutic_approaches.id'], ),
        sa.PrimaryKeyConstraint('id')
    )



def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('professional_therapeutic_approaches')
    op.drop_table('professional_modalities')
    op.drop_table('professional_specialties')
    op.drop_table('therapeutic_approaches')
    op.drop_table('modalities')
    op.drop_table('specialties')
    op.drop_table('professionals')
    op.drop_table('users')
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS slotstatus')