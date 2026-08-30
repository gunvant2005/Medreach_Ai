from app.services.ranking_service import ranking_service

def test_haversine_distance():
    # Distance between two nearby coordinates in Jalgaon
    dist = ranking_service.calculate_haversine_distance(21.0000, 75.5600, 21.0025, 75.5645)
    assert dist > 0.0
    assert dist < 2.0

def test_nearby_pharmacy_ranking(client):
    response = client.get("/api/pharmacies/nearby?latitude=21.0000&longitude=75.5600&medicine_name=Paracetamol")
    assert response.status_code == 200
    ranked = response.json()
    assert len(ranked) > 0
    top_match = ranked[0]
    assert "distance_km" in top_match
    assert "final_score" in top_match
    assert "match_tag" in top_match
    assert "match_reasons" in top_match
    assert top_match["final_score"] > 0

def test_urgent_mode(client):
    response = client.get("/api/pharmacies/nearby?latitude=21.0000&longitude=75.5600&medicine_name=Paracetamol&urgent_mode=true")
    assert response.status_code == 200
    ranked = response.json()
    assert len(ranked) > 0
