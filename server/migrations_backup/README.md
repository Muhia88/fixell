This folder intentionally contains Alembic migration snapshots for the project's database state.

Alembic is configured under `server/alembic/`. The migration engine uses files in `server/alembic/versions`.

To apply migrations, ensure your `server/.env.local` contains a valid `DATABASE_URL` (Supabase Postgres), then run:

```bash
cd server
alembic upgrade head
```

We keep this `migrations/` directory for compatibility with some deployment workflows that expect it; the canonical Alembic migration scripts live in `server/alembic/`.
