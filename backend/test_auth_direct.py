#!/usr/bin/env python3
"""
Test authentication directly without HTTP endpoint.
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
from app.services.auth_service import AuthService

def test_auth_direct():
    """Test authentication directly."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        auth_service = AuthService(db)
        
        print("🔐 Testing direct authentication...")
        
        try:
            professional = auth_service.authenticate_professional(
                "test.professional@miamente.com",
                "test123"
            )
            
            if professional:
                print("✅ Authentication successful!")
                print(f"   Name: {professional.full_name}")
                print(f"   Email: {professional.email}")
                print(f"   ID: {professional.id}")
            else:
                print("❌ Authentication failed!")
                
        except Exception as e:
            print(f"❌ Exception during authentication: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_auth_direct()
