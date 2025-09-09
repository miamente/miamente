#!/usr/bin/env python3
"""
Debug script to test login endpoint with detailed error information.
"""
import requests
import json
import traceback

def debug_login():
    """Debug login endpoint with detailed error information."""
    
    login_data = {
        "email": "test.professional@miamente.com",
        "password": "test123"
    }
    
    print("🔐 Testing professional login endpoint...")
    print(f"   Email: {login_data['email']}")
    print(f"   Password: {login_data['password']}")
    
    try:
        response = requests.post(
            'http://localhost:8001/api/v1/auth/login/professional',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"   Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"   Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        print(f"   Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    debug_login()
