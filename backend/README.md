# SecondWind Backend API

Backend API server for the SecondWind Recovery Platform.

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 15.0
- Redis >= 7.0
- Docker & Docker Compose (for local development)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your configuration**

4. **Start local services (Docker Compose):**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── tests/              # Test files
├── migrations/         # Database migrations
└── scripts/            # Utility scripts
```

## API Documentation

API documentation will be available at `/api/docs` once Swagger is integrated.

## Environment Variables

See `.env.example` for all required environment variables.

## Security

- All API keys and secrets must be stored in environment variables
- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS in production
- Configure CORS appropriately

## License

MIT
