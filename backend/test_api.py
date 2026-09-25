import os
import sys

# Ensure current directory is on python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("--- Starting Backend API Test Suite ---")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: Health check")

    # 2. Public review endpoint
    res = client.get("/api/public/review/dhankranti")
    assert res.status_code == 200, f"Public review failed: {res.text}"
    data = res.json()
    assert data["shop"]["name"] == "Dhankranti Share Market Classes"
    assert len(data["categories"]) == 8, f"Expected 8 categories, got {len(data['categories'])}"
    total_reviews = sum(len(c["reviews"]) for c in data["categories"])
    assert total_reviews == 80, f"Expected 80 reviews, got {total_reviews}"
    print(f"PASS: Public review page loaded shop '{data['shop']['name']}' with {len(data['categories'])} categories and {total_reviews} reviews")

    # 3. Invalid QR token
    res = client.get("/api/public/review/invalid_token_123")
    assert res.status_code == 404, "Expected 404 for invalid QR token"
    print("PASS: Invalid QR token returns 404")

    # 4. Session flow
    res = client.post("/api/public/sessions", json={"qr_token": "dhankranti"})
    assert res.status_code == 201, f"Session creation failed: {res.text}"
    session_data = res.json()
    session_token = session_data["session_token"]
    assert session_token is not None
    print(f"PASS: Created customer session: {session_token}")

    # Select review #1
    review_to_select = data["categories"][0]["reviews"][0]["id"]
    res = client.post(f"/api/public/sessions/{session_token}/select", json={"review_id": review_to_select})
    assert res.status_code == 200, f"Select review failed: {res.text}"
    updated_session = res.json()
    assert updated_session["selected_review_id"] == review_to_select
    assert updated_session["selected_at"] is not None
    print("PASS: Review selected in session")

    # Mark copied
    res = client.post(f"/api/public/sessions/{session_token}/copy")
    assert res.status_code == 200, f"Copy failed: {res.text}"
    copied_session = res.json()
    assert copied_session["copied_at"] is not None
    print("PASS: Review marked copied in session")

    # Mark redirected
    res = client.post(f"/api/public/sessions/{session_token}/redirect")
    assert res.status_code == 200, f"Redirect failed: {res.text}"
    redirected_session = res.json()
    assert redirected_session["redirected_at"] is not None
    print("PASS: Review marked redirected in session")

    # Verify review still exists on public review page (NOT deleted!)
    res_after = client.get("/api/public/review/dhankranti")
    total_reviews_after = sum(len(c["reviews"]) for c in res_after.json()["categories"])
    assert total_reviews_after == 80, "Review was wrongly deleted!"
    print("PASS: Review was not deleted and remains available for other customers")

    # 5. Admin Authentication
    # Invalid login
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "WrongPassword"})
    assert res.status_code == 401, "Expected 401 for wrong password"
    print("PASS: Admin login rejected with invalid password")

    # Valid login
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "Admin@123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    login_data = res.json()
    token = login_data["access_token"]
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    print("PASS: Admin login successful, received JWT token")

    # Protected route without token -> 401
    res = client.get("/api/admin/dashboard")
    assert res.status_code == 401, "Protected route accessible without token!"
    print("PASS: Protected route rejected unauthorized request")

    # Protected route with token
    res = client.get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    dash_data = res.json()
    assert dash_data["total_shops"] >= 1
    assert dash_data["total_categories"] == 8
    assert dash_data["total_reviews"] >= 80
    assert dash_data["total_sessions"] >= 1
    print(f"PASS: Dashboard stats retrieved: {dash_data['total_shops']} shops, {dash_data['total_categories']} categories, {dash_data['total_reviews']} reviews, {dash_data['total_sessions']} sessions")

    # Admin shops CRUD
    res = client.post(
        "/api/admin/shops",
        headers=headers,
        json={"name": "Test Bistro", "tagline": "Cozy dining", "review_url": "https://example.com/bistro"}
    )
    assert res.status_code == 201, f"Create shop failed: {res.text}"
    test_shop = res.json()
    test_shop_id = test_shop["id"]
    print(f"PASS: Created test shop #{test_shop_id} ({test_shop['slug']})")

    # Get QR for shop
    res = client.get(f"/api/admin/shops/{test_shop_id}/qr", headers=headers)
    assert res.status_code == 200
    qr_data = res.json()
    assert qr_data["qr_data_url"].startswith("data:image/png;base64,")
    print("PASS: Generated QR code data URI for shop")

    # Clean up test shop
    res = client.delete(f"/api/admin/shops/{test_shop_id}", headers=headers)
    assert res.status_code == 204
    print("PASS: Deleted test shop")

    # Sessions list
    res = client.get("/api/admin/sessions", headers=headers)
    assert res.status_code == 200
    sessions_list = res.json()
    assert len(sessions_list) >= 1
    print(f"PASS: Admin sessions list retrieved {len(sessions_list)} sessions")

    print("\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_tests()
