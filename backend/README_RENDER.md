# Render Deployment - Quick Reference

## 🚀 Quick Start

### 1. Create Services on Render Dashboard

**PostgreSQL Database:**
- Name: `secondwind-db`
- Database: `secondwind`
- User: `secondwind_user`
- Region: Oregon
- Plan: Starter

**Redis:**
- Name: `secondwind-redis`
- Region: Oregon
- Plan: Starter

**Web Service:**
- Connect your Git repository
- Root Directory: `backend`
- Build: `npm install && npm run build`
- Start: `npm start`
- Plan: Starter

### 2. Environment Variables

Copy all variables from `.render.env.example` to Render Dashboard → Your Service → Environment

**Required:**
- `NODE_ENV=production`
- `PORT=10000`
- `API_VERSION=v1`
- `JWT_SECRET` (use generated: `2622669bd19e510e2c459e6c7df29fe071e2048a3a30272224df9691f6fa9863`)
- `JWT_REFRESH_SECRET` (use generated: `519fc170477eed0ff915b8afe88015c6547c018a9f57a1ea81c1e26624a6abba`)
- `ENCRYPTION_SALT` (use generated: `e2f77a167b00d760c51219c4c4e9662050031c639a92a3f9fd5ff6ce4c293caa`)

**Auto-set when linking:**
- `DATABASE_URL` (from PostgreSQL service)
- `REDIS_URL` (from Redis service)

### 3. Link Services

In Web Service → Environment:
- Click "Link Database" → Select `secondwind-db`
- Click "Link Redis" → Select `secondwind-redis`

### 4. Run Migrations

After first deployment:
1. Go to Web Service → Shell
2. Run: `npm run db:migrate`

### 5. Verify

```bash
curl https://your-service.onrender.com/health
```

## 📋 Complete Setup Guide

See `RENDER_SETUP.md` for detailed step-by-step instructions.

## 🔑 Generated Secrets

All secrets have been generated and are ready to use. See `.render.env.example` for the complete list.

## ✅ Status

- ✅ Configuration files created
- ✅ Secrets generated
- ✅ Render API key configured
- ✅ Setup scripts ready
- ⏳ Services need to be created on Render Dashboard
- ⏳ Environment variables need to be set
- ⏳ First deployment pending

## 📚 Files

- `RENDER_SETUP.md` - Complete setup guide
- `.render.env.example` - Environment variables template
- `render.yaml` - Render Blueprint (optional)
- `Dockerfile` - Docker config (optional)
- `RENDER_DEPLOYMENT_COMPLETE.md` - Full documentation
