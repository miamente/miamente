#!/usr/bin/env python3
"""
Script to create a test professional for development and testing purposes.
"""
import os
import sys
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from passlib.context import CryptContext

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.professional import Professional
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def create_test_professional():
    """Create a test professional with sample data."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        # Check if test professional already exists
        existing_professional = db.query(Professional).filter(
            Professional.email == "test.professional@miamente.com"
        ).first()
        
        if existing_professional:
            print("❌ Test professional already exists!")
            print(f"   Email: {existing_professional.email}")
            print(f"   ID: {existing_professional.id}")
            return
        
        # Create test professional
        test_professional = Professional(
            email="test.professional@miamente.com",
            full_name="Dr. María González",
            phone="+57 300 123 4567",
            hashed_password=hash_password("test123"),
            is_active=True,
            is_verified=True,
            specialty="Psicología Clínica",
            license_number="PSI-12345",
            years_experience=8,
            rate_cents=80000,  # $800.00 COP per hour
            currency="COP",
            bio="Psicóloga clínica con más de 8 años de experiencia en terapia cognitivo-conductual. Especializada en ansiedad, depresión y trastornos del estado de ánimo. Trabajo con adolescentes y adultos.",
            education="Psicología - Universidad Nacional de Colombia",
            academic_experience='[{"degree": "Psicología", "institution": "Universidad Nacional de Colombia", "start_year": 2010, "end_year": 2015, "description": "Carrera profesional en Psicología con énfasis en clínica"}, {"degree": "Especialización en Terapia Cognitivo-Conductual", "institution": "Universidad de los Andes", "start_year": 2016, "end_year": 2017, "description": "Especialización en TCC para el tratamiento de trastornos de ansiedad y depresión"}]',
            work_experience='[{"position": "Psicóloga Clínica", "company": "Hospital San Rafael", "start_date": "2018-01-15", "end_date": "2022-12-31", "description": "Atención psicológica a pacientes con trastornos del estado de ánimo y ansiedad", "achievements": ["Implementé protocolo de evaluación psicológica", "Reduje tiempo de espera en 40%", "Capacité a 15 profesionales en técnicas de TCC"]}, {"position": "Psicóloga Independiente", "company": "Consultorio Privado", "start_date": "2023-01-01", "description": "Atención psicológica privada especializada en terapia individual y de pareja", "achievements": ["Atendí más de 200 pacientes", "Desarrollé programa de terapia online", "Obtuve certificación en terapia de pareja"]}]',
            certifications='["Certificación en TCC - Universidad de los Andes", "Certificación en Terapia de Pareja - Instituto de Terapia Familiar", "Certificación en Mindfulness - Centro de Meditación"]',
            languages='["Español (Nativo)", "Inglés (Avanzado)", "Portugués (Intermedio)"]',
            therapy_approaches='["Terapia Cognitivo-Conductual", "Mindfulness", "Terapia de Aceptación y Compromiso", "Terapia de Pareja"]',
            timezone="America/Bogota",
            profile_picture="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
            emergency_contact="Carlos González",
            emergency_phone="+57 300 987 6543"
        )
        
        try:
            db.add(test_professional)
            db.commit()
            db.refresh(test_professional)
            
            print("✅ Test professional created successfully!")
            print(f"   Name: {test_professional.full_name}")
            print(f"   Email: {test_professional.email}")
            print(f"   Password: test123")
            print(f"   ID: {test_professional.id}")
            print(f"   Specialty: {test_professional.specialty}")
            print(f"   Rate: ${test_professional.rate_cents / 100:,.2f} {test_professional.currency} per hour")
            print("\n📋 Login credentials:")
            print("   Email: test.professional@miamente.com")
            print("   Password: test123")
            print("\n🔗 You can now test the professional profile editing functionality!")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error creating test professional: {e}")
            raise

if __name__ == "__main__":
    print("🚀 Creating test professional...")
    create_test_professional()
