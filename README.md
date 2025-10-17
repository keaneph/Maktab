# Maktab

A modern Student Information System built with Flask (Python) for the backend and Next.js (React) for the frontend. UI is powered by Tailwind CSS and ShadCN; state/data fetching uses SWR.

## Features
- Data tables for Colleges, Programs, Students, and Users
  - Row selection, select-all, sorting, search, pagination
  - Single-row actions (Edit, Delete) as well as bulk delete
- Forms with validation (zod + react-hook-form)
- Dashboard with charts and quick metrics
- Session-aware requests (CORS with credentials)

## Tech Stack
- Backend: Flask
- Database: PostgreSQL 
- Frontend: Next.js, Tailwind CSS, ShadCN UI, SWR, TanStack Table   

## Dashboard Demo
![dashboard_demo](https://github.com/user-attachments/assets/30257e27-5b53-4a81-8b64-1a86d6788293)

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ (or 20+), npm
- PostgreSQL (or Supabase) and connection URL

### Backend Setup (Flask)
1) Create and configure environment variables (e.g. with a `.env` or your shell):
```
PIPENV_VENV_IN_PROJECT=1
SECRET_KEY=change-me
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

2) Install dependencies and run (Pipenv example):
```
cd backend
pipenv install
pipenv shell
pipenv flask run
```

### Frontend Setup (Next.js)
The frontend currently calls the backend using absolute URLs like `http://localhost:8080/api/...`, so no frontend env is required for local dev.

```
cd frontend
npm ci
npm run dev (for testing)
npm run build, then npm run start (for prod)
```

## Prior Versions
- Version 1: [Gungnir](https://github.com/keaneph/Gungnir) – WPF + CSV
- Version 2: [La Accademia](https://github.com/keaneph/La-Accademia) – WPF + MySQL

## License
This project is licensed under the terms of the LICENSE file in this repository.
