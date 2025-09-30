#!/usr/bin/env python3
"""
Environment-specific data seeding script for Miamente platform.

This script seeds the database with environment-appropriate data:
- Staging: Demo data for testing
- Production: Demo data for demonstration purposes

Usage:
    python scripts/seed_environment_data.py [--env staging|production] [--force] [--validate-only]
"""

import argparse
import logging
import sys
import time
from pathlib import Path
from typing import Dict

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import get_session_factory  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.professional import Professional  # noqa: E402
from app.models.specialty import Specialty  # noqa: E402
from app.models.therapeutic_approach import TherapeuticApproach  # noqa: E402
from app.models.modality import Modality  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402
from sqlalchemy.exc import SQLAlchemyError  # noqa: E402
from sqlalchemy import text  # noqa: E402

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def validate_database_connection() -> bool:
    """Validate database connection and basic functionality."""
    try:
        session_factory = get_session_factory()
        if session_factory is None:
            logger.error("❌ Could not create database session factory")
            return False

        db = session_factory()
        try:
            # Test basic query
            db.execute(text("SELECT 1"))
            db.commit()
            logger.info("✅ Database connection validated successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Database query test failed: {e}")
            return False
        finally:
            db.close()
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


def check_existing_data(db: Session) -> Dict[str, int]:
    """Check what demo data already exists in the database."""
    data_status = {"users": 0, "professionals": 0, "specialties": 0, "therapeutic_approaches": 0, "modalities": 0}

    try:
        # Check demo users
        demo_users = (
            db.query(User)
            .filter(User.email.in_(["usuario.test@miamente.com", "demo@miamente.com", "test@miamente.com"]))
            .count()
        )
        data_status["users"] = demo_users

        # Check demo professionals
        demo_professionals = (
            db.query(Professional)
            .filter(
                Professional.email.in_(
                    ["dr.test@miamente.com", "profesional@miamente.com", "demo.profesional@miamente.com"]
                )
            )
            .count()
        )
        data_status["professionals"] = demo_professionals

        # Check reference data
        data_status["specialties"] = db.query(Specialty).count()
        data_status["therapeutic_approaches"] = db.query(TherapeuticApproach).count()
        data_status["modalities"] = db.query(Modality).count()

        logger.info(f"📊 Current data status: {data_status}")
        return data_status

    except Exception as e:
        logger.error(f"❌ Error checking existing data: {e}")
        return data_status


def validate_seeded_data(db: Session) -> bool:
    """Validate that seeded data is correct and complete."""
    try:
        # Check reference data
        specialties_count = db.query(Specialty).count()
        approaches_count = db.query(TherapeuticApproach).count()
        modalities_count = db.query(Modality).count()

        # Check demo users
        demo_users = db.query(User).filter(User.email.in_(["usuario.test@miamente.com"])).count()

        # Debug: List all users to see what's actually in the database
        all_users = db.query(User).all()
        logger.info(f"📊 Total users in database: {len(all_users)}")
        for user in all_users:
            logger.info(f"   - User: {user.email} (ID: {user.id}, Active: {user.is_active})")

        # Check demo professionals
        demo_professionals = db.query(Professional).filter(Professional.email.in_(["dr.test@miamente.com"])).count()

        # Debug: List all professionals to see what's actually in the database
        all_professionals = db.query(Professional).all()
        logger.info(f"📊 Total professionals in database: {len(all_professionals)}")
        for professional in all_professionals:
            logger.info(
                f"   - Professional: {professional.email} (ID: {professional.id}, Active: {professional.is_active})"
            )

        # Validate counts
        if specialties_count < 5:
            logger.error(f"❌ Insufficient specialties: {specialties_count}")
            return False

        if approaches_count < 5:
            logger.error(f"❌ Insufficient therapeutic approaches: {approaches_count}")
            return False

        if modalities_count < 5:
            logger.error(f"❌ Insufficient modalities: {modalities_count}")
            return False

        if demo_users == 0:
            logger.error("❌ No demo users found")
            return False

        if demo_professionals == 0:
            logger.error("❌ No demo professionals found")
            return False

        logger.info("✅ All seeded data validation passed")
        return True

    except Exception as e:
        logger.error(f"❌ Data validation failed: {e}")
        return False


def get_environment_info(env: str) -> dict:
    """Get environment-specific information."""
    env_info = {
        "staging": {
            "name": "Staging",
            "description": "Testing environment with demo data",
            "users": [
                {"email": "demo@miamente.com", "password": "test123456", "name": "Demo User"},
                {"email": "test@miamente.com", "password": "test123456", "name": "Test User"},
            ],
            "professionals": [
                {"email": "profesional@miamente.com", "password": "test123456", "name": "Dr. Demo Profesional"},
                {"email": "demo.profesional@miamente.com", "password": "test123456", "name": "Dr. Test Profesional"},
            ],
        },
        "production": {
            "name": "Production",
            "description": "Production environment with demo data for demonstration",
            "users": [
                {"email": "demo@miamente.com", "password": "test123456", "name": "Demo User"},
                {"email": "test@miamente.com", "password": "test123456", "name": "Test User"},
            ],
            "professionals": [
                {"email": "profesional@miamente.com", "password": "test123456", "name": "Dr. Demo Profesional"},
                {"email": "demo.profesional@miamente.com", "password": "test123456", "name": "Dr. Test Profesional"},
            ],
        },
    }

    return env_info.get(env, env_info["staging"])


