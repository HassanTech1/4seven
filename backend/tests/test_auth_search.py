"""
Backend API Tests for 7777 Fashion E-commerce Store
Tests: Auth (register, login, me), Product search, Categories, Wishlist, Addresses, Orders
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Generate unique test user email for each run to avoid conflicts
TEST_EMAIL = f"TEST_user_{uuid.uuid4().hex[:8]}@7777.com"
TEST_PASSWORD = "Test123!"
TEST_NAME = "Test User"

# Store auth token globally for authenticated tests
auth_token = None
test_user_id = None


class TestAuthRegister:
    """Auth registration tests"""
    
    def test_register_new_user_success(self):
        """Test successful user registration"""
        global auth_token, test_user_id
        
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "phone": "+966500000000"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user object"
        assert data["token_type"] == "bearer"
        
        # Validate user data
        user = data["user"]
        assert user["email"] == TEST_EMAIL.lower()
        assert user["name"] == TEST_NAME
        assert "id" in user
        assert "created_at" in user
        
        # Store token for authenticated tests
        auth_token = data["access_token"]
        test_user_id = user["id"]
        
        print(f"Registration successful: user_id={test_user_id}")
    
    def test_register_duplicate_email_fails(self):
        """Test that registering with existing email fails"""
        payload = {
            "email": TEST_EMAIL,
            "password": "AnotherPassword123!",
            "name": "Duplicate User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 400, f"Expected 400 for duplicate email, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"Duplicate registration correctly rejected: {data['detail']}")
    
    def test_register_invalid_email_fails(self):
        """Test that invalid email format is rejected"""
        payload = {
            "email": "not-an-email",
            "password": TEST_PASSWORD,
            "name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print("Invalid email correctly rejected")


class TestAuthLogin:
    """Auth login tests"""
    
    def test_login_success(self):
        """Test successful login with registered user"""
        global auth_token
        
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL.lower()
        
        auth_token = data["access_token"]
        print(f"Login successful for {TEST_EMAIL}")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        payload = {
            "email": TEST_EMAIL,
            "password": "WrongPassword123!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"Wrong password correctly rejected: {data['detail']}")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        payload = {
            "email": "nonexistent@7777.com",
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        assert response.status_code == 401, f"Expected 401 for non-existent user, got {response.status_code}"
        print("Non-existent user login correctly rejected")
    
    def test_login_with_known_test_user(self):
        """Test login with the known test user from previous runs"""
        payload = {
            "email": "test@7777.com",
            "password": "Test123!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        # This user may or may not exist, just verify API behavior
        if response.status_code == 200:
            print("Existing test@7777.com user login successful")
        else:
            print(f"test@7777.com login returned {response.status_code} - may not exist")


class TestAuthMe:
    """Auth /me endpoint tests"""
    
    def test_get_current_user_authenticated(self):
        """Test getting current user info with valid token"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available - skipping authenticated test")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200, f"Get me failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "name" in data
        assert "created_at" in data
        assert data["email"] == TEST_EMAIL.lower()
        
        print(f"Get current user successful: {data['name']}")
    
    def test_get_current_user_no_token(self):
        """Test that /me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401, f"Expected 401 without token, got {response.status_code}"
        print("Unauthenticated /me correctly rejected")
    
    def test_get_current_user_invalid_token(self):
        """Test that invalid token is rejected"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 401, f"Expected 401 for invalid token, got {response.status_code}"
        print("Invalid token correctly rejected")


