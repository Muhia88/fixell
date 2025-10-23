from app import create_app
import click 
import os

app = create_app()

@app.cli.command("init-db")
def init_db_command():
    """Initializes and creates all database tables."""
    with app.app_context():
        from app import db
        from app.models import user, item, listing, repair_guide, saved_guide, support_ticket 

        print("Attempting to create database tables...")
        try:
            db.create_all()
            click.echo("Database initialized successfully: All tables created.")
        except Exception as e:
            click.echo(f"ERROR: Failed to create database tables. Exception: {e}")

if __name__ == '__main__':
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '1') in ('1', 'true', 'True')

    app.run(host=host, port=port, debug=debug)