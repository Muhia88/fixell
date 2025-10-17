import json
from app import create_app, db


def run_test():
    app = create_app()
    app.config['TESTING'] = True
    app.config['ENV'] = 'development'

    with app.test_client() as client:
        payload = {'description': 'A smartphone with a cracked screen and unresponsive touch.'}
        resp = client.post('/api/guides/generate_dev', data=json.dumps(payload), content_type='application/json')
        print('Status code:', resp.status_code)
        print('Response JSON:', resp.get_json())


if __name__ == '__main__':
    run_test()
