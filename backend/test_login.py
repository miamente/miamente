#!/usr/bin/env python3
"""
Test script to verify professional login functionality.
"""
import requests
import json

def test_professional_login():
    try:
        # Test professional login
        login_data = {
            "email": "test.professional@miamente.com",
            "password": "test123"
        }
        
        response = requests.post(
            'http://localhost:8001/api/v1/auth/login/professional',
            json=login_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print('✅ Professional login successful!')
            print(f'Access Token: {data.get("access_token", "Not found")[:50]}...')
            print(f'Token Type: {data.get("token_type", "Not found")}')
            print(f'User ID: {data.get("user_id", "Not found")}')
            
            # Test getting professional profile with token
            headers = {
                'Authorization': f'Bearer {data["access_token"]}'
            }
            
            profile_response = requests.get(
                'http://localhost:8001/api/v1/professionals/me/profile',
                headers=headers
            )
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                print('✅ Professional profile access successful!')
                print(f'Name: {profile.get("full_name", "Not found")}')
                print(f'Email: {profile.get("email", "Not found")}')
                print(f'Specialty: {profile.get("specialty", "Not found")}')
            else:
                print(f'❌ Profile access failed: {profile_response.status_code}')
                print(profile_response.text)
                
        else:
            print(f'❌ Login failed: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Error testing login: {e}')

if __name__ == "__main__":
    print("🔐 Testing professional login...")
    test_professional_login()
