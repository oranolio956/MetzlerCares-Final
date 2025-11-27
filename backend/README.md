# SecondWind Backend

A small Express server that keeps Gemini calls on the server, adds rate limiting, and exposes documented endpoints for chat and intake experiences.

## Getting started

1. Install dependencies

   ```bash
   cd backend
   npm install
   ```

2. Configure environment

   Copy `.env.example` to `.env` and fill in values. Set `GEMINI_API_KEY`, `AUTH_EMAIL`, `AUTH_PASSWORD` (or
   `AUTH_PASSWORD_HASH`), and `JWT_SECRET` to enable authenticated access.

3. Run locally

   ```bash
   npm run dev
   ```

4. Build & run

   ```bash
   npm run build
   npm start
   ```

## Endpoints

- `GET /api/health` – liveness check.
- `POST /api/auth/login` – exchange a verified email/password for a JWT used to access chat routes.
- `POST /api/chat` – validated, authenticated chat payload sent to Gemini.
- `POST /api/images` – authenticated image generation using Gemini vision models.
- `GET /api/openapi.json` – minimal OpenAPI schema for clients and monitoring.

## Deployment notes

Render setup scripts now consume values from environment variables instead of hardcoded secrets. See `.env.render.example` for the required configuration before running any automation.
