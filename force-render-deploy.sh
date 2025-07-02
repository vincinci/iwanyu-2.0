#!/bin/bash

# Emergency deployment script to force Render redeploy
# This script tries multiple approaches to trigger deployment

echo "🚀 Force Render Deployment Script"
echo "=================================="

# Add timestamp to trigger change
TIMESTAMP=$(date +%s)
echo "Deployment trigger: $TIMESTAMP" > backend/DEPLOY_TIMESTAMP

# Update version in multiple files
echo "Updating version numbers..."
sed -i '' 's/"version": "1.0.1"/"version": "1.0.2"/' backend/package.json

# Commit and push
echo "Committing changes..."
git add .
git commit -m "Force Render deployment - version 1.0.2 - $(date)"
git push origin main

echo "✅ Changes pushed to GitHub"
echo "🔄 Render should detect changes and redeploy"
echo "⏳ Wait 2-3 minutes then test: https://iwanyu-backend.onrender.com/"
