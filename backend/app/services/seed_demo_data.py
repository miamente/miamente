"""Seed demo data directly via SQLAlchemy (no auth required).

Run with:
  uvicorn app.main:app  # ensure app and DB are initialized
  python -m app.services.seed_demo_data
"""

from typing import Any, Dict, Optional, Tuple, Type, TypeVar

from sqlalchemy.orm import Session

from app.core.database import get_session_factory
from app.models.specialty import Specialty
from app.models.therapeutic_approach import TherapeuticApproach
from app.models.modality import Modality
from app.models.user import User, UserRole
from app.models.professional import Professional
from app.core.security import get_password_hash

T = TypeVar("T")

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


def get_or_create(
    model: Type[T],
    db: Session,
    defaults: Optional[Dict[str, Any]] = None,
    **kwargs: Any,
) -> Tuple[T, bool]:
    """Return an existing row matching filters or create it if missing.

    Args:
        model: SQLAlchemy model class to query/insert.
        db: Active database session.
        defaults: Field values to use on creation (merged with kwargs).
        **kwargs: Fields used for ``filter_by`` (and part of creation).

    Returns:
        A tuple ``(instance, created)`` where ``created`` is True if a new
        row was inserted, False if an existing one was found.
    """
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    params: Dict[str, Any] = {**kwargs}
    if defaults:
        params.update(defaults)
    instance = model(**params)  # type: ignore[call-arg]
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance, True


def seed_reference_data(db: Session) -> None:
    """Insert reference data (specialties, approaches, modalities) idempotently."""
    for name in SPECIALTIES:
        get_or_create(
            Specialty,
            db,
            defaults={"category": "General", "is_active": True},
            name=name,
        )
    for name in APPROACHES:
        get_or_create(
            TherapeuticApproach,
            db,
            defaults={"description": name, "category": None, "is_active": True},
            name=name,
        )
    for name in MODALITIES:
        get_or_create(
            Modality,
            db,
            defaults={"description": name, "is_active": True},
            name=name,
        )


def seed_users(db: Session) -> None:
    """Create demo users (idempotent)."""
    import logging

    logger = logging.getLogger(__name__)

    user_email = "usuario.test@miamente.com"
    logger.info("Creating/checking demo user: %s", user_email)

    _, created = get_or_create(
        User,
        db,
        email=user_email,
        defaults={
            "hashed_password": get_password_hash("test123456"),
            "full_name": "Usuario Test",
            "phone": "+573001234568",
            "is_active": True,
            "is_verified": True,  # Always verified - no email verification required
            "role": UserRole.USER,  # Default role
            "date_of_birth": None,
            "emergency_contact": "Contacto de Emergencia",
            "emergency_phone": "+573001234569",
            "preferences": '{"theme": "light", "notifications": true}',
        },
    )

    if created:
        logger.info("✅ Created new demo user: %s", user_email)
    else:
        logger.info("✅ Demo user already exists: %s", user_email)


def seed_professional(db: Session) -> None:
    """Create a demo professional and link to a specialty if available."""
    import logging

    logger = logging.getLogger(__name__)

    professional_email = "dr.test@miamente.com"
    logger.info("Creating/checking demo professional: %s", professional_email)

    specialty = db.query(Specialty).filter_by(name="Psicología clínica").first()
    if specialty:
        logger.info("✅ Found specialty: %s", specialty.name)
    else:
        logger.warning(
            "⚠️ Specialty 'Psicología clínica' not found, professional will be created without specialty link"
        )

    _, created = get_or_create(
        Professional,
        db,
        email=professional_email,
        defaults={
            "hashed_password": get_password_hash("test123456"),
            "full_name": "Dr. Test Professional",
            "phone": "+573001234567",
            "phone_country_code": "+57",
            "phone_number": "3001234567",
            "years_experience": 8,
            "rate_cents": 50000,
            "custom_rate_cents": None,
            "currency": "COP",
            "is_active": True,
            "is_verified": True,  # Always verified - no email verification required
            "profile_picture": None,
            "license_number": "PSI-12345",
            "bio": "Psicólogo clínico con 8 años de experiencia en terapia cognitivo-conductual.",
            "academic_experience": '{"degree": "Psicología", "university": "Universidad Nacional", "year": 2015}',
            "work_experience": (
                '{"current": "Consultorio Privado", "previous": ["Hospital San Rafael", "Centro de Salud Mental"]}'
            ),
            "certifications": '["Certificación en TCC", "Especialización en Terapia de Pareja"]',
            "languages": ["Español", "Inglés"],
            "therapy_approaches_ids": None,  # Will be linked via M2M tables
            "specialty_ids": [str(specialty.id)] if specialty and hasattr(specialty, "id") else None,
            "timezone": "America/Bogota",
            "working_hours": (
                '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}}'
            ),
            "emergency_contact": "Dr. Emergency Contact",
            "emergency_phone": "+573001234570",
        },
    )

    if created:
        logger.info("✅ Created new demo professional: %s", professional_email)
    else:
        logger.info("✅ Demo professional already exists: %s", professional_email)


def run() -> None:
    """Entry point: open a DB session and perform the full seeding."""
    import logging

    logger = logging.getLogger(__name__)

    session_local = get_session_factory()
    if session_local is None:
        raise RuntimeError("Could not create database session factory")

    db = session_local()
    try:
        logger.info("🌱 Starting demo data seeding...")

        # Seed reference data
        logger.info("📊 Seeding reference data...")
        seed_reference_data(db)

        # Seed users
        logger.info("👥 Seeding demo users...")
        seed_users(db)

        # Seed professionals
        logger.info("👨‍⚕️ Seeding demo professionals...")
        seed_professional(db)

        logger.info("✅ Demo data seeded successfully")
        print("✅ Demo data seeded")
    except Exception as e:
        logger.error("❌ Error during seeding: %s", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
