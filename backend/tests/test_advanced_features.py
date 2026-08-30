import pytest
from fastapi.testclient import TestClient

def test_delivery_quote_endpoint(client: TestClient):
    response = client.post("/api/reservations/delivery/quote?pharmacy_id=1&distance_km=2.5")
    assert response.status_code == 200
    data = response.json()
    assert data["is_serviceable"] is True
    assert data["estimated_minutes"] >= 15
    assert data["delivery_fee"] > 0
    assert "rider" in data
    assert data["courier_partner"] != ""

def test_doctor_push_and_inbox(client: TestClient):
    # Obtain patient token
    login_res = client.post("/api/auth/login", json={
        "email": "patient@medreach.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test doctor prescription push
    push_payload = {
        "doctor_name": "Dr. Test Specialist, MD",
        "clinic_name": "Test Hospital",
        "doctor_license": "MCI-998877",
        "patient_name": "Rahul Patel",
        "diagnosis": "Seasonal Influenza",
        "items": [
            {
                "name": "Paracetamol 650",
                "generic_name": "Paracetamol",
                "dosage": "650mg",
                "frequency": "1-0-1",
                "duration_days": 5,
                "quantity": 10,
                "medicine_id": 1
            }
        ]
    }
    push_res = client.post("/api/prescriptions/doctor-push", json=push_payload)
    assert push_res.status_code == 200
    res_data = push_res.json()
    assert res_data["success"] is True
    assert res_data["prescription"]["doctor_name"] == "Dr. Test Specialist, MD"

    # Test patient inbox fetch
    inbox_res = client.get("/api/prescriptions/inbox/my", headers=headers)
    assert inbox_res.status_code == 200
    inbox_data = inbox_res.json()
    assert len(inbox_data) >= 1
    assert any(rx["doctor_name"] == "Dr. Test Specialist, MD" for rx in inbox_data)
