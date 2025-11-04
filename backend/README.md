Backend (Express + TypeScript)

Scripts:
- npm run dev: Start dev server with ts-node-dev
- npm run build: Compile TypeScript to dist
- npm start: Run compiled server

Endpoints:
- GET /health → { status: 'ok' }
- GET /api/complaints → list in-memory complaints
- POST /api/complaints { title, description } → create complaint

Env:
- Copy .env.example to .env and adjust PORT if needed.
