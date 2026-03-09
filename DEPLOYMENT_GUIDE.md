# OPD EMR System - Vercel Deployment Guide

This guide covers deploying the OPD EMR system client and server as separate Vercel applications.

---

## Prerequisites

Before deploying, you need:

1. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)

2. **Database Options**
   - **Option A:** Use Vercel Postgres (free tier available)
   - **Option B:** Use external PostgreSQL (Supabase, AWS RDS, Heroku Postgres, etc.)
   - **Option C:** Use your existing PostgreSQL database

3. **Environment Variables**
   - Setup your production environment secrets
   - Generate strong JWT secret (32+ characters)

---

## Preparation Checklist

### Server Deployment Preparation

✅ **Created:**
- `server/vercel.json` - Vercel config for Node.js server
- `server/.env.production` - Environment variables template
- `server/package.json` - Express app build config

### Client Deployment Preparation

✅ **Created:**
- `client/vercel.json` - React SPA rewrite rules
- `client/.env.production` - Client env vars template

---

## Deployment Steps

### 1. Deploy Your Database

**If using Vercel Postgres:**
1. Go to Vercel dashboard → Storage → Postgres
2. Create a new Postgres instance
3. Copy the `DATABASE_URL` from connection string
4. Set the `DATABASE_URL` in Vercel environment variables

**If using External Database:**
1. Get your database connection string
2. Test connectivity before deploying

---

### 2. Deploy the Server (API Backend)

**Steps:**
1. Push your server code to GitHub (it's easier for Vercel)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   remote add origin <your-github-repo>
   git push -u origin main
   ```

2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - "Import" → Choose "Deploy GitHub repo"
   - Select your OPD EMR repository
   - Vercel will auto-detect from `server/vercel.json`

3. **Configure Server:**
   - **Build & Runtime Configuration** (auto-detected from vercel.json)
   - **Environment Variables:**
     ```
     DATABASE_URL (from Vercel Postgres or external)
     JWT_SECRET (generate a strong 32+ char secret)
     NODE_ENV=production
     PORT=5000
     FRONTEND_URL=https://your-client-domain.vercel.app
     ```

4. **Click Deploy**

5. **Wait for build** - Vercel will:
   - Install dependencies
   - Configure Prisma
   - Start your Express server

6. **Copy your deployed server URL** from Vercel dashboard
   - Format: `https://opd-emr-server-xyz.vercel.app` or similar
   - Save this URL for later

---

### 3. Deploy the Client (Frontend)

**Steps:**
1. Update your deployed server URL in `client/.env.production`:
   ```bash
   VITE_API_URL=https://opd-emr-server-xyz.vercel.app/api
   ```

2. Push client code to GitHub (if not already done)

3. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - "Import" → "Deploy GitHub repo"
   - Select your OPD EMR repository

4. **Vercel will auto-detect from `client/vercel.json`**

5. **Configure Environment Variables:**
   ```
   VITE_API_URL=https://opd-emr-server-xyz.vercel.app/api
   VITE_SYSTEM_NAME=OPD EMR System
   ```

6. **Environment:**
   - Choose "Production"
   - Framework preset: "Vite" (auto-detected)

7. **Build Configuration:**
   - Build Output: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)
   - Build Command: `npm run build` (auto-detected)

8. **Output Directory:** `dist` (auto-detected)

9. **Click Deploy**

---

## Post-Deployment Configuration

### Update Client Environment Variables

After deployment:

1. Go to Vercel Dashboard → Your Client Project → Settings → Environment Variables
2. Add/Update:
   ```
   VITE_API_URL=https://your-server-domain.vercel.app/api
   ```
3. Deploy again to apply changes

### Test Your Deployed Apps

**Test Server:**
```bash
curl https://your-server.vercel.app/api
# Should return: { system: "OPD EMR System", version: "1.0.0", status: "running" }
```

**Test Client:**
- Open your Vercel-deployed client URL
- Verify:
  - App loads correctly
  - Login works
  - API calls succeed
  - Navigation works (SPA routing)

---

## Database Setup

### Using Vercel Postgres

