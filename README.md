# Fixell

Fixell is an AI-assisted sustainability marketplace for repairing, reusing, and reselling items. It helps users repair, rehome, and renew household items while tracking environmental impact (weight diverted from landfill) and money saved by reselling items.

## Features

- Repair: AI-assisted repair guides and a community marketplace to find parts and advice.
- Rehome: List items for sale or give away to extend their lifecycle.
- Renew: Tips and guides for repurposing and upcycling items.
- Per-user impact tracking (kg diverted, money saved from sales).

## Technologies Used

- Frontend: React, Vite, Tailwind CSS
- Backend: Python, Flask, SQLAlchemy, Flask-Migrate (Alembic)
- Database: Postgres
- AI: Optional OpenAI integration for weight estimation and guide generation

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Python 3.13.7
- Postgres (recommended) or configure SQLite for local testing

### Backend (server)

1. Create a virtual environment and install dependencies:

```bash
cd server
pipenv install
pipenv shell
pip install -r requirements.txt
```

2. Set required environment variables (example):

```bash
export SECRET_KEY="your-secret"
export DATABASE_URL="postgresql://user:pass@localhost:5432/fixell"
export OPENAI_API_KEY="sk-..." 
export SUPABASE_URL="..." 
export SUPABASE_KEY="..." 
```

3. Initialize database and run migrations:

```bash
flask db upgrade
```

4. Run the backend:

```bash
export FLASK_APP=main.py
flask run --port=5000
```

### Frontend (client)

1. Install dependencies and run dev server:

```bash
cd client
npm install
npm run dev
```

2. Open the app (typically at http://localhost:5173). The frontend expects the backend API to be available at `http://127.0.0.1:5000/api` by default.

## Usage

- Public pages: Landing (Home), About, Marketplace, Support.
- Authenticated pages: My Listings, My Impact, Create Listing, AI Assistant, Profile.
- Routes that require a logged-in user are protected by the frontend `ProtectedRoute` wrapper and will redirect to `/login` if accessed while unauthenticated.
- Impact calculations: weight estimates are recorded on certain actions (listing creation, guide saves) while `money_saved` is recorded only for confirmed ITEM_SOLD events.

## Authors

- Danel Muhia (Muhia88) — lead developer

Contributions welcome — open a PR or issue to suggest features or fixes.

## Testing

- Backend: pytest-based tests live in the `tests/` directory. Use Flask test client and a test DB for integration tests.
- Frontend: use React Testing Library / Jest for component tests.

## Troubleshooting

- If API requests return 404, check server logs for import-time exceptions in route modules.
- If your frontend cannot reach the backend, verify `client/src/api/axiosConfig.js` baseURL and that Flask is running on port 5000.

## License

This project is provided under the terms of the MIT LICENSE

