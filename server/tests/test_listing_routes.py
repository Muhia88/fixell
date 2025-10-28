def test_create_and_mark_sold_flow(client):
    #register and login
    client.post('/api/auth/register', json={'email': 'seller@example.com', 'password': 'pw', 'name': 'Seller'})
    lr = client.post('/api/auth/login', json={'email': 'seller@example.com', 'password': 'pw'})
    token = lr.get_json()['token']

    #Create listing 
    data = {
        'title': 'Test Item',
        'description': 'A thing',
        'price': '100',
        'category': 'Misc',
    }
    resp = client.post('/api/listings/', data=data, headers={'Authorization': f'Bearer {token}'})
    #should return 201 or 200
    assert resp.status_code in (200, 201)
    listing = resp.get_json().get('data')
    assert listing is not None
    listing_id = listing['id']

    # Mark as sold with 0 KES (donation)
    resp2 = client.post(f'/api/listings/{listing_id}/sell', json={'sold_price_kes': 0}, headers={'Authorization': f'Bearer {token}'})
    assert resp2.status_code == 200
    updated = resp2.get_json().get('data')
    assert updated['status'] == 'sold'
