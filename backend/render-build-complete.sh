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
# Install all dependencies including devDependencies needed for build
npm install --include=dev

echo "📋 Verifying TypeScript and Prisma installation..."
npx tsc --version
npx prisma --version

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🏗️ Building TypeScript application..."
npx tsc

echo "📁 Setting up runtime directories..."
mkdir -p dist/uploads || true

echo "📋 Verifying build output..."
ls -la dist/

echo "🧹 Cleaning up development dependencies..."
npm prune --production

echo "✅ Build completed successfully!"
echo "📊 Final build size:"
du -sh dist/
