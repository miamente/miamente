"""Seed demo data directly via SQLAlchemy (no auth required).

Run with:
  uvicorn app.main:app  # ensure app and DB are initialized
  python -m app.services.seed_demo_data
"""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.specialty import Specialty
from app.models.therapeutic_approach import TherapeuticApproach
from app.models.modality import Modality
from app.models.user import User
from app.models.professional import Professional
from app.core.security import get_password_hash


SPECIALTIES = [
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

APPROACHES = [
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
    "Coaching psicológico",
]

MODALITIES = [
    "Individual",
    "Pareja",
    "Familiar",
    "Infantil",
    "Adolescente",
    "Adultos mayores",
    "Grupal",
    "Online / Teleterapia",
    "Presencial",
    "Intervenciones breves / de crisis",
    "Psicoeducación",
]


def get_or_create(model, db: Session, defaults=None, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    params = {**kwargs}
    if defaults:
        params.update(defaults)
    instance = model(**params)
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance, True


def seed_reference_data(db: Session) -> None:
    for name in SPECIALTIES:
        get_or_create(
            Specialty,
            db,
            defaults={
                "category": "General",
            },
            name=name,
        )
    for name in APPROACHES:
        get_or_create(
            TherapeuticApproach,
            db,
            defaults={"description": name, "category": None},
            name=name,
        )
    for name in MODALITIES:
        get_or_create(Modality, db, defaults={"description": name, "is_active": True}, name=name)


def seed_users(db: Session) -> None:
    # Regular verified user
    get_or_create(
        User,
        db,
        email="usuario.test@miamente.com",
        defaults={
            "hashed_password": get_password_hash("test123456"),
            "full_name": "Usuario Test",
            "phone": "+573001234568",
            "is_active": True,
            "is_verified": True,
        },
    )


def seed_professional(db: Session) -> None:
    # Ensure key specialty exists
    specialty = db.query(Specialty).filter_by(name="Psicología clínica").first()
    get_or_create(
        Professional,
        db,
        email="dr.test@miamente.com",
        defaults={
            "hashed_password": get_password_hash("test123456"),
            "full_name": "Dr. Test Professional",
            "phone": "+573001234567",
            "years_experience": 8,
            "rate_cents": 50000,
            "is_active": True,
            "is_verified": True,
            # Optional arrays can be linked later through M2M tables; keep simple here
            "specialty_ids": [str(getattr(specialty, "id", ""))] if specialty else None,
        },
    )


def run() -> None:
    db = SessionLocal()
    try:
        seed_reference_data(db)
        seed_users(db)
        seed_professional(db)
        print("✅ Demo data seeded")
    finally:
        db.close()


if __name__ == "__main__":
    run()
