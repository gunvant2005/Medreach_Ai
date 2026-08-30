def test_search_paracetamol(client):
    response = client.get("/api/medicines/search?q=Paracetamol")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert any("Paracetamol" in item["name"] for item in results)

def test_search_ors(client):
    response = client.get("/api/medicines/search?q=ORS")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert any("ORS" in item["name"] or "Rehydration" in item["name"] for item in results)

def test_list_medicines(client):
    response = client.get("/api/medicines")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 50
