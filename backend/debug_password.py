#!/usr/bin/env python3
"""
Debug script to check password hashing and verification.
"""
import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.professional import Professional
from app.core.config import settings
from app.core.security import verify_password, get_password_hash

def debug_password():
    """Debug password hashing and verification."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        # Get the test professional
        professional = db.query(Professional).filter(
            Professional.email == "test.professional@miamente.com"
        ).first()
        
        if not professional:
            print("❌ Test professional not found!")
            return
        
        print(f"✅ Found professional: {professional.full_name}")
        print(f"   Email: {professional.email}")
        print(f"   Hashed password: {professional.hashed_password[:50]}...")
        
        # Test password verification
        test_password = "test123"
        print(f"\n🔐 Testing password verification...")
        print(f"   Test password: {test_password}")
        
        # Test with the stored hash
        is_valid = verify_password(test_password, professional.hashed_password)
        print(f"   Verification result: {is_valid}")
        
        if not is_valid:
            print("\n🔧 Trying to rehash the password...")
            new_hash = get_password_hash(test_password)
            print(f"   New hash: {new_hash[:50]}...")
            
            # Test with new hash
            is_valid_new = verify_password(test_password, new_hash)
            print(f"   New hash verification: {is_valid_new}")
            
            if is_valid_new:
                print("\n💾 Updating password in database...")
                professional.hashed_password = new_hash
                db.commit()
                print("✅ Password updated successfully!")
            else:
                print("❌ Password verification still failing")
        else:
            print("✅ Password verification successful!")

if __name__ == "__main__":
    print("🔍 Debugging password authentication...")
    debug_password()