**Prisma Config for Vercel Postgres:**
```bash
# Generate client with Vercel Postgres
npx prisma generate

# Push schema to Vercel Postgres
npx prisma db push

# Seed database if needed
npx prisma db seed
```

**Note:** Run these commands in your terminal after adding the `DATABASE_URL` environment variable in Vercel.

---

## Common Issues & Solutions

### Issue 1: "Application Error"

**Problem:** Server fails to start on Vercel

**Solutions:**
- Check Vercel logs for errors
- Verify `DATABASE_URL` environment variable is set
- Ensure `prisma generate` ran successfully
- Check Prisma connection settings

### Issue 2: Client CORS Errors

**Problem:** Frontend can't connect to deployed backend

**Solutions:**
1. Update `server/.env.production`:
   ```
   FRONTEND_URL=https://your-client-domain.vercel.app
   ```
2. Restart server deployment
3. Verify CORS middleware configuration

### Issue 3: SPA Routing Not Working

**Problem:** Refreshing `/patients` returns 404

**Solution:**
Already handled in `client/vercel.json` with rewrite rules:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Issue 4: Database Connection Timeout

**Problem:** Server can't connect to database on cold starts

**Solutions:**
- Use Vercel Postgres (recommended)
- For external databases:
  - Ensure Vercel can reach your database
  - Allow Vercel IPs in your database firewall
  - Test connection before deployment

### Issue 5: Environment Variables Not Applied

**Problem:** Changes to env vars don't take effect

**Solutions:**
- Redeploy after changing environment variables
- Check Vercel Build/Logs for errors
- Verify variable names match exactly (case-sensitive)

---

## Files Created for Deployment

### Server:
- ✅ `server/vercel.json` - Vercel deployment config
- ✅ `server/.env.production` - Production environment template
- ✅ Updated `server/package.json` - Node.js version requirement

### Client:
- ✅ `client/vercel.json` - SPA redirect rules
- ✅ `client/.env.production` - Production API URL template
- ✅ Updated `client/.env.example` - Documentation

---

## After Deployment

### Test All Key Features:
1. ✅ User registration and login
2. ⚠️ Patient management (CRUD operations)
3. ⚠️ Consultation creation and editing
4. ⚠️ Nurse documentation
5. ✅ Queue management
6. ⚠️ Search and filter functionality
7. ⚠️ Role-based access control

### Monitor:
- Check Vercel logs regularly
- Monitor database usage in Vercel
- Scale resources if needed (Vercel free tier limits might apply)

---

## Important Notes

1. **Database Scaling:**
   - Vercel Postgres free tier has limits (256MB storage)
   - Consider upgrading if needed

2. **Rate Limiting:**
   - Consider implementing rate limiting on auth endpoints
   - Use Vercel's built-in rate limiting API

3. **Security:**
   - Use https for both client and server
   - Generate strong JWT_SECRET for production
   - Don't commit `.env.production` files to git

4. **Build Times:**
   - First build may take 5-10 minutes
   - Subsequent builds are faster
   - Server builds may be slower due to Node.js + Prisma

5. **SPA Routing:**
   - Vercel.json rewrite rules handle all client-side routes
   - Test navigation: `/patients`, `/consultation`, `/queue`, `/nurse`, `/admin`, `/settings`

6. **Environment Variables Priority:**
   - Vercel Dashboard env vars override local .env files
   - Deploy with production env vars from the start (better for security)

---

## Quick Reference: File Locations

**Deployment configs created:**
- Server Vercel config: `C:\Users\elidev\Desktop\Dev\opd-system\server\vercel.json`
- Client Vercel config: `C:\Users\elidev\Desktop\Dev\opd-system\client\vercel.json`

**Environment templates:**
- Server: `C:\Users\elidev\Desktop\Dev\opd-s`.env.production`
- Client: `C:\Users\elidev\Desktop\opd-examples\client.env.production`

**To change your database after deployment:**
1. Go to Vercel dashboard → Settings → Environment Variables
2. Update `DATABASE_URL`
3. Redeploy your server

**To update API endpoints in production:**
1. Update client env vars in Vercel dashboard
2. Redeploy client

---

## Ready for Deployment! ✅

Your files are now properly configured for Vercel deployment as separate apps with full SPA support!
