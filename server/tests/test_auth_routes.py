import json


def register_user(client, email='test@example.com', password='password', name='Test'):
    payload = {'email': email, 'password': password, 'name': name}
    return client.post('/api/auth/register', json=payload)


def login_user(client, email='test@example.com', password='password'):
    payload = {'email': email, 'password': password}
    return client.post('/api/auth/login', json=payload)


def test_register_and_login(client):
    resp = register_user(client)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['message'] == 'User registered successfully'

    resp2 = login_user(client)
    assert resp2.status_code == 200
    d2 = resp2.get_json()
    assert 'token' in d2


def test_profile_get_and_update(client):
    # register and login
    register_user(client, email='profile@example.com')
    lr = login_user(client, email='profile@example.com')
    token = lr.get_json()['token']

    # GET profile
    g = client.get('/api/auth/profile', headers={'Authorization': f'Bearer {token}'})
    assert g.status_code == 200
    assert 'user' in g.get_json()

    # PUT update profile
    payload = {'name': 'Updated Name', 'email': 'updated@example.com'}
    p = client.put('/api/auth/profile', json=payload, headers={'Authorization': f'Bearer {token}'})
    assert p.status_code == 200
    j = p.get_json()
    assert j['message'] == 'Profile updated successfully'
    assert j['user']['email'] == 'updated@example.com'
