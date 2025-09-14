"""populate_initial_mental_health_data

Revision ID: 0dfbc50efd80
Revises: 6a6ff3d91c90
Create Date: 2025-09-12 23:20:15.075115

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# Define the constants directly in the migration to avoid import issues
MENTAL_HEALTH_SPECIALTIES = [
    "Psiquiatría",
    "Psicología clínica", 
    "Psicología educativa",
    "Psicología organizacional/ocupacional",
    "Psicología de la salud",
    "Psicología del deporte",
    "Neuropsicología",
    "Psicopedagogía",
    "Trabajo social clínico",
    "Consejería/Orientación psicológica",
]

THERAPEUTIC_APPROACHES = [
    "Cognitivo-conductual (TCC)",
    "Terapias de tercera generación (ACT, DBT, Mindfulness, etc.)",
    "Psicoanalítico / Psicodinámico",
    "Humanista (Rogers, Gestalt, Logoterapia, etc.)",
    "Sistémico / Familiar",
    "Integrativo (combinación de enfoques)",
    "Conductual puro",
    "Analítico-existencial",
    "Psicoterapia breve",
    "Narrativa",
    "Coaching psicológico (en algunos contextos, como acompañamiento no clínico)",
]

INTERVENTION_MODALITIES = [
    {
        "name": "Individual",
        "description": "Sesiones de terapia individual",
        "category": "Formato",
        "default_price_cents": 80000,
    },
    {
        "name": "Pareja",
        "description": "Terapia de pareja",
        "category": "Formato",
        "default_price_cents": 120000,
    },
    {
        "name": "Familiar",
        "description": "Terapia familiar",
        "category": "Formato", 
        "default_price_cents": 100000,
    },
    {
        "name": "Infantil",
        "description": "Terapia para niños",
        "category": "Población",
        "default_price_cents": 90000,
    },
    {
        "name": "Adolescente",
        "description": "Terapia para adolescentes",
        "category": "Población",
        "default_price_cents": 85000,
    },
    {
        "name": "Adultos mayores",
        "description": "Terapia para adultos mayores",
        "category": "Población",
        "default_price_cents": 90000,
    },
    {
        "name": "Grupal",
        "description": "Terapia grupal",
        "category": "Formato",
        "default_price_cents": 60000,
    },
    {
        "name": "Intervenciones breves / de crisis",
        "description": "Intervenciones de emergencia y crisis",
        "category": "Contexto",
        "default_price_cents": 100000,
    },
    {
        "name": "Psicoeducación (charlas, talleres, acompañamiento no clínico)",
        "description": "Charlas, talleres y acompañamiento no clínico",
        "category": "Contexto",
        "default_price_cents": 50000,
    },
]

# revision identifiers, used by Alembic.
revision = '0dfbc50efd80'
down_revision = '6a6ff3d91c90'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get table objects
    specialties_table = sa.table('specialties_new',
        sa.column('id', postgresql.UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('category', sa.String),
    )
    
    therapeutic_approaches_table = sa.table('therapeutic_approaches',
        sa.column('id', postgresql.UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('description', sa.Text),
        sa.column('category', sa.String),
    )
    
    modalities_table = sa.table('modalities',
        sa.column('id', postgresql.UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('description', sa.Text),
        sa.column('default_price_cents', sa.Integer),
        sa.column('currency', sa.String),
        sa.column('category', sa.String),
    )
    
    # Insert specialties
    specialties_data = [
        {
            'id': str(uuid.uuid4()),
            'name': specialty,
            'category': 'Salud Mental'
        }
        for specialty in MENTAL_HEALTH_SPECIALTIES
    ]
    op.bulk_insert(specialties_table, specialties_data)
    
    # Insert therapeutic approaches
    approaches_data = [
        {
            'id': str(uuid.uuid4()),
            'name': approach,
            'description': None,
            'category': 'Enfoque Terapéutico'
        }
        for approach in THERAPEUTIC_APPROACHES
    ]
    op.bulk_insert(therapeutic_approaches_table, approaches_data)
    
    # Insert modalities
    modalities_data = [
        {
            'id': str(uuid.uuid4()),
            'name': modality['name'],
            'description': modality['description'],
            'default_price_cents': modality['default_price_cents'],
            'currency': 'COP',
            'category': modality['category']
        }
        for modality in INTERVENTION_MODALITIES
    ]
    op.bulk_insert(modalities_table, modalities_data)


def downgrade() -> None:
    # Delete all data from the new tables
    op.execute("DELETE FROM professional_modalities")
    op.execute("DELETE FROM professional_therapeutic_approaches")
    op.execute("DELETE FROM professional_specialties_new")
    op.execute("DELETE FROM modalities")
    op.execute("DELETE FROM therapeutic_approaches")
    op.execute("DELETE FROM specialties_new")