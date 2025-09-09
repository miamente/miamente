#!/usr/bin/env python3
"""
Check and update user password.
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
from app.core.security import get_password_hash, verify_password

def check_and_update_password():
    """Check and update user password."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        email = "test@miamente.com"
        
        print(f"🔍 Checking user password for: {email}")
        
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        professional = db.query(Professional).filter(Professional.email == email).first()
        
        if not user:
            print(f"❌ User not found!")
            return
            
        if not professional:
            print(f"❌ Professional record not found!")
            return
        
        print(f"✅ Found user: {user.full_name}")
        print(f"✅ Found professional: {professional.full_name}")
        
        # Test common passwords
        test_passwords = ["test123", "password", "123456", "test", "admin"]
        
        print("\n🔐 Testing common passwords...")
        for password in test_passwords:
            if verify_password(password, user.hashed_password):
                print(f"✅ Password found: {password}")
                return
            print(f"❌ Not: {password}")
        
        print("\n🔧 Setting new password...")
        new_password = "test123"
        new_hash = get_password_hash(new_password)
        
        # Update both user and professional passwords
        user.hashed_password = new_hash
        professional.hashed_password = new_hash
        
        db.commit()
        
        print(f"✅ Password updated to: {new_password}")
        print("   Updated in both User and Professional records")

if __name__ == "__main__":
    check_and_update_password()
