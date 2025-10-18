from app import create_app
import click 
import os

app = create_app()

# Register a custom command to initialize the database
@app.cli.command("init-db")
def init_db_command():
    """Initializes and creates all database tables."""
    with app.app_context():
        from app import db
        # CRITICAL: Import ALL models so SQLAlchemy knows which tables to create
        # Adjust this list if you have other models not listed here
        from app.models import user, item, listing, repair_guide, saved_guide, support_ticket 

        print("Attempting to create database tables...")
        try:
            db.create_all()
            click.echo("Database initialized successfully: All tables created.")
        except Exception as e:
            click.echo(f"ERROR: Failed to create database tables. Exception: {e}")

if __name__ == '__main__':