def run_seeding_process(env: str, force: bool = False, validate_only: bool = False) -> bool:
    """Run the complete seeding process with proper error handling and validation."""
    env_info = get_environment_info(env)

    logger.info(f"🌱 Starting data seeding for {env_info['name']} environment...")
    logger.info(f"📝 {env_info['description']}")

    # Step 1: Validate database connection
    if not validate_database_connection():
        logger.error("❌ Database connection validation failed")
        return False

    # Step 2: Get database session
    session_factory = get_session_factory()
    if session_factory is None:
        logger.error("❌ Could not create database session factory")
        return False

    db = session_factory()
    try:
        # Step 3: Check existing data
        data_status = check_existing_data(db)

        if validate_only:
            logger.info("🔍 Validation mode - checking data integrity...")
            return validate_seeded_data(db)

        # Step 4: Check if seeding is needed
        has_existing_data = any(data_status[key] > 0 for key in ["users", "professionals", "specialties"])

        # Check if we have the specific demo users we need
        demo_user_exists = db.query(User).filter(User.email == "usuario.test@miamente.com").first() is not None
        demo_professional_exists = (
            db.query(Professional).filter(Professional.email == "dr.test@miamente.com").first() is not None
        )

        if has_existing_data and not force:
            logger.warning("⚠️  Some data already exists in the database.")

            # Check if we have the demo users we need
            if demo_user_exists and demo_professional_exists:
                logger.info("✅ Demo users and professionals already exist.")
                logger.info("   Existing demo accounts:")
                logger.info("     👤 Usuario Test: usuario.test@miamente.com / test123456")
                logger.info("     👨‍⚕️ Dr. Test Professional: dr.test@miamente.com / test123456")

                # Validate existing data
                logger.info("🔍 Validating existing data...")
                if validate_seeded_data(db):
                    logger.info("✅ Existing data validation passed")
                    return True
                else:
                    logger.error("❌ Existing data validation failed - consider using --force")
                    return False
            else:
                logger.info("⚠️  Demo users are missing, will seed them now.")
                logger.info(f"   Demo user exists: {demo_user_exists}")
                logger.info(f"   Demo professional exists: {demo_professional_exists}")
                # Continue to seeding step

        # Step 5: Run selective seeding process
        start_time = time.time()

        try:
            # Always seed reference data (it's idempotent)
            logger.info("📊 Seeding reference data (specialties, approaches, modalities)...")
            from app.services.seed_demo_data import seed_reference_data

            seed_reference_data(db)

            # Only seed demo users if they don't exist
            if not demo_user_exists:
                logger.info("👥 Seeding demo users...")
                from app.services.seed_demo_data import seed_users

                seed_users(db)
            else:
                logger.info("✅ Demo users already exist, skipping...")

            # Only seed demo professionals if they don't exist
            if not demo_professional_exists:
                logger.info("👨‍⚕️ Seeding demo professionals...")
                from app.services.seed_demo_data import seed_professional

                seed_professional(db)
            else:
                logger.info("✅ Demo professionals already exist, skipping...")

            seeding_time = time.time() - start_time
            logger.info(f"⏱️  Seeding completed in {seeding_time:.2f} seconds")

        except Exception as e:
            logger.error(f"❌ Error during seeding: {e}")
            return False

        # Step 6: Validate seeded data
        logger.info("🔍 Validating seeded data...")
        if not validate_seeded_data(db):
            logger.error("❌ Seeded data validation failed")
            return False

        # Step 7: Success summary
        logger.info(f"✅ Successfully seeded demo data for {env_info['name']} environment!")
        logger.info("📋 Demo accounts created:")
        logger.info("   👥 Users:")
        for user in env_info["users"]:
            logger.info(f"     • {user['name']}: {user['email']} / {user['password']}")
        logger.info("   👨‍⚕️ Professionals:")
        for prof in env_info["professionals"]:
            logger.info(f"     • {prof['name']}: {prof['email']} / {prof['password']}")

        logger.info(f"\n🎯 You can now test the {env_info['name'].lower()} environment with these accounts!")
        return True

    except SQLAlchemyError as e:
        logger.error(f"❌ Database error during seeding: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error during seeding: {e}")
        return False
    finally:
        db.close()


def main():
    """Main function to seed environment data."""
    parser = argparse.ArgumentParser(
        description="Seed environment data for Miamente platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Seed staging environment
  python scripts/seed_environment_data.py --env staging

  # Force re-seed production environment
  python scripts/seed_environment_data.py --env production --force

  # Validate existing data without seeding
  python scripts/seed_environment_data.py --env staging --validate-only
        """,
    )

    parser.add_argument(
        "--env",
        choices=["staging", "production"],
        default="staging",
        help="Environment to seed data for (default: staging)",
    )
    parser.add_argument("--force", action="store_true", help="Force seeding even if demo data already exists")
    parser.add_argument("--validate-only", action="store_true", help="Only validate existing data without seeding")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        success = run_seeding_process(args.env, args.force, args.validate_only)
        if success:
            logger.info("🎉 Data seeding process completed successfully!")
            sys.exit(0)
        else:
            logger.error("💥 Data seeding process failed!")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("⏹️  Seeding process interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"💥 Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
