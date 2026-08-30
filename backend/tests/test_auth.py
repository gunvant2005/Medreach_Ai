def test_patient_login(client):
    response = client.post("/api/auth/login", json={
        "email": "patient@medreach.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "patient@medreach.ai"
    assert data["user"]["role"] == "PATIENT"

def test_invalid_login(client):
    response = client.post("/api/auth/login", json={
        "email": "patient@medreach.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_register_new_patient(client):
    response = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "newuser@test.com",
        "password": "securepassword123",
        "phone": "+91 99999 88888",
        "role": "PATIENT"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "newuser@test.com"