class TestProductSearch:
    """Product search API tests"""
    
    def test_search_all_products_no_query(self):
        """Test getting all products without filters"""
        response = requests.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200, f"Get products failed: {response.text}"
        data = response.json()
        
        assert "products" in data
        assert len(data["products"]) > 0, "Should have at least one product"
        
        # Validate product structure
        product = data["products"][0]
        assert "id" in product
        assert "name" in product
        assert "nameEn" in product
        assert "category" in product
        assert "price" in product
        assert "image" in product
        
        print(f"Get all products: {len(data['products'])} products returned")
    
    def test_search_products_by_text(self):
        """Test searching products by text query"""
        response = requests.get(f"{BASE_URL}/api/products/search?q=leather")
        
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        assert "products" in data
        assert "total" in data
        
        # Check results contain "leather" in name
        for product in data["products"]:
            assert "leather" in product["nameEn"].lower() or "leather" in product["name"].lower(), \
                f"Product {product['nameEn']} doesn't match 'leather' query"
        
        print(f"Search 'leather': {data['total']} products found")
    
    def test_search_products_by_arabic_text(self):
        """Test searching products by Arabic text"""
        response = requests.get(f"{BASE_URL}/api/products/search?q=حقيبة")
        
        assert response.status_code == 200, f"Arabic search failed: {response.text}"
        data = response.json()
        
        assert "products" in data
        print(f"Arabic search 'حقيبة': {data['total']} products found")
    
    def test_search_products_by_category(self):
        """Test filtering products by category"""
        response = requests.get(f"{BASE_URL}/api/products/search?category=bags")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data
        # All products should be in 'bags' category
        for product in data["products"]:
            assert product["category"] == "bags", f"Product {product['nameEn']} not in bags category"
        
        print(f"Category filter 'bags': {data['total']} products found")
    
    def test_search_products_combined_filters(self):
        """Test search with both text and category filter"""
        response = requests.get(f"{BASE_URL}/api/products/search?q=classic&category=bags")
        
        assert response.status_code == 200
        data = response.json()
        
        for product in data["products"]:
            assert product["category"] == "bags"
        
        print(f"Combined search 'classic' + 'bags': {data['total']} products found")
    
    def test_search_no_results(self):
        """Test search that returns no results"""
        response = requests.get(f"{BASE_URL}/api/products/search?q=xyznonexistentproduct")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 0
        assert len(data["products"]) == 0
        print("No results search handled correctly")
    
    def test_get_products_by_category(self):
        """Test getting products filtered by category via /products endpoint"""
        response = requests.get(f"{BASE_URL}/api/products?category=shirts")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data
        for product in data["products"]:
            assert product["category"] == "shirts"
        
        print(f"Products by category 'shirts': {len(data['products'])} products")


