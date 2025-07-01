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
echo "DATABASE_URL: ${DATABASE_URL:+'set (hidden)'}"
echo "PORT: ${PORT:-'not set'}"

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

echo "🗄️ Running database migrations..."
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
