#!/bin/bash

# Render Deployment Script for Iwanyu Backend
# This script handles the complete build process for Render deployment

echo "🚀 Starting Iwanyu Backend Deployment on Render..."
echo "================================================"

# Exit on any error
set -e

# Show commands being executed
set -x

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔧 Installing dev dependencies for build..."
npm install --only=dev

echo "🗄️ Setting up Prisma..."
npx prisma generate

echo "🛠️ Running database migrations..."
npx prisma migrate deploy

echo "🏗️ Building TypeScript..."
npm run build

echo "📁 Setting up uploads directory..."
mkdir -p dist/uploads

echo "🧹 Cleaning up dev dependencies..."
npm prune --production

echo "✅ Deployment build completed successfully!"
echo "🚀 Starting server with: npm start"
