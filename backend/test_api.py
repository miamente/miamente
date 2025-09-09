#!/usr/bin/env python3
"""
Test script to verify the API is working with the test professional.
"""
import requests
import json

def test_api():
    try:
        # Test the API endpoint
        response = requests.get('http://localhost:8001/api/v1/professionals')
        
        if response.status_code == 200:
            professionals = response.json()
            print('✅ API is working!')
            print(f'Found {len(professionals)} professionals')
            
            # Find our test professional
            test_pro = None
            for p in professionals:
                if p.get('email') == 'test.professional@miamente.com':
                    test_pro = p
                    break
            
            if test_pro:
                print('✅ Test professional found in API!')
                print(f'Name: {test_pro["full_name"]}')
                print(f'Specialty: {test_pro["specialty"]}')
                print(f'Rate: ${test_pro["rate_cents"] / 100:,.2f} {test_pro["currency"]}')
                print(f'ID: {test_pro["id"]}')
            else:
                print('❌ Test professional not found in API response')
                print('Available professionals:')
                for p in professionals:
                    print(f'  - {p.get("full_name", "Unknown")} ({p.get("email", "No email")})')
        else:
            print(f'❌ API error: {response.status_code}')
            print(response.text)
    except Exception as e:
        print(f'❌ Error testing API: {e}')

if __name__ == "__main__":
    test_api()
