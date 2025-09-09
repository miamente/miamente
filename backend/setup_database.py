#!/usr/bin/env python3
"""
Database setup script for Miamente platform.
This script cleans the database and creates new users with their respective roles.
"""
import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from datetime import datetime
import json
from uuid import UUID

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, get_db
from app.models.user import User
from app.models.professional import Professional
from app.core.config import settings
from app.core.security import get_password_hash

# Database configuration
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)

def clean_database():
    """Clean all tables in the database."""
    print("🧹 Cleaning database...")
    
    with engine.connect() as conn:
        # Get all table names
        result = conn.execute(text("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
        """))
        tables = [row[0] for row in result]
        
        if tables:
            # Drop all tables
            for table in tables:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
            
            conn.commit()
            print(f"✅ Dropped {len(tables)} tables")
        else:
            print("ℹ️  No tables to drop")
    
    print("✅ Database cleaned successfully!")

def create_tables():
    """Create all tables in the database."""
    print("🏗️  Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully!")

def create_users():
    """Create users with their respective roles."""
    print("👥 Creating users...")
    
    with Session(engine) as db:
        # User 1: Regular User
        user1 = User(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            email="usuario@miamente.com",
            full_name="María García",
            phone="+573001234567",
            hashed_password=get_password_hash("usuario123"),
            is_active=True,
            is_verified=True,
            profile_picture="https://randomuser.me/api/portraits/women/1.jpg",
            date_of_birth=datetime(1990, 5, 15),
            emergency_contact="Juan García",
            emergency_phone="+573109876543",
            preferences=json.dumps({
                "notifications": True,
                "language": "es",
                "timezone": "America/Bogota"
            }),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # User 2: Regular User
        user2 = User(
            id=UUID("22222222-2222-2222-2222-222222222222"),
            email="cliente@miamente.com",
            full_name="Carlos López",
            phone="+573001234568",
            hashed_password=get_password_hash("cliente123"),
            is_active=True,
            is_verified=True,
            profile_picture="https://randomuser.me/api/portraits/men/2.jpg",
            date_of_birth=datetime(1985, 8, 22),
            emergency_contact="Ana López",
            emergency_phone="+573109876544",
            preferences=json.dumps({
                "notifications": True,
                "language": "es",
                "timezone": "America/Bogota"
            }),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # User 3: Regular User
        user3 = User(
            id=UUID("33333333-3333-3333-3333-333333333333"),
            email="paciente@miamente.com",
            full_name="Laura Rodríguez",
            phone="+573001234569",
            hashed_password=get_password_hash("paciente123"),
            is_active=True,
            is_verified=False,
            profile_picture="https://randomuser.me/api/portraits/women/3.jpg",
            date_of_birth=datetime(1992, 12, 10),
            emergency_contact="Pedro Rodríguez",
            emergency_phone="+573109876545",
            preferences=json.dumps({
                "notifications": False,
                "language": "es",
                "timezone": "America/Bogota"
            }),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Add users to database
        db.add_all([user1, user2, user3])
        db.commit()
        
        print("✅ Regular users created successfully!")

def create_professionals():
    """Create professionals with their respective roles."""
    print("👨‍⚕️ Creating professionals...")
    
    with Session(engine) as db:
        # Professional 1: Psychologist
        professional1 = Professional(
            id=UUID("44444444-4444-4444-4444-444444444444"),
            email="psicologo@miamente.com",
            full_name="Dr. Ana Martínez",
            phone="+573001234570",
            hashed_password=get_password_hash("psicologo123"),
            is_active=True,
            is_verified=True,
            profile_picture="https://randomuser.me/api/portraits/women/4.jpg",
            specialty="Psicología Clínica",
            license_number="P-12345",
            years_experience=8,
            rate_cents=80000,  # $800.00 COP
            currency="COP",
            bio="Psicóloga clínica con 8 años de experiencia en terapia cognitivo-conductual. Especializada en trastornos de ansiedad y depresión.",
            education="Doctorado en Psicología",
            academic_experience=json.dumps([
                {
                    "degree": "Psicología",
                    "institution": "Universidad Nacional de Colombia",
                    "start_year": 2010,
                    "end_year": 2015,
                    "description": "Enfocado en psicología clínica y social."
                },
                {
                    "degree": "Especialización en Terapia Cognitivo-Conductual",
                    "institution": "Universidad de los Andes",
                    "start_year": 2016,
                    "end_year": 2017,
                    "description": "Profundización en técnicas de intervención TCC."
                }
            ]),
            work_experience=json.dumps([
                {
                    "position": "Psicóloga Clínica",
                    "company": "Hospital San Rafael",
                    "start_date": "2018-01-01",
                    "end_date": "2022-12-31",
                    "description": "Evaluación y tratamiento de pacientes con trastornos de ansiedad y depresión.",
                    "achievements": [
                        "Desarrollo de programas de intervención grupal.",
                        "Reducción del 20% en tasas de reingreso hospitalario."
                    ]
                },
                {
                    "position": "Terapeuta Privado",
                    "company": "Consultorio Miamente",
                    "start_date": "2023-01-01",
                    "end_date": None,
                    "description": "Atención individual a adolescentes y adultos.",
                    "achievements": [
                        "Implementación de terapias online.",
                        "Alta satisfacción del paciente."
                    ]
                }
            ]),
            certifications=["Certificación en TCC", "Primeros Auxilios Psicológicos"],
            languages=["Español", "Inglés"],
            therapy_approaches=["Terapia Cognitivo-Conductual", "Mindfulness", "Terapia de Aceptación y Compromiso"],
            timezone="America/Bogota",
            working_hours=json.dumps(["Lunes 9-17", "Martes 9-17", "Miércoles 9-17", "Jueves 9-17", "Viernes 9-15"]),
            emergency_contact="Carlos Martínez",
            emergency_phone="+573109876546",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Professional 2: Psychiatrist
        professional2 = Professional(
            id=UUID("55555555-5555-5555-5555-555555555555"),
            email="psiquiatra@miamente.com",
            full_name="Dr. Roberto Silva",
            phone="+573001234571",
            hashed_password=get_password_hash("psiquiatra123"),
            is_active=True,
            is_verified=True,
            profile_picture="https://randomuser.me/api/portraits/men/5.jpg",
            specialty="Psiquiatría",
            license_number="P-67890",
            years_experience=12,
            rate_cents=120000,  # $1200.00 COP
            currency="COP",
            bio="Psiquiatra con 12 años de experiencia en el tratamiento de trastornos mentales severos. Especializado en esquizofrenia y trastornos bipolares.",
            education="Doctorado en Medicina",
            academic_experience=json.dumps([
                {
                    "degree": "Medicina",
                    "institution": "Universidad del Rosario",
                    "start_year": 2008,
                    "end_year": 2014,
                    "description": "Formación médica general."
                },
                {
                    "degree": "Especialización en Psiquiatría",
                    "institution": "Universidad Javeriana",
                    "start_year": 2015,
                    "end_year": 2019,
                    "description": "Especialización en psiquiatría clínica."
                }
            ]),
            work_experience=json.dumps([
                {
                    "position": "Psiquiatra",
                    "company": "Hospital Universitario",
                    "start_date": "2019-01-01",
                    "end_date": "2023-12-31",
                    "description": "Tratamiento de pacientes con trastornos mentales severos.",
                    "achievements": [
                        "Desarrollo de protocolos de tratamiento.",
                        "Reducción del 30% en tiempo de hospitalización."
                    ]
                },
                {
                    "position": "Psiquiatra Consultor",
                    "company": "Clínica Mental",
                    "start_date": "2024-01-01",
                    "end_date": None,
                    "description": "Consultoría y tratamiento ambulatorio.",
                    "achievements": [
                        "Implementación de telemedicina.",
                        "Mejora en adherencia al tratamiento."
                    ]
                }
            ]),
            certifications=["Certificación en Psiquiatría", "Manejo de Crisis"],
            languages=["Español", "Inglés", "Francés"],
            therapy_approaches=["Psiquiatría Biológica", "Terapia Familiar", "Psicoeducación"],
            timezone="America/Bogota",
            working_hours=json.dumps(["Lunes 8-16", "Martes 8-16", "Miércoles 8-16", "Jueves 8-16", "Viernes 8-14"]),
            emergency_contact="María Silva",
            emergency_phone="+573109876547",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Professional 3: Therapist
        professional3 = Professional(
            id=UUID("66666666-6666-6666-6666-666666666666"),
            email="terapeuta@miamente.com",
            full_name="Lic. Carmen Herrera",
            phone="+573001234572",
            hashed_password=get_password_hash("terapeuta123"),
            is_active=True,
            is_verified=False,
            profile_picture="https://randomuser.me/api/portraits/women/6.jpg",
            specialty="Terapia Familiar",
            license_number="T-11111",
            years_experience=5,
            rate_cents=60000,  # $600.00 COP
            currency="COP",
            bio="Terapeuta familiar con 5 años de experiencia en terapia de pareja y familiar. Especializada en resolución de conflictos.",
            education="Maestría en Terapia Familiar",
            academic_experience=json.dumps([
                {
                    "degree": "Psicología",
                    "institution": "Universidad de Antioquia",
                    "start_year": 2015,
                    "end_year": 2019,
                    "description": "Formación en psicología clínica."
                },
                {
                    "degree": "Maestría en Terapia Familiar",
                    "institution": "Universidad de los Andes",
                    "start_year": 2020,
                    "end_year": 2022,
                    "description": "Especialización en terapia familiar sistémica."
                }
            ]),
            work_experience=json.dumps([
                {
                    "position": "Terapeuta Familiar",
                    "company": "Centro de Terapia Familiar",
                    "start_date": "2022-01-01",
                    "end_date": None,
                    "description": "Terapia de pareja y familiar.",
                    "achievements": [
                        "Desarrollo de talleres de comunicación.",
                        "Alta tasa de resolución de conflictos."
                    ]
                }
            ]),
            certifications=["Certificación en Terapia Familiar", "Mediación de Conflictos"],
            languages=["Español", "Inglés"],
            therapy_approaches=["Terapia Familiar Sistémica", "Terapia de Pareja", "Mediación"],
            timezone="America/Bogota",
            working_hours=json.dumps(["Lunes 14-20", "Martes 14-20", "Miércoles 14-20", "Jueves 14-20", "Sábado 9-15"]),
            emergency_contact="Luis Herrera",
            emergency_phone="+573109876548",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Add professionals to database
        db.add_all([professional1, professional2, professional3])
        db.commit()
        
        print("✅ Professionals created successfully!")

def main():
    """Main function to set up the database."""
    print("🚀 Setting up Miamente database...")
    print("=" * 50)
    
    try:
        # Clean database
        clean_database()
        
        # Create tables
        create_tables()
        
        # Create users
        create_users()
        
        # Create professionals
        create_professionals()
        
        print("=" * 50)
        print("✅ Database setup completed successfully!")
        print("\n📋 Summary:")
        print("   - 3 Regular users created")
        print("   - 3 Professionals created")
        print("   - All users are active and ready to use")
        print("\n🔑 Login credentials are available in DATABASE_USERS.md")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
