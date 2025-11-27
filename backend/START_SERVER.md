# Starting the Backend Server

## Prerequisites

1. **Database (PostgreSQL)**
   - Either use Docker Compose: `docker-compose up -d`
   - Or have PostgreSQL running locally on port 5432
   - Database name: `secondwind`
   - User: `postgres`, Password: `postgres`

2. **Redis**
   - Either use Docker Compose (included in docker-compose.yml)
   - Or have Redis running locally on port 6379

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update JWT secrets (must be at least 32 characters)
   - Configure other services as needed

## Steps to Start

### 1. Start Database and Redis Services

```bash
# Using Docker Compose
docker-compose up -d

# Or manually start PostgreSQL and Redis
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Verify Server is Running

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy" | "degraded" | "unhealthy",
#   "timestamp": "...",
#   "services": {
#     "database": "healthy" | "unhealthy",
#     "redis": "healthy" | "unhealthy"
#   }
# }
```

## Common Issues

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb secondwind`

### Redis Connection Failed
- Server will run in degraded mode (Redis optional)
- Ensure Redis is running: `redis-server`

### JWT Secret Too Short
- JWT_SECRET and JWT_REFRESH_SECRET must be at least 32 characters
- Update in .env file

### Port Already in Use
- Change PORT in .env
- Or stop the process using port 3000

## Production Start

```bash
# Build
npm run build

# Start
npm start
```

## API Endpoints

Once running, the API is available at:
- Base URL: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/health`

See `ALL_PHASES_0_9_COMPLETE.md` for full API documentation.
