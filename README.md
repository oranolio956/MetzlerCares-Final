<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15RVMjoduKyt3-EPkFtsu8UrUB6TNa0UN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_BACKEND_URL`, `VITE_BACKEND_EMAIL`, and `VITE_BACKEND_PASSWORD` in [.env.local](.env.local) to point the UI at
   your backend and authenticate requests. (Optional) Set `VITE_GEMINI_API_KEY` only if you want to enable the experimental
   voice mode that still talks directly to Gemini.
3. Run the app:
   `npm run dev`

## Backend API (server-side Gemini proxy)

The backend keeps API keys off the client and adds validation, rate limiting, and OpenAPI docs.

```
cd backend
npm install
cp .env.example .env
npm run dev
```

See [backend/README.md](backend/README.md) for endpoints and deployment notes.
