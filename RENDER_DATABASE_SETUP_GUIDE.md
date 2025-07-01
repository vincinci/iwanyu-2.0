# Render Deployment Steps - DATABASE_URL Fix

## Issue
The backend is failing with: `DATABASE_URL environment variable is required for production`

This happens because the PostgreSQL database service needs to be created BEFORE the web service that references it.

## ✅ Correct Deployment Order

### Step 1: Create the Database Service First
1. Go to Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `iwanyu-db`
   - **Database Name**: `iwanyu`
   - **User**: `iwanyu`
   - **Plan**: Free
4. Click "Create Database"
5. **Wait for database to be fully created** (this takes a few minutes)

### Step 2: Create the Web Service
1. Click "New +" → "Web Service"
2. Connect to your GitHub repository
3. Configure:
   - **Name**: `iwanyu-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npx prisma generate && npx prisma migrate deploy && npm start`

### Step 3: Link Database to Web Service
In the web service environment variables, add:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<link to iwanyu-db>
JWT_SECRET=<auto-generate>
FRONTEND_URL=https://iwanyu-2-0.vercel.app
CORS_ORIGIN=https://iwanyu-2-0.vercel.app
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X
FLUTTERWAVE_ENCRYPTION_KEY=cc842f4c47bf3f882628801e
```

**Important**: For DATABASE_URL, click "Add from database" and select your `iwanyu-db` database.

## Alternative: Manual Environment Variable

If the automatic linking doesn't work, you can set DATABASE_URL manually:

1. Go to your PostgreSQL database dashboard
2. Copy the "Internal Database URL" 
3. Paste it as the DATABASE_URL environment variable in your web service

## Troubleshooting

If you still get the DATABASE_URL error:

1. **Check Database Status**: Ensure the PostgreSQL database shows "Available"
2. **Check Environment Variables**: Verify DATABASE_URL is properly set in the web service
3. **Restart Web Service**: Sometimes a restart is needed after linking the database
4. **Check Logs**: Look for any database connection errors in the startup logs

The deployment should work once the database is properly linked to the web service!
