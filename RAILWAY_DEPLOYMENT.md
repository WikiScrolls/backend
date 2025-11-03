# Railway Deployment Guide

Railway is perfect for your Express + PostgreSQL backend and works seamlessly with your current setup.

## Quick Start (5 minutes)

### 1. Install Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy via GitHub (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click **Start a New Project**
3. Select **Deploy from GitHub repo**
4. Choose your `WikiScrolls/backend` repository
5. Railway will auto-detect your Dockerfile ✅

### 3. Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway automatically creates `DATABASE_URL` environment variable

### 4. Set Environment Variables

Go to your backend service → **Variables** tab:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-me-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

**Note**: `DATABASE_URL` is automatically set by Railway when you add PostgreSQL!

### 5. Run Database Migration

After first deployment:
1. Go to your service → **Settings** → **Deploy**
2. Add **Start Command**: `sh -c "pnpm prisma:push && pnpm start"`

Or use Railway CLI:
```bash
railway run pnpm prisma:push
```

### 6. Deploy

Railway auto-deploys on git push to `main`. That's it! 🎉

## Environment Variables (Railway)

Railway automatically provides:
- ✅ `DATABASE_URL` - PostgreSQL connection (internal)
- ✅ `PORT` - Assigned automatically
- ✅ `RAILWAY_ENVIRONMENT` - production/staging

You only need to add:
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Custom Domain

1. Go to **Settings** → **Networking**
2. Click **Generate Domain** (free: `*.up.railway.app`)
3. Or add custom domain with automatic SSL

## Cost

- **Free Tier**: $5 credit/month (enough for small projects)
- **Pro**: $5/month + usage (very affordable)
- PostgreSQL included in usage

## Benefits

✅ Works with your existing Dockerfile
✅ Auto-deploys on git push
✅ PostgreSQL database included
✅ Free tier available
✅ No code changes needed
✅ Persistent connections (not serverless)
✅ Background jobs work fine
✅ Easy rollbacks
✅ Built-in logging and metrics

## Troubleshooting

If build fails, check:
- Dockerfile is in root directory ✅
- All files committed to git
- Environment variables set correctly

## CLI Commands

```bash
# Link to project
railway link

# Check logs
railway logs

# Run migrations
railway run pnpm prisma:push

# Open database GUI
railway run pnpm prisma:studio

# SSH into container
railway shell
```

That's it! Railway is the easiest option for your stack.
