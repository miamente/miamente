"""Initial migration - create all base tables

Revision ID: 8896a8b86d20
Revises: c46f93734469
Create Date: 2025-09-18 12:50:38.215577

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8896a8b86d20'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('emergency_contact', sa.String(length=255), nullable=True),
        sa.Column('emergency_phone', sa.String(length=20), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create professionals table
    op.create_table('professionals',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone_country_code', sa.String(length=5), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('rate_cents', sa.Integer(), nullable=True),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('certifications', sa.Text(), nullable=True),
        sa.Column('languages', sa.Text(), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create specialties table (legacy)
    op.create_table('specialties',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create specialties_new table
    op.create_table('specialties_new',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create modalities table
    op.create_table('modalities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create therapeutic_approaches table
    op.create_table('therapeutic_approaches',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create professional_specialties table (legacy)
    op.create_table('professional_specialties',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('professional_id', sa.UUID(), nullable=False),
        sa.Column('specialty_id', sa.UUID(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price_cents', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.String(length=255), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.ForeignKeyConstraint(['specialty_id'], ['specialties.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create professional_specialties_new table
    op.create_table('professional_specialties_new',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('professional_id', sa.UUID(), nullable=False),
        sa.Column('specialty_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.String(length=255), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.ForeignKeyConstraint(['specialty_id'], ['specialties_new.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create professional_modalities table
    op.create_table('professional_modalities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('professional_id', sa.UUID(), nullable=False),
        sa.Column('modality_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['modality_id'], ['modalities.id'], ),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create professional_therapeutic_approaches table
    op.create_table('professional_therapeutic_approaches',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('professional_id', sa.UUID(), nullable=False),
        sa.Column('therapeutic_approach_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.ForeignKeyConstraint(['therapeutic_approach_id'], ['therapeutic_approaches.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create availability table
    op.create_table('availability',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('professional_id', sa.UUID(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('is_available', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('availability')
    op.drop_table('professional_therapeutic_approaches')
    op.drop_table('professional_modalities')
    op.drop_table('professional_specialties_new')
    op.drop_table('professional_specialties')
    op.drop_table('therapeutic_approaches')
    op.drop_table('modalities')
    op.drop_table('specialties_new')
    op.drop_table('specialties')
    op.drop_table('professionals')
    op.drop_table('users')
