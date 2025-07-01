# 🚨 URGENT: Render Environment Variables Setup

## Current Issue
Your Render deployment is failing because these environment variables are missing:
- DATABASE_URL
- JWT_SECRET

## ✅ Quick Fix: Manual Environment Variables

Go to your Render web service dashboard and add these environment variables:

### Required Environment Variables for Render:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_rby0wxG8OuoI@ep-morning-violet-a8o56p2z-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=iwanyu-ecommerce-jwt-secret-key-change-in-production-2025
FRONTEND_URL=https://iwanyu-2-0.vercel.app
CORS_ORIGIN=https://iwanyu-2-0.vercel.app
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X
FLUTTERWAVE_ENCRYPTION_KEY=cc842f4c47bf3f882628801e
```

## 📋 Steps to Add Environment Variables

1. **Go to Render Dashboard**
2. **Find your iwanyu-backend service**
3. **Click on the service name**
4. **Go to "Environment" tab**
5. **Add each environment variable above**
6. **Click "Save Changes"**
7. **Redeploy the service**

## 🔄 Alternative: Use Render PostgreSQL

If you prefer to use Render's PostgreSQL instead of Neon:

1. **Create PostgreSQL Database on Render**
   - Name: `iwanyu-db`
   - Database: `iwanyu`
   - User: `iwanyu`

2. **Link Database to Web Service**
   - In web service environment variables
   - Add DATABASE_URL and select "Add from database"
   - Choose your iwanyu-db database

## ⚡ After Adding Environment Variables

Your next deployment should show:
```
✅ DATABASE_URL is available
✅ Database connection successful
✅ Server running on port 10000
```

## 🚨 Security Note

The JWT_SECRET and database credentials shown here are from your development environment. For production, consider:
- Generating a stronger JWT_SECRET
- Using Render's auto-generate feature for secrets
- Using Render's PostgreSQL for better integration

This should resolve the deployment issue immediately!
