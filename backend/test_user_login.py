#!/usr/bin/env python3
"""
Test login for the converted user.
"""
import requests
import json

def test_user_login():
    """Test login for the converted user."""
    
    # Test login with the converted user
    login_data = {
        "email": "test@miamente.com",
        "password": "test123"  # Assuming this is the password
    }
    
    print("🔐 Testing login for converted user...")
    print(f"   Email: {login_data['email']}")
    
    try:
        response = requests.post(
            'http://localhost:8001/api/v1/auth/login/professional',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login successful!")
            print(f"   Access Token: {token_data['access_token'][:50]}...")
            print(f"   Token Type: {token_data['token_type']}")
            
            # Test profile access
            print("\n👤 Testing profile access...")
            headers = {
                'Authorization': f'Bearer {token_data["access_token"]}'
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
                print(f"   Bio: {profile.get('bio', 'Not found')}")
            else:
                print(f"❌ Profile access failed: {profile_response.status_code}")
                print(profile_response.text)
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    test_user_login()
