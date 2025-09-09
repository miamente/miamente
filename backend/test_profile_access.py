#!/usr/bin/env python3
"""
Test profile access with token.
"""
import requests
import json

def test_profile_access():
    """Test profile access with token."""
    
    # First, get the token
    login_data = {
        "email": "test.professional@miamente.com",
        "password": "test123"
    }
    
    print("🔐 Getting access token...")
    login_response = requests.post(
        'http://localhost:8001/api/v1/auth/login/professional',
        json=login_data
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    token_data = login_response.json()
    access_token = token_data["access_token"]
    
    print("✅ Login successful!")
    print(f"   Token: {access_token[:50]}...")
    
    # Now test profile access
    print("\n👤 Testing profile access...")
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    profile_response = requests.get(
        'http://localhost:8001/api/v1/professionals/me/profile',
        headers=headers
    )
    
    if profile_response.status_code == 200:
        profile = profile_response.json()
        print("✅ Profile access successful!")
        print(f"   Name: {profile.get('full_name', 'Not found')}")
        print(f"   Email: {profile.get('email', 'Not found')}")
        print(f"   Specialty: {profile.get('specialty', 'Not found')}")
        print(f"   Rate: ${profile.get('rate_cents', 0) / 100:,.2f} {profile.get('currency', '')}")
    else:
        print(f"❌ Profile access failed: {profile_response.status_code}")
        print(profile_response.text)

if __name__ == "__main__":
    test_profile_access()
