# ✦ PromptVault — AI Prompt Library

> A full-stack application to store, browse, and manage AI image generation prompts.

![Tech Stack](https://img.shields.io/badge/Angular-16-red?logo=angular) ![Django](https://img.shields.io/badge/Django-4.2-green?logo=django) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql) ![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

---

## 📌 Overview

PromptVault is a full-stack prompt management library with:

- **Browse** all saved AI image prompts in a beautiful dark UI
- **Detail view** with live Redis-backed view counter
- **Add prompts** via a validated reactive Angular form
- **Tag filtering** (Bonus B: Many-to-Many tagging system)
- **One-command Docker** setup — `docker-compose up --build`

---

## 🧱 Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | Angular 16 + TypeScript       |
| Backend     | Python 3.11 + Django 4.2      |
| API Style   | Plain Django views → JSON     |
| Database    | PostgreSQL 15                 |
| Cache       | Redis 7 (view counter)        |
| Web Server  | Nginx (serves Angular)        |
| Container   | Docker + Docker Compose       |

---

## 🗂️ Project Structure

```
ai-prompt-library/
├── backend/
│   ├── config/               # Django project (settings, urls, wsgi)
│   ├── prompts/              # App: models, views, urls, admin, migrations
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── entrypoint.sh         # Waits for DB, runs migrations, starts gunicorn
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── prompt-list/    # Browse page
│   │   │   │   ├── prompt-detail/  # Detail + view count
│   │   │   │   └── add-prompt/     # Reactive form
│   │   │   ├── services/
│   │   │   │   └── prompt.service.ts
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.module.ts
│   │   ├── environments/
│   │   └── styles.css        # Global dark theme design system
│   ├── nginx.conf
│   ├── Dockerfile            # Multi-stage: build Angular → serve via nginx
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Running Locally (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### One-command startup

```bash
git clone https://github.com/<your-username>/ai-prompt-library.git
cd ai-prompt-library
docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost              |
| Backend   | http://localhost:8000         |
| Django Admin | http://localhost:8000/admin |

> **Note:** First `--build` takes ~3–5 minutes to install dependencies. Subsequent starts are fast.

### Create a Django superuser (optional, for Admin panel)

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                            |
|--------|--------------------|----------------------------------------|
| GET    | `/prompts/`        | List all prompts (supports `?tag=name`)|
| POST   | `/prompts/`        | Create a new prompt                    |
| GET    | `/prompts/<id>/`   | Retrieve one prompt + increment Redis view count |
| GET    | `/tags/`           | List all tags                          |

### POST /prompts/ — Request Body

```json
{
  "title": "Cyberpunk City at Night",
  "content": "A neon-lit cyberpunk cityscape at night with rain-slicked streets, holographic advertisements, flying cars and dense fog — cinematic, 8K, ultra-detailed.",
  "complexity": 7,
  "tags": ["cyberpunk", "scifi", "neon"]
}
```

### GET /prompts/:id/ — Response (includes Redis view count)

```json
{
  "id": 1,
  "title": "Cyberpunk City at Night",
  "content": "...",
  "complexity": 7,
  "created_at": "2025-01-01T12:00:00Z",
  "tags": ["cyberpunk", "scifi"],
  "view_count": 42
}
```

---

## 🧠 Architectural Decisions

### Backend
- **Plain Django views** (no DRF) as required — `JsonResponse` for all endpoints.
- **Validation** done inside views — returns `400` with field-level error dict.
- **Redis counter**: each `GET /prompts/:id/` call runs `INCR prompt:<id>:views` — Redis is the single source of truth for view counts.
- **Migrations** ship pre-generated (`0001_initial.py`) so no internet access is needed inside Docker.
- **entrypoint.sh** polls PostgreSQL with `psycopg2.connect` retry loop before running migrations, avoiding race conditions.

### Frontend
- **Angular 16** with Reactive Forms for the add-prompt page, with real-time validation messages.
- **Single PromptService** — all HTTP calls centralised; components stay clean.
- **Nginx** serves the production Angular build and proxies `/api/` calls to the Django backend, avoiding CORS issues entirely.

### DevOps
- Multi-stage frontend `Dockerfile` — Node 18 builds Angular, nginx:alpine serves static files (~15MB image).
- Shared Docker network `app-network` so services reference each other by service name.
- `postgres_data` named volume persists data across container restarts.

---

## ✅ Bonus Features Completed

| Bonus | Status |
|-------|--------|
| A — Authentication | ✅ Session-based auth, protected POST, Login screen |
| B — Tagging System | ✅ Many-to-Many `Tag` model, `?tag=` filter, UI tag chips + filter bar |

---

## 📸 Screenshots

> Run the app and visit http://localhost to see the live UI.

---

## 🛠️ Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp ../.env.example .env      # Edit DB/Redis settings
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start                    # Starts on http://localhost:4200
```

> Update `frontend/proxy.conf.json` to point at `http://localhost:8000` for local dev.
