#!/usr/bin/env python3
import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    # Test endpoints
    endpoints = [
        "/",
        "/docs",
        "/api/v3/generate-plan/testuser"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"\nTesting {endpoint}...")
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                try:
                    print(f"Response: {json.dumps(response.json(), indent=2)[:200]}...")
                except:
                    print(f"Response: {response.text[:200]}...")
        except requests.exceptions.Timeout:
            print(f"Timeout for {endpoint}")
        except requests.exceptions.ConnectionError:
            print(f"Connection error for {endpoint}")
        except Exception as e:
            print(f"Error for {endpoint}: {e}")

if __name__ == "__main__":
    test_api()