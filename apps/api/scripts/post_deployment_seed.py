#!/usr/bin/env python3
"""
Post-deployment data seeding script for Miamente platform.

This script is designed to be run automatically after successful deployments
to ensure that staging and production environments have the necessary data.

Usage:
    python scripts/post_deployment_seed.py [--env staging|production] [--wait-for-health]
"""

import argparse
import logging
import os
import sys
import time
import requests
from pathlib import Path
from typing import Optional

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from scripts.seed_environment_data import run_seeding_process  # noqa: E402

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def wait_for_health_check(health_url: str, max_retries: int = 30, delay: int = 10) -> bool:
    """Wait for the application health check to pass."""
    logger.info(f"🏥 Waiting for health check at {health_url}...")

    for attempt in range(max_retries):
        try:
            response = requests.get(health_url, timeout=10)
            if response.status_code == 200:
                logger.info("✅ Health check passed!")
                return True
        except requests.exceptions.RequestException as e:
            logger.debug(f"Health check attempt {attempt + 1} failed: {e}")

        if attempt < max_retries - 1:
            logger.info(f"⏳ Health check failed, retrying in {delay} seconds... (attempt {attempt + 1}/{max_retries})")
            time.sleep(delay)

    logger.error(f"❌ Health check failed after {max_retries} attempts")
    return False


def get_health_check_url(env: str) -> Optional[str]:
    """Get the health check URL for the environment."""
    # These URLs should be configured in your deployment pipeline
    # or environment variables
    health_urls = {
        "staging": os.getenv("STAGING_HEALTH_URL", "http://localhost:8000/health"),
        "production": os.getenv("PRODUCTION_HEALTH_URL", "http://localhost:8000/health"),
    }

    return health_urls.get(env)


def run_post_deployment_seeding(env: str, wait_for_health: bool = False) -> bool:
    """Run post-deployment seeding process."""
    logger.info(f"🚀 Starting post-deployment seeding for {env} environment")

    # Step 1: Wait for health check if requested
    if wait_for_health:
        health_url = get_health_check_url(env)
        if health_url:
            if not wait_for_health_check(health_url):
                logger.error("❌ Health check failed, aborting seeding")
                return False
        else:
            logger.warning(f"⚠️  No health check URL configured for {env} environment")

    # Step 2: Run seeding process
    logger.info(f"🌱 Starting data seeding for {env} environment...")

    try:
        success = run_seeding_process(env, force=False, validate_only=False)

        if success:
            logger.info(f"🎉 Post-deployment seeding completed successfully for {env}!")
            return True
        else:
            logger.error(f"💥 Post-deployment seeding failed for {env}")
            return False

    except Exception as e:
        logger.error(f"💥 Unexpected error during post-deployment seeding: {e}")
        return False


def main():
    """Main function for post-deployment seeding."""
    parser = argparse.ArgumentParser(
        description="Post-deployment data seeding for Miamente platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run post-deployment seeding for staging
  python scripts/post_deployment_seed.py --env staging

  # Run with health check wait
  python scripts/post_deployment_seed.py --env production --wait-for-health
        """,
    )

    parser.add_argument("--env", choices=["staging", "production"], required=True, help="Environment to seed data for")
    parser.add_argument(
        "--wait-for-health", action="store_true", help="Wait for application health check before seeding"
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        success = run_post_deployment_seeding(args.env, args.wait_for_health)
        if success:
            logger.info("🎉 Post-deployment seeding process completed successfully!")
            sys.exit(0)
        else:
            logger.error("💥 Post-deployment seeding process failed!")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("⏹️  Post-deployment seeding interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"💥 Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
