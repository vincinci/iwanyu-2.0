#!/bin/bash

# Comprehensive Render Build Script for Iwanyu Backend
# This script ensures all dependencies and build steps work correctly

echo "🚀 Starting Iwanyu Backend Build Process..."
echo "============================================"

# Exit on any error
set -e

# Enable verbose output for debugging
set -x

echo "📍 Build environment info:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "Environment: ${NODE_ENV:-'not set'}"

echo "📦 Installing all dependencies..."
# Install all dependencies including all @types packages now in production deps
npm ci

echo "📋 Verifying critical packages are available..."
echo "Checking TypeScript..."
npx tsc --version

echo "Checking Prisma..."
npx prisma --version

echo "Checking @types packages..."
ls node_modules/@types/ | head -10

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🏗️ Building TypeScript application..."
echo "Using TypeScript configuration:"
cat tsconfig.json | head -20

npx tsc --noEmit --skipLibCheck
echo "TypeScript type checking passed!"

echo "Building for production..."
npx tsc

echo "📁 Setting up runtime directories..."
mkdir -p dist/uploads || true

echo "📋 Verifying build output..."
ls -la dist/
echo "Build contents:"
find dist/ -name "*.js" | head -10

echo "✅ Build completed successfully!"
echo "📊 Final build size:"
du -sh dist/
