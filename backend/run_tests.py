#!/usr/bin/env python3
"""
Test runner script for the backend.
"""
import subprocess
import sys
import os


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print("STDOUT:")
        print(result.stdout)
    
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
    
    if result.returncode != 0:
        print(f"❌ {description} failed with exit code {result.returncode}")
        return False
    else:
        print(f"✅ {description} completed successfully")
        return True


def main():
    """Main test runner."""
    print("🧪 Backend Test Runner")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Test commands
    commands = [
        ("pytest tests/unit/ -v", "Unit Tests"),
        ("pytest tests/integration/ -v", "Integration Tests"),
        ("pytest tests/ -v --cov=app --cov-report=term-missing", "All Tests with Coverage"),
        ("pytest tests/ -v --cov=app --cov-report=html", "Generate HTML Coverage Report"),
    ]
    
    success_count = 0
    total_count = len(commands)
    
    for command, description in commands:
        if run_command(command, description):
            success_count += 1
    
    print(f"\n{'='*50}")
    print(f"Test Summary: {success_count}/{total_count} test suites passed")
    
    if success_count == total_count:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
