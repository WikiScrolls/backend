# Easypanel Deployment Guide

## Prerequisites
1. Easypanel account with access to your server
2. PostgreSQL database (create this first in Easypanel)
3. GitHub repository connected to Easypanel

## Deployment Steps

### 1. Create PostgreSQL Database
1. Go to Easypanel dashboard
2. Create a new **PostgreSQL** service
3. Note down the connection details (host, port, username, password, database name)

### 2. Create the Application
1. Click **Create App** → **From Source Code**
2. Connect your GitHub repository: `WikiScrolls/backend`
3. Select branch: `main`

### 3. Configure Build Settings
- **Build Path**: `/` (root directory)
- **Dockerfile Path**: `Dockerfile` (default)
- **Build Command**: Auto-detected from Dockerfile
- **Start Command**: `pnpm start` (defined in Dockerfile CMD)

### 4. Set Environment Variables
Add these environment variables in Easypanel:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@postgres-host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

**Important Notes:**
- Replace `DATABASE_URL` with your actual PostgreSQL connection string from step 1
- Generate a secure `JWT_SECRET` (at least 32 characters)
- Update `CORS_ORIGIN` with your frontend domain (or use `*` for development)

### 5. Database Migration
After deployment, you need to run Prisma migrations:

**Option A: Using Easypanel Terminal**
1. Go to your app in Easypanel
2. Open the **Terminal** tab
3. Run: `pnpm prisma:push`

**Option B: Update Dockerfile CMD (Recommended)**
The Dockerfile can be modified to run migrations on startup:
```dockerfile
CMD ["sh", "-c", "pnpm prisma:push && pnpm start"]
```

### 6. Domain & SSL
1. In Easypanel, go to your app's **Domains** tab
2. Add your custom domain (e.g., `api.wikiscrolls.com`)
3. Enable SSL (automatic with Let's Encrypt)

### 7. Health Check
Easypanel will automatically use the `HEALTHCHECK` defined in the Dockerfile:
- Endpoint: `http://localhost:3000/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | - | Set to `production` |
| `PORT` | Yes | `3000` | Application port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiration time |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated) |

## Post-Deployment Verification

### 1. Check Health
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "status": "ok",
    "timestamp": "2025-11-03T..."
  }
}
```

### 2. Test Signup
```bash
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Monitor Logs
Check logs in Easypanel's **Logs** tab to ensure:
- ✅ Application started successfully
- ✅ Database connected
- ✅ Prisma Client generated
- ✅ No migration errors

## Troubleshooting

### Build Fails
- **Error**: `pnpm: not found`
  - **Fix**: Ensure Dockerfile installs pnpm globally in base stage
  
- **Error**: `Prisma schema not found`
  - **Fix**: Check that `prisma/schema.prisma` is in the repository

### Database Connection Issues
- **Error**: `Can't reach database server`
  - **Fix**: Verify `DATABASE_URL` is correct
  - **Fix**: Ensure PostgreSQL service is running
  - **Fix**: Check network connectivity between services

### Migration Errors
- **Error**: `Migration failed to apply`
  - **Fix**: Run `pnpm prisma:push` manually in terminal
  - **Fix**: Or add migration command to startup script

### Application Won't Start
- Check environment variables are set correctly
- Review logs in Easypanel
- Ensure port 3000 is not already in use
- Verify DATABASE_URL format

## Scaling & Performance

### Resource Recommendations
- **Memory**: 512MB minimum, 1GB recommended
- **CPU**: 0.5 vCPU minimum, 1 vCPU recommended
- **Storage**: 1GB (logs grow over time)

### Horizontal Scaling
To run multiple instances:
1. Increase **Replicas** in Easypanel
2. Easypanel will automatically load balance
3. Ensure DATABASE_URL points to shared PostgreSQL instance

### Database Connection Pool
Current settings in `src/config/database.ts`:
- Connection limit: 5 per instance
- Adjust based on total replicas and PostgreSQL max connections

## Security Checklist
- [ ] Strong `JWT_SECRET` (32+ characters, random)
- [ ] `NODE_ENV=production` set
- [ ] `CORS_ORIGIN` set to specific domain(s)
- [ ] PostgreSQL password is strong
- [ ] SSL/HTTPS enabled on domain
- [ ] Rate limiting configured (already in code)
- [ ] Helmet security headers enabled (already in code)

## Backup Strategy
1. **Database**: Enable automated backups in Easypanel PostgreSQL settings
2. **Frequency**: Daily recommended
3. **Retention**: 7-30 days based on requirements

## Monitoring
- Use Easypanel's built-in monitoring
- Health check: `GET /api/health`
- Check logs for errors
- Monitor response times and error rates

## CI/CD
Easypanel automatically deploys on git push to `main` branch:
1. Push code to GitHub
2. Easypanel detects change
3. Builds Docker image
4. Runs migrations (if configured)
5. Deploys new version
6. Zero-downtime deployment

## Support
- Easypanel Docs: https://easypanel.io/docs
- Prisma Docs: https://www.prisma.io/docs
- GitHub Issues: https://github.com/WikiScrolls/backend/issues
