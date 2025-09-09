#!/usr/bin/env python3
"""
Script to update user role from regular user to professional.
"""
import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.user import User
from app.models.professional import Professional
from app.core.config import settings
from app.core.security import get_password_hash

def update_user_to_professional():
    """Update user role from regular user to professional."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        email = "test@miamente.com"
        
        print(f"🔍 Looking for user with email: {email}")
        
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User with email {email} not found!")
            return
        
        print(f"✅ Found user: {user.full_name}")
        print(f"   Email: {user.email}")
        print(f"   User ID: {user.id}")
        print(f"   Active: {user.is_active}")
        print(f"   Verified: {user.is_verified}")
        
        # Check if professional record already exists
        existing_professional = db.query(Professional).filter(Professional.email == email).first()
        if existing_professional:
            print("ℹ️  Professional record already exists for this email!")
            print(f"   Professional ID: {existing_professional.id}")
            print(f"   Professional Name: {existing_professional.full_name}")
            return
        
        print("\n🔄 Creating professional record for user...")
        
        try:
            
            # Create professional record
            professional = Professional(
                id=user.id,  # Use the same ID as the user
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                hashed_password=user.hashed_password,
                is_active=user.is_active,
                is_verified=False,  # Set to False initially, can be verified later
                profile_picture=user.profile_picture,
                specialty="Psicología General",  # Default specialty
                license_number="",  # Empty initially
                years_experience=0,  # Default to 0
                rate_cents=50000,  # Default rate $500.00 COP
                currency="COP",
                bio="Profesional de la salud mental con experiencia en terapia individual y grupal.",
                education="",  # Empty initially
                academic_experience="[]",  # Empty JSON array
                work_experience="[]",  # Empty JSON array
                certifications=[],  # Empty array
                languages=[],  # Empty array
                therapy_approaches=[],  # Empty array
                timezone="America/Bogota",
                working_hours="[]",  # Empty JSON array
                emergency_contact=user.emergency_contact,
                emergency_phone=user.emergency_phone,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
            
            db.add(professional)
            db.commit()
            
            print("✅ Professional record created successfully!")
            print(f"   Professional ID: {professional.id}")
            print(f"   Professional name: {professional.full_name}")
            print(f"   Default specialty: {professional.specialty}")
            print(f"   Default rate: ${professional.rate_cents / 100:.2f} {professional.currency}")
            
            print("\n📋 Next steps:")
            print("   1. The user can now login as a professional")
            print("   2. They should update their professional profile with specific details")
            print("   3. They can add their academic and work experience")
            print("   4. They can set their actual specialty and rates")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error creating professional record: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("🔄 Creating professional record for user...")
    update_user_to_professional()
