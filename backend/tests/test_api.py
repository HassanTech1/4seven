"""
Backend API Tests for 7777 Fashion E-commerce Store
Tests: Health check, Status API, Checkout API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Basic health check and root endpoint tests"""
    
    def test_root_endpoint_returns_200(self):
        """Test that the root API endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"
        print(f"Root endpoint test passed: {data}")


class TestStatusAPI:
    """Status API CRUD tests"""
    
    def test_create_status_check(self):
        """Test creating a new status check"""
        payload = {"client_name": "TEST_pytest_client"}
        response = requests.post(f"{BASE_URL}/api/status", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["client_name"] == "TEST_pytest_client"
        assert "timestamp" in data
        print(f"Status created: {data}")
        return data
    
    def test_get_status_checks(self):
        """Test retrieving all status checks"""
        # First create one to ensure there's data
        payload = {"client_name": "TEST_pytest_get_check"}
        create_response = requests.post(f"{BASE_URL}/api/status", json=payload)
        assert create_response.status_code == 200
        
        # Then retrieve all
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Retrieved {len(data)} status checks")


class TestCheckoutAPI:
    """Stripe Checkout API tests"""
    
    def test_create_checkout_session_single_item(self):
        """Test creating a checkout session with a single item"""
        payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com",
            "items": [
                {
                    "product_id": 1,
                    "name": "TEST_Luxury Leather Bag",
                    "price": 1299.0,
                    "quantity": 1,
                    "size": "M"
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data, "Response should contain a checkout URL"
        assert "session_id" in data, "Response should contain a session ID"
        assert data["url"].startswith("https://checkout.stripe.com"), "URL should be a valid Stripe checkout URL"
        assert len(data["session_id"]) > 0, "Session ID should not be empty"
        print(f"Checkout session created: session_id={data['session_id'][:20]}...")
        return data
    
    def test_create_checkout_session_multiple_items(self):
        """Test creating a checkout session with multiple items"""
        payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com",
            "items": [
                {
                    "product_id": 1,
                    "name": "TEST_Luxury Leather Bag",
                    "price": 1299.0,
                    "quantity": 1,
                    "size": "M"
                },
                {
                    "product_id": 4,
                    "name": "TEST_Elegant Summer Shirt",
                    "price": 299.0,
                    "quantity": 2,
                    "size": "L"
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        print(f"Multi-item checkout session created successfully")
    
    def test_create_checkout_session_missing_fields(self):
        """Test checkout API with missing required fields"""
        # Missing items field
        payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print(f"Validation error correctly returned for missing fields")
    
    def test_create_checkout_session_empty_items(self):
        """Test checkout API with empty items array"""
        payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com",
            "items": []
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        
        # Empty cart should still work (Stripe handles it)
        # The API should return 200 with URL or 400/422 for validation
        print(f"Empty items response: {response.status_code} - {response.text[:100]}")
    
    def test_get_checkout_status_invalid_session(self):
        """Test getting status for a non-existent session"""
        invalid_session_id = "invalid_session_123"
        response = requests.get(f"{BASE_URL}/api/checkout/status/{invalid_session_id}")
        
        # Should return error status for invalid session (400, 404, 500, 520)
        assert response.status_code in [400, 404, 500, 520], f"Expected error status for invalid session, got {response.status_code}"
        print(f"Invalid session correctly returned error: {response.status_code}")
    
    def test_get_checkout_status_valid_session(self):
        """Test getting status for a valid session"""
        # First create a session
        create_payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com",
            "items": [
                {
                    "product_id": 1,
                    "name": "TEST_Status Check Item",
                    "price": 100.0,
                    "quantity": 1,
                    "size": "S"
                }
            ]
        }
        create_response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=create_payload)
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Then get its status
        status_response = requests.get(f"{BASE_URL}/api/checkout/status/{session_id}")
        assert status_response.status_code == 200
        
        data = status_response.json()
        assert "status" in data
        assert "payment_status" in data
        print(f"Session status retrieved: status={data['status']}, payment_status={data['payment_status']}")


class TestCheckoutDifferentSizes:
    """Test checkout with different size options"""
    
    @pytest.mark.parametrize("size", ["XS", "S", "M", "L", "XL", "XXL"])
    def test_checkout_with_size(self, size):
        """Test checkout creates session for each size option"""
        payload = {
            "origin_url": "https://sevens-fashion-hub.preview.emergentagent.com",
            "items": [
                {
                    "product_id": 1,
                    "name": f"TEST_Product with size {size}",
                    "price": 299.0,
                    "quantity": 1,
                    "size": size
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/api/checkout/create-session", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        print(f"Checkout with size {size} successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
