# Render Deployment Setup Guide

## Generated Secrets

Run `node scripts/generate-secrets.js` to generate new secrets, or use these (already generated):

```
JWT_SECRET=2622669bd19e510e2c459e6c7df29fe071e2048a3a30272224df9691f6fa9863
JWT_REFRESH_SECRET=519fc170477eed0ff915b8afe88015c6547c018a9f57a1ea81c1e26624a6abba
ENCRYPTION_SALT=e2f77a167b00d760c51219c4c4e9662050031c639a92a3f9fd5ff6ce4c293caa
```

## Step-by-Step Setup

### 1. Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name:** `secondwind-db`
   - **Database:** `secondwind`
   - **User:** `secondwind_user`
   - **Region:** `Oregon (US West)`
   - **Plan:** `Starter` (Free)
   - **PostgreSQL Version:** `15`
4. Click "Create Database"
5. **Save the Internal Database URL** (you'll need this)

### 2. Create Redis Instance

1. Go to https://dashboard.render.com
2. Click "New +" → "Redis"
3. Configure:
   - **Name:** `secondwind-redis`
   - **Region:** `Oregon (US West)`
   - **Plan:** `Starter` (Free)
   - **Max Memory Policy:** `allkeys-lru`
4. Click "Create Redis"
5. **Save the Internal Redis URL** (you'll need this)

### 3. Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Name:** `secondwind-backend`
   - **Region:** `Oregon (US West)`
   - **Branch:** `main` (or your main branch)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Starter` (Free)

### 4. Environment Variables

In the Web Service settings, add these environment variables:

#### Required Variables
```
NODE_ENV=production
PORT=10000
API_VERSION=v1
```

#### Database (from Step 1)
```
DATABASE_URL=<Internal Database URL from PostgreSQL service>
```

#### Redis (from Step 2)
```
REDIS_URL=<Internal Redis URL from Redis service>
```

#### JWT Secrets
```
JWT_SECRET=2622669bd19e510e2c459e6c7df29fe071e2048a3a30272224df9691f6fa9863
JWT_REFRESH_SECRET=519fc170477eed0ff915b8afe88015c6547c018a9f57a1ea81c1e26624a6abba
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Encryption
```
ENCRYPTION_SALT=e2f77a167b00d760c51219c4c4e9662050031c639a92a3f9fd5ff6ce4c293caa
```

#### CORS & Security
```
CORS_ORIGIN=https://secondwind.org
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Optional Services (add when configured)
```
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Gemini AI
GEMINI_API_KEY=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://secondwind-backend.onrender.com/api/v1/auth/google/callback

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=...
FROM_EMAIL=noreply@secondwind.org

# Storage (AWS S3)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=secondwind-uploads

# Monitoring
SENTRY_DSN=...
LOG_LEVEL=info
```

### 5. Link Database to Web Service

1. In your Web Service settings
2. Go to "Environment" tab
3. Click "Link Database" or "Link Resource"
4. Select `secondwind-db`
5. The `DATABASE_URL` will be automatically set

### 6. Link Redis to Web Service

1. In your Web Service settings
2. Go to "Environment" tab
3. Click "Link Redis" or "Link Resource"
4. Select `secondwind-redis`
5. The `REDIS_URL` will be automatically set

### 7. Run Database Migrations

After the first deployment:

1. Go to your Web Service
2. Click "Shell" tab
3. Run: `npm run db:migrate`

Or add a one-time build step:
- Add to build command: `npm install && npm run build && npm run db:migrate`

### 8. Deploy

1. Push your code to the connected repository
2. Render will automatically deploy
3. Check the "Logs" tab for deployment status
4. Once deployed, your API will be available at: `https://secondwind-backend.onrender.com`

## Health Check

After deployment, verify:
```bash
curl https://secondwind-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  },
  "version": "v1",
  "uptime": ...
}
```

## API Endpoints

Your API will be available at:
- Base: `https://secondwind-backend.onrender.com/api/v1`
- Health: `https://secondwind-backend.onrender.com/health`

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check database is running (not suspended)
- Ensure database is in same region as web service

### Redis Connection Issues
- Verify `REDIS_URL` is set correctly
- Server will run in degraded mode without Redis (sessions won't persist)

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Environment Variables
- All required variables must be set
- JWT secrets must be 32+ characters
- Check for typos in variable names

## Next Steps

1. ✅ Database created
2. ✅ Redis created
3. ✅ Web service created
4. ✅ Environment variables set
5. ✅ Services linked
6. ⏳ Run migrations
7. ⏳ Test API endpoints
8. ⏳ Configure custom domain (optional)
9. ⏳ Set up monitoring (optional)
