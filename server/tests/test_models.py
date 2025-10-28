from app.models.user import User


def test_user_password_hashing():
    u = User(email='m@test.com', name='M')
    u.set_password('secret')
    assert u.check_password('secret') is True
    assert u.check_password('wrong') is False
