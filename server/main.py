from app.__init__ import create_app, db

# Create the application instance
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # This is a development command; in production, you would use migrations.
        db.create_all()
        print("Database checked/created successfully.")
        
    print("\n--- Fixell Flask Server Running ---")
    print("Registration Endpoint: POST /api/auth/register")
    
    # Run the application
    app.run(debug=True)