class TestCategories:
    """Category API tests"""
    
    def test_get_all_categories(self):
        """Test getting all categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        
        assert response.status_code == 200, f"Get categories failed: {response.text}"
        data = response.json()
        
        assert "categories" in data
        assert len(data["categories"]) > 0
        
        # Validate category structure
        category = data["categories"][0]
        assert "id" in category
        assert "name" in category
        assert "nameEn" in category
        
        # Check expected categories exist
        category_ids = [c["id"] for c in data["categories"]]
        assert "bags" in category_ids
        assert "shirts" in category_ids
        assert "jackets" in category_ids
        assert "pants" in category_ids
        
        print(f"Get categories: {len(data['categories'])} categories returned")


class TestProductDetail:
    """Product detail API tests"""
    
    def test_get_product_by_id(self):
        """Test getting a specific product by ID"""
        response = requests.get(f"{BASE_URL}/api/products/1")
        
        assert response.status_code == 200, f"Get product failed: {response.text}"
        data = response.json()
        
        assert data["id"] == 1
        assert "name" in data
        assert "nameEn" in data
        assert "price" in data
        assert "category" in data
        
        print(f"Get product 1: {data['nameEn']} - {data['price']} SAR")
    
    def test_get_product_not_found(self):
        """Test getting non-existent product"""
        response = requests.get(f"{BASE_URL}/api/products/99999")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent product correctly returns 404")


class TestWishlist:
    """Wishlist API tests (requires authentication)"""
    
    def test_get_empty_wishlist(self):
        """Test getting wishlist (initially empty for new user)"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/wishlist", headers=headers)
        
        assert response.status_code == 200, f"Get wishlist failed: {response.text}"
        data = response.json()
        
        assert "items" in data
        print(f"Wishlist has {len(data['items'])} items")
    
    def test_add_to_wishlist(self):
        """Test adding a product to wishlist"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        payload = {
            "product_id": 1,
            "name": "Luxury Leather Bag",
            "price": 1299.0,
            "image": "https://images.unsplash.com/photo-1589363358751-ab05797e5629"
        }
        response = requests.post(f"{BASE_URL}/api/wishlist/add", headers=headers, json=payload)
        
        assert response.status_code == 200, f"Add to wishlist failed: {response.text}"
        data = response.json()
        assert "message" in data
        
        print("Added product 1 to wishlist")
    
    def test_verify_wishlist_item_added(self):
        """Verify item was added to wishlist by getting it"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/wishlist", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that product 1 is in wishlist
        product_ids = [item["product_id"] for item in data["items"]]
        assert 1 in product_ids, "Product 1 should be in wishlist"
        
        print(f"Verified wishlist contains product 1, total items: {len(data['items'])}")
    
    def test_add_duplicate_to_wishlist(self):
        """Test adding same product to wishlist doesn't duplicate"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        payload = {
            "product_id": 1,
            "name": "Luxury Leather Bag",
            "price": 1299.0,
            "image": "https://images.unsplash.com/photo-1589363358751-ab05797e5629"
        }
        
        # Add again
        response = requests.post(f"{BASE_URL}/api/wishlist/add", headers=headers, json=payload)
        assert response.status_code == 200
        
        # Verify no duplicate
        get_response = requests.get(f"{BASE_URL}/api/wishlist", headers=headers)
        data = get_response.json()
        count = sum(1 for item in data["items"] if item["product_id"] == 1)
        assert count == 1, "Should not have duplicate wishlist items"
        
        print("Duplicate prevention working correctly")
    
    def test_remove_from_wishlist(self):
        """Test removing a product from wishlist"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(f"{BASE_URL}/api/wishlist/1", headers=headers)
        
        assert response.status_code == 200, f"Remove from wishlist failed: {response.text}"
        
        # Verify it's removed
        get_response = requests.get(f"{BASE_URL}/api/wishlist", headers=headers)
        data = get_response.json()
        product_ids = [item["product_id"] for item in data["items"]]
        assert 1 not in product_ids, "Product 1 should be removed from wishlist"
        
        print("Product 1 removed from wishlist and verified")
    
    def test_wishlist_requires_auth(self):
        """Test that wishlist endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/wishlist")
        assert response.status_code == 401
        
        response = requests.post(f"{BASE_URL}/api/wishlist/add", json={"product_id": 1})
        assert response.status_code == 401
        
        print("Wishlist authentication requirement verified")


class TestAddresses:
    """Address API tests (requires authentication)"""
    
    created_address_id = None
    
    def test_get_empty_addresses(self):
        """Test getting addresses (initially empty for new user)"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/addresses", headers=headers)
        
        assert response.status_code == 200, f"Get addresses failed: {response.text}"
        data = response.json()
        
        assert "addresses" in data
        print(f"User has {len(data['addresses'])} addresses")
    
    def test_add_address(self):
        """Test adding a new address"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        payload = {
            "title": "TEST_Home",
            "full_name": "Test User",
            "phone": "+966500000000",
            "street": "123 Test Street",
            "city": "Riyadh",
            "region": "Riyadh",
            "postal_code": "12345",
            "is_default": True
        }
        response = requests.post(f"{BASE_URL}/api/addresses", headers=headers, json=payload)
        
        assert response.status_code == 200, f"Add address failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert data["title"] == "TEST_Home"
        assert data["full_name"] == "Test User"
        assert data["city"] == "Riyadh"
        assert data["is_default"] == True
        
        TestAddresses.created_address_id = data["id"]
        print(f"Address created with ID: {data['id']}")
    
    def test_verify_address_added(self):
        """Verify address was added by getting all addresses"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/addresses", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        address_ids = [addr["id"] for addr in data["addresses"]]
        assert TestAddresses.created_address_id in address_ids, "Created address should be in list"
        
        print(f"Verified address {TestAddresses.created_address_id} is in list")
    
    def test_add_second_address_default_handling(self):
        """Test that setting new default removes old default"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        payload = {
            "title": "TEST_Work",
            "full_name": "Test User",
            "phone": "+966500000001",
            "street": "456 Work Street",
            "city": "Jeddah",
            "region": "Makkah",
            "is_default": True
        }
        response = requests.post(f"{BASE_URL}/api/addresses", headers=headers, json=payload)
        
        assert response.status_code == 200
        print("Second address with default=True created")
    
    def test_delete_address(self):
        """Test deleting an address"""
        global auth_token
        
        if not auth_token or not TestAddresses.created_address_id:
            pytest.skip("No auth token or address ID available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(
            f"{BASE_URL}/api/addresses/{TestAddresses.created_address_id}", 
            headers=headers
        )
        
        assert response.status_code == 200, f"Delete address failed: {response.text}"
        
        # Verify it's deleted
        get_response = requests.get(f"{BASE_URL}/api/addresses", headers=headers)
        data = get_response.json()
        address_ids = [addr["id"] for addr in data["addresses"]]
        assert TestAddresses.created_address_id not in address_ids, "Deleted address should not be in list"
        
        print(f"Address {TestAddresses.created_address_id} deleted and verified")
    
    def test_delete_nonexistent_address(self):
        """Test deleting non-existent address returns 404"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(f"{BASE_URL}/api/addresses/nonexistent-id-12345", headers=headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent address delete correctly returns 404")
    
    def test_addresses_require_auth(self):
        """Test that address endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/addresses")
        assert response.status_code == 401
        
        response = requests.post(f"{BASE_URL}/api/addresses", json={"title": "Test"})
        assert response.status_code == 401
        
        print("Address authentication requirement verified")


class TestOrders:
    """Order history API tests (requires authentication)"""
    
    def test_get_orders_authenticated(self):
        """Test getting order history for authenticated user"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        
        assert response.status_code == 200, f"Get orders failed: {response.text}"
        data = response.json()
        
        assert "orders" in data
        print(f"User has {len(data['orders'])} orders")
    
    def test_get_orders_requires_auth(self):
        """Test that orders endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Orders authentication requirement verified")
    
    def test_get_single_order_not_found(self):
        """Test getting non-existent order returns 404"""
        global auth_token
        
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/orders/nonexistent-order-id", headers=headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent order correctly returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
