#!/bin/bash

# Render Startup Script for Iwanyu Backend
# This script handles the startup process including database migrations

echo "🚀 Starting Iwanyu Backend Server..."
echo "=================================="

# Exit on any error
set -e

echo "📍 Current directory: $(pwd)"
echo "📋 Environment check:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'not set'}"

# Wait a moment for environment variables to be fully loaded
sleep 2

echo "🔍 Checking for DATABASE_URL availability..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ WARNING: DATABASE_URL environment variable is not set"
    echo "📋 This might mean:"
    echo "1. Database service is still starting up"
    echo "2. Database is not linked to this web service"
    echo "3. Environment variables are not properly configured"
    echo ""
    echo "🔄 Waiting 10 seconds for database to become available..."
    sleep 10
    
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ ERROR: DATABASE_URL is still not available after waiting"
        echo "📋 Available environment variables:"
        env | grep -E "(DATABASE|DB|POSTGRES)" || echo "No database-related environment variables found"
        exit 1
    fi
fi

echo "✅ DATABASE_URL is available"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..." # Show first 50 chars

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Checking if database needs seeding..."
# Only seed if this is a fresh database
ADMIN_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"User\" WHERE role = 'ADMIN';" 2>/dev/null | grep -o '[0-9]\+' | tail -1 || echo "0")

if [ "$ADMIN_COUNT" = "0" ]; then
    echo "🌱 Seeding database with initial data..."
    npm run db:seed || echo "⚠️ Seeding failed, continuing anyway..."
else
    echo "✅ Database already has admin users, skipping seed"
fi

echo "🚀 Starting application server..."
exec npm start
