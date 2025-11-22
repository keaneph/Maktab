<h1 align="center">
  Maktab - Student Information System

![status](https://img.shields.io/badge/status-DONE-green?)
![GitHub last commit](https://img.shields.io/github/last-commit/keaneph/Maktab?)
![Next.js](https://img.shields.io/badge/Next.js-15-white?&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?&logo=react&logoColor=blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.13-yellow?&logo=python)
![Flask](https://img.shields.io/badge/Flask-3-lightblue?&logo=flask)
![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?&logo=supabase)

</h1>

A web application for managing student information. It includes a modern Next.js + React frontend and a Flask backend that integrates with Supabase for authentication, and storage.

## Key features

- Next.js 15 + React 19 frontend (TypeScript)
- Flask backend (Python 3.13) providing API endpoints and Supabase integration
- Supabase for auth, realtime, and Postgres storage
- Tailwind CSS for styling and a collection of reusable UI components

## Who should read this

This README is focused on developers who want to run the project locally, contribute, or extend it. For API reference and user documentation, see the `client/` and `server/` source folders and any internal docs.

---

## Quick start — run locally (PowerShell)

Prerequisites

- Node.js 20+ (for the `client`)
- Python 3.13 (for the `server`)
- pipenv (optional; you can also use plain venv + pip)

Open two terminals (one for frontend, one for backend) and run:

Frontend (client)

```powershell
cd client
npm install
npm run dev
```

The frontend dev server runs at http://localhost:3000 by default.

Backend (server)

If you use pipenv (recommended for parity with this repo):

```powershell
cd server
pipenv install      # first time only
pipenv shell
python -m flask run # runs on http://localhost:5000
exit                # leave the virtualenv
```

Or with a plain venv:

```powershell
cd server
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python -m flask run
```

**Environment variables**

Create a `.env.local` file in the `client/` directory (or set env vars in your shell). Minimum vars used by the client:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
```

Create a `.env` file in the `server/` directory (or set env vars in your shell). Minimum vars used by the server:

```text
PIPENV_VENV_IN_PROJECT=1
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
```

## Project layout (top-level)

```
README.md            # <- you are here
client/              # Next.js frontend (TSX, Tailwind)
server/              # Flask backend and API
```

## Development notes

- Frontend tech highlights: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4.
- Backend tech highlights: Flask, Flask-CORS, python-dotenv, Supabase Python client.
- See `client/package.json` for available npm scripts (dev, build, start, lint).
- See `server/Pipfile` and `server/requirements.txt` for Python dependencies.
- Theme system supports light/dark mode with custom color variants (Default, Blue, Green, Amber, and Mono).

## Running production build

Build frontend:

```powershell
cd client
npm run build
```

Serve the frontend with `npm start` or deploy to a hosting provider. The backend can be run behind a WSGI server (e.g., Gunicorn) in production.

## Dashboard demo

![dashboard_demo](https://github.com/user-attachments/assets/2026a418-ed4a-4699-8005-ffc8af3fcf46)

## Where to get help

- Open an issue in this repository for bugs and feature requests.
- Join developer discussions by creating issues or pull requests.
- For environment-specific questions (Supabase etc.), consult their official docs.

## Contributing

We welcome contributions. For contribution guidelines and the preferred PR process, see `CONTRIBUTING.md` in the repo root.

## Primary maintainers

- [@keaneph](https://github.com/keaneph) (GitHub repository owner)

## Prior versions

This is the third iteration of the student information system:

- **Version 1**: [Gungnir](https://github.com/keaneph/Gungnir) – WPF + CSV
- **Version 2**: [La Accademia](https://github.com/keaneph/La-Accademia) – WPF + MySQL
- **Version 3**: **Maktab** (Current) – Next.js + Flask + Supabase

## Security & License

If you discover a security vulnerability, please open a private issue or contact the maintainers. This repository contains a `LICENSE` file, contact the maintainers to clarify licensing.

## Acknowledgements

- [@SamHuertas](https://github.com/SamHuertas) - for his terms and conditions
- [@brexer](https://github.com/brexer) - for his sign up form criticism
