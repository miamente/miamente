#!/usr/bin/env python3
"""
Test token creation directly.
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
from app.core.security import create_token_response

def test_token_creation():
    """Test token creation directly."""
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        print("🔐 Testing token creation...")
        
        try:
            # Get the test professional
            professional = db.query(Professional).filter(
                Professional.email == "test.professional@miamente.com"
            ).first()
            
            if not professional:
                print("❌ Professional not found!")
                return
            
            print(f"   Professional ID: {professional.id}")
            print(f"   Professional Name: {professional.full_name}")
            
            # Test token creation
            token_response = create_token_response(str(professional.id))
            
            print("✅ Token creation successful!")
            print(f"   Access Token: {token_response['access_token'][:50]}...")
            print(f"   Refresh Token: {token_response['refresh_token'][:50]}...")
            print(f"   Token Type: {token_response['token_type']}")
            
        except Exception as e:
            print(f"❌ Exception during token creation: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_token_creation()
