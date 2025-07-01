#!/bin/bash

# Render Deployment Script for Iwanyu Backend
# This script handles the complete deployment process for Render

echo "🚀 Starting Iwanyu Backend Deployment on Render..."
echo "================================================"

# Exit on any error
set -e

# Show commands being executed
set -x

echo "📍 Current directory: $(pwd)"
echo "📋 Environment variables check:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "DATABASE_URL: ${DATABASE_URL:+'set (hidden)'}"
echo "PORT: ${PORT:-'not set'}"

echo "📦 Installing all dependencies (including dev dependencies for build)..."
npm ci

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🏗️ Building TypeScript application..."
npm run build

echo "📁 Setting up uploads directory..."
mkdir -p dist/uploads || true

echo "🧹 Cleaning up dev dependencies after build..."
npm prune --production

echo "✅ Build completed successfully!"
echo "🎯 Ready for deployment with 'npm start'"
