#!/usr/bin/env python3
"""
Environment-specific data seeding script for Miamente platform.

This script seeds the database with environment-appropriate data:
- Staging: Demo data for testing
- Production: Demo data for demonstration purposes

Usage:
    python scripts/seed_environment_data.py [--env staging|production] [--force]
"""

import argparse
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.seed_demo_data import run as seed_demo_data
from app.core.database import get_session_factory
from app.models.user import User
from app.models.professional import Professional
from sqlalchemy.orm import Session


def check_existing_data(db: Session) -> bool:
    """Check if demo data already exists in the database."""
    # Check if demo users exist
    demo_users = db.query(User).filter(User.email.in_([
        "demo@miamente.com",
        "test@miamente.com"
    ])).count()
    
    # Check if demo professionals exist
    demo_professionals = db.query(Professional).filter(Professional.email.in_([
        "profesional@miamente.com",
        "demo.profesional@miamente.com"
    ])).count()
    
    return demo_users > 0 or demo_professionals > 0


def get_environment_info(env: str) -> dict:
    """Get environment-specific information."""
    env_info = {
        "staging": {
            "name": "Staging",
            "description": "Testing environment with demo data",
            "users": [
                {"email": "demo@miamente.com", "password": "test123456", "name": "Demo User"},
                {"email": "test@miamente.com", "password": "test123456", "name": "Test User"}
            ],
            "professionals": [
                {"email": "profesional@miamente.com", "password": "test123456", "name": "Dr. Demo Profesional"},
                {"email": "demo.profesional@miamente.com", "password": "test123456", "name": "Dr. Test Profesional"}
            ]
        },
        "production": {
            "name": "Production",
            "description": "Production environment with demo data for demonstration",
            "users": [
                {"email": "demo@miamente.com", "password": "test123456", "name": "Demo User"},
                {"email": "test@miamente.com", "password": "test123456", "name": "Test User"}
            ],
            "professionals": [
                {"email": "profesional@miamente.com", "password": "test123456", "name": "Dr. Demo Profesional"},
                {"email": "demo.profesional@miamente.com", "password": "test123456", "name": "Dr. Test Profesional"}
            ]
        }
    }
    
    return env_info.get(env, env_info["staging"])


def main():
    """Main function to seed environment data."""
    parser = argparse.ArgumentParser(description="Seed environment data for Miamente platform")
    parser.add_argument(
        "--env",
        choices=["staging", "production"],
        default="staging",
        help="Environment to seed data for (default: staging)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force seeding even if demo data already exists"
    )
    
    args = parser.parse_args()
    
    env_info = get_environment_info(args.env)
    
    print(f"🌱 Starting data seeding for {env_info['name']} environment...")
    print(f"📝 {env_info['description']}")
    
    # Check if demo data already exists
    session_factory = get_session_factory()
    if session_factory is None:
        print("❌ Error: Could not create database session factory")
        print("   Make sure the database is running and accessible")
        sys.exit(1)
    
    db = session_factory()
    try:
        if not args.force and check_existing_data(db):
            print("⚠️  Demo data already exists in the database.")
            print("   Use --force flag to re-seed data.")
            print("   Existing demo accounts:")
            for user in env_info["users"]:
                print(f"     👤 {user['name']}: {user['email']} / {user['password']}")
            for prof in env_info["professionals"]:
                print(f"     👨‍⚕️ {prof['name']}: {prof['email']} / {prof['password']}")
            return
        
        print("📊 Seeding reference data (specialties, approaches, modalities)...")
        print("👥 Seeding demo users...")
        print("👨‍⚕️ Seeding demo professionals...")
        
        # Run the seeding process
        seed_demo_data()
        
        print(f"✅ Successfully seeded demo data for {env_info['name']} environment!")
        print("📋 Demo accounts created:")
        print("   👥 Users:")
        for user in env_info["users"]:
            print(f"     • {user['name']}: {user['email']} / {user['password']}")
        print("   👨‍⚕️ Professionals:")
        for prof in env_info["professionals"]:
            print(f"     • {prof['name']}: {prof['email']} / {prof['password']}")
        
        print(f"\n🎯 You can now test the {env_info['name'].lower()} environment with these accounts!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        print("   Make sure the database is accessible and the application is properly configured")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

