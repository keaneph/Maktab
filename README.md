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

A web application for managing student information. Features a Next.js + React frontend (statically exported) served by a Flask backend, with Supabase for authentication and PostgreSQL storage.

## Key features

- Next.js 15 + React 19 frontend (TypeScript) with static export
- Flask backend (Python 3.13) serving both the frontend and API endpoints
- Supabase for authentication and PostgreSQL database
- Tailwind CSS for styling with shadcn/ui components
- Theme system with light/dark mode and 5 color variants (Default, Blue, Green, Amber, Mono)

## Who should read this

This README is focused on developers who want to run the project locally, contribute, or extend it. For API reference and user documentation, see the `client/` and `server/` source folders and any internal docs.

---

## Quick start — run locally (PowerShell)

Prerequisites

- Node.js 20+ (for building the `client`)
- Python 3.13 (for the `server`)
- pipenv (recommended)

### Development Mode (two servers)

For development with hot-reload, run the frontend and backend separately:

**Terminal 1 — Frontend** (http://localhost:3000):

```powershell
cd client
npm install
npm run dev
```

**Terminal 2 — Backend** (http://localhost:5000):

```powershell
cd server
pipenv install      # first time only
pipenv shell
flask run
```

### Production Mode (single server)

Build the frontend and serve everything from Flask:

```powershell
# Build the frontend static files
cd client
npm install
npm run build       # outputs to client/out/

# Run the Flask server (serves both frontend and API)
cd ../server
pipenv shell
flask run           # access at http://localhost:5000
```

**Environment variables**

Create a `.env.local` file in the `client/` directory:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=                    # empty for production (same origin), or http://localhost:5000 for dev
```

Create a `.env` file in the `server/` directory:

```text
PIPENV_VENV_IN_PROJECT=1
DATABASE_URL=your-database-connection-string
```

## Project layout (top-level)

```
README.md            # <- you are here
client/              # Next.js frontend (static export to out/)
server/              # Flask backend (serves API + static frontend)
```

## Development notes

- Frontend tech highlights: Next.js 15 (static export), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Radix UI.
- Backend tech highlights: Flask, Flask-CORS, psycopg2, PyJWT, python-dotenv.
- The Next.js app is configured with `output: "export"` to generate static HTML/JS/CSS in `client/out/`.
- Flask serves these static files and handles SPA routing (all non-API routes fall back to `index.html`).
- See `client/package.json` for available npm scripts (dev, build, lint).
- See `server/Pipfile` for Python dependencies.

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
