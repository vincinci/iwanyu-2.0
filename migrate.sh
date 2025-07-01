#!/bin/bash

# Migration script for Iwanyu E-commerce
# This script helps migrate from the old mixed structure to the new separated structure

echo "🔄 Iwanyu E-commerce Structure Migration"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📁 Current project structure detected"

# Check if backend and frontend directories exist
if [ -d "backend" ] && [ -d "iwanyu-frontend" ]; then
    echo "✅ New structure already exists!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test the backend: cd backend && npm run dev"
    echo "2. Test the frontend: cd iwanyu-frontend && npm start"
    echo "3. Deploy backend to Render"
    echo "4. Deploy frontend to Vercel"
    echo ""
    echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
    exit 0
fi

echo "🚀 Starting migration to separated structure..."

# Create backend directory if it doesn't exist
if [ ! -d "backend" ]; then
    echo "📦 Creating backend directory..."
    mkdir -p backend
    
    # Copy backend files
    echo "📂 Copying backend files..."
    cp -r src backend/ 2>/dev/null || true
    cp -r prisma backend/ 2>/dev/null || true
    cp -r scripts backend/ 2>/dev/null || true
    cp -r uploads backend/ 2>/dev/null || true
    cp .env backend/ 2>/dev/null || true
    cp .env.example backend/ 2>/dev/null || true
    cp tsconfig.json backend/ 2>/dev/null || true
    
    echo "✅ Backend files copied"
fi

# Create frontend directory if it doesn't exist
if [ ! -d "iwanyu-frontend" ]; then
    echo "🎨 Creating frontend directory..."
    mkdir -p iwanyu-frontend
    
    # Copy frontend files
    echo "📂 Copying frontend files..."
    cp -r frontend/* iwanyu-frontend/ 2>/dev/null || true
    
    echo "✅ Frontend files copied"
fi

# Install dependencies
echo "📦 Installing dependencies..."

if [ -d "backend" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ -d "iwanyu-frontend" ]; then
    echo "Installing frontend dependencies..."
    cd iwanyu-frontend
    npm install
    cd ..
fi

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables:"
echo "   - Backend: cp backend/.env.example backend/.env"
echo "   - Frontend: cp iwanyu-frontend/.env.example iwanyu-frontend/.env"
echo ""
echo "2. Start development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd iwanyu-frontend && npm start"
echo ""
echo "3. Deploy to production:"
echo "   - Backend → Render.com"
echo "   - Frontend → Vercel.com"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed deployment instructions"
