"""add_new_mental_health_models

Revision ID: 6a6ff3d91c90
Revises: b99e5b6a4145
Create Date: 2025-09-12 23:16:55.075115

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6a6ff3d91c90'
down_revision = 'b99e5b6a4145'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create modalities table
    op.create_table('modalities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('default_price_cents', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create therapeutic_approaches table
    op.create_table('therapeutic_approaches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create specialties_new table
    op.create_table('specialties_new',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create professional_therapeutic_approaches table
    op.create_table('professional_therapeutic_approaches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('therapeutic_approach_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.ForeignKeyConstraint(['therapeutic_approach_id'], ['therapeutic_approaches.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create professional_modalities table
    op.create_table('professional_modalities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('modality_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price_cents', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['modality_id'], ['modalities.id'], ),
        sa.ForeignKeyConstraint(['professional_id'], ['professionals.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Update professional_specialties_new foreign key
    op.drop_constraint('professional_specialties_new_specialty_id_fkey', 'professional_specialties_new', type_='foreignkey')
    op.create_foreign_key(None, 'professional_specialties_new', 'specialties_new', ['specialty_id'], ['id'])


def downgrade() -> None:
    # Revert professional_specialties_new foreign key
    op.drop_constraint(None, 'professional_specialties_new', type_='foreignkey')
    op.create_foreign_key('professional_specialties_new_specialty_id_fkey', 'professional_specialties_new', 'specialties', ['specialty_id'], ['id'])
    
    # Drop new tables
    op.drop_table('professional_modalities')
    op.drop_table('professional_therapeutic_approaches')
    op.drop_table('specialties_new')
    op.drop_table('therapeutic_approaches')
    op.drop_table('modalities')