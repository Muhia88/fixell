from app import create_app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        from app import db
        import os
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI')
        print('DEBUG: SQLALCHEMY_DATABASE_URI =', db_uri)
        if db_uri and db_uri.startswith('sqlite:///'):
            db_path = os.path.abspath(db_uri.replace('sqlite:///', '', 1))
            print('DEBUG: resolved DB path =', db_path)
            print('DEBUG: exists =', os.path.exists(db_path))
            print('DEBUG: parent exists =', os.path.exists(os.path.dirname(db_path)))
            print('DEBUG: parent writable =', os.access(os.path.dirname(db_path), os.W_OK))
        try:
            db.create_all()
        except Exception as e:
            print('ERROR while creating DB tables:', e)
        print("Database checked/created successfully.")
        
    print("\n--- Fixell Flask Server Running ---")
    print("Registration Endpoint: POST /api/auth/register")
    
    app.run(debug=True)
