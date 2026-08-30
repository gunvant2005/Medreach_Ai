def test_create_and_update_reservation(client):
    # Login as patient
    login_res = client.post("/api/auth/login", json={
        "email": "patient@medreach.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get pharmacy
    pharmacies = client.get("/api/pharmacies").json()
    pharmacy_id = pharmacies[0]["id"]

    # Get medicine
    meds = client.get("/api/medicines/search?q=Paracetamol").json()
    med_id = meds[0]["id"]

    # Create reservation
    res_response = client.post("/api/reservations", json={
        "pharmacy_id": pharmacy_id,
        "items": [
            {"medicine_id": med_id, "quantity": 2}
        ]
    }, headers=headers)
    assert res_response.status_code == 200
    res_data = res_response.json()
    assert res_data["status"] == "PENDING"
    assert res_data["reservation_code"].startswith("MR-")

    # Pharmacist updates status to CONFIRMED
    res_id = res_data["id"]
    pharm_login = client.post("/api/auth/login", json={
        "email": "pharmacist@medreach.ai",
        "password": "password123"
    })
    pharm_token = pharm_login.json()["access_token"]
    pharm_headers = {"Authorization": f"Bearer {pharm_token}"}

    update_res = client.put(f"/api/reservations/{res_id}/status", json={
        "status": "CONFIRMED"
    }, headers=pharm_headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "CONFIRMED"
