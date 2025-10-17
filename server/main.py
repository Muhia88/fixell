from app import create_app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Use the app context to ensure extensions like SQLAlchemy are initialized
    with app.app_context():
        from app import db
        # This is a development command; in production, you would use migrations.
        db.create_all()
        print("Database checked/created successfully.")
        
    print("\n--- Fixell Flask Server Running ---")
    print("Registration Endpoint: POST /api/auth/register")
    
    # Run the application
    app.run(debug=True)
