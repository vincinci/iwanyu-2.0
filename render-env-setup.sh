#!/bin/bash

# Render Environment Variables Quick Setup Script

echo "=== Render Deployment Environment Variables ==="
echo ""

echo "1. Generating JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

echo "2. Environment Variables for Render:"
echo "Copy these to your Render web service environment variables:"
echo ""
echo "NODE_ENV=production"
echo "PORT=10000"
echo "DATABASE_URL=[Get from your iwanyu-db database connection string]"
echo "JWT_SECRET=$JWT_SECRET"
echo "FRONTEND_URL=https://iwanyu-2-0.vercel.app"
echo "CORS_ORIGIN=https://iwanyu-2-0.vercel.app"
echo "FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X"
echo "FLUTTERWAVE_SECRET_KEY=FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X"
echo "FLUTTERWAVE_ENCRYPTION_KEY=cc842f4c47bf3f882628801e"
echo ""

echo "3. To get DATABASE_URL:"
echo "   - Go to Render Dashboard"
echo "   - Click on your 'iwanyu-db' database"
echo "   - Copy the 'External Connection String'"
echo "   - Paste it as DATABASE_URL value"
echo ""

echo "4. After adding all environment variables:"
echo "   - Click 'Save Changes' in Render"
echo "   - Trigger a manual deploy or push to GitHub"
echo ""

echo "✅ Your backend should deploy successfully after setting these variables!"
