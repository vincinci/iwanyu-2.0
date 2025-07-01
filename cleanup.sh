#!/bin/bash

# Cleanup script for Iwanyu E-commerce
# Removes old mixed structure files after reorganization

echo "🧹 Iwanyu E-commerce Cleanup"
echo "============================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "iwanyu-frontend" ]; then
    echo "❌ Error: This doesn't appear to be the reorganized project directory"
    echo "   Make sure you have /backend and /iwanyu-frontend directories"
    exit 1
fi

echo "📋 This will remove old structure files and keep:"
echo "   ✅ /backend (API server)"
echo "   ✅ /iwanyu-frontend (React app)"
echo "   ✅ Documentation files"
echo "   ✅ Git configuration"
echo ""

# Ask for confirmation
read -p "🤔 Are you sure you want to clean up the old files? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo "🧹 Starting cleanup..."

# Remove old structure directories
echo "📁 Removing old directories..."
rm -rf node_modules/ 2>/dev/null && echo "   ✅ Removed node_modules/"
rm -rf dist/ 2>/dev/null && echo "   ✅ Removed dist/"
rm -rf frontend/ 2>/dev/null && echo "   ✅ Removed frontend/"
rm -rf src/ 2>/dev/null && echo "   ✅ Removed src/"
rm -rf prisma/ 2>/dev/null && echo "   ✅ Removed prisma/"
rm -rf scripts/ 2>/dev/null && echo "   ✅ Removed scripts/"
rm -rf uploads/ 2>/dev/null && echo "   ✅ Removed uploads/"
rm -rf reports/ 2>/dev/null && echo "   ✅ Removed reports/"

# Remove old configuration files
echo "⚙️  Removing old configuration files..."
rm -f package.json 2>/dev/null && echo "   ✅ Removed package.json"
rm -f package-lock.json 2>/dev/null && echo "   ✅ Removed package-lock.json"
rm -f tsconfig.json 2>/dev/null && echo "   ✅ Removed tsconfig.json"
rm -f tailwind.config.js 2>/dev/null && echo "   ✅ Removed tailwind.config.js"
rm -f postcss.config.js 2>/dev/null && echo "   ✅ Removed postcss.config.js"
rm -f .env 2>/dev/null && echo "   ✅ Removed .env"
rm -f .env.example 2>/dev/null && echo "   ✅ Removed .env.example"
rm -f .env.backup 2>/dev/null && echo "   ✅ Removed .env.backup"
rm -f .gitignore 2>/dev/null && echo "   ✅ Removed .gitignore"
rm -f start-servers.sh 2>/dev/null && echo "   ✅ Removed start-servers.sh"

# Remove old documentation (keep important ones)
echo "📚 Cleaning up documentation..."
rm -f README-DEVELOPMENT.md 2>/dev/null && echo "   ✅ Removed README-DEVELOPMENT.md"
rm -f PROJECT_STRUCTURE.md 2>/dev/null && echo "   ✅ Removed PROJECT_STRUCTURE.md"

# Archive old status files
echo "📦 Archiving old status files..."
mkdir -p archive/
mv ADMIN_*.md archive/ 2>/dev/null && echo "   ✅ Archived admin files"
mv AUTHENTICATION_*.md archive/ 2>/dev/null && echo "   ✅ Archived auth files"
mv DATA_*.md archive/ 2>/dev/null && echo "   ✅ Archived data files"
mv ERROR_*.md archive/ 2>/dev/null && echo "   ✅ Archived error files"
mv ISSUES_*.md archive/ 2>/dev/null && echo "   ✅ Archived issues files"
mv LOGO_*.md archive/ 2>/dev/null && echo "   ✅ Archived logo files"
mv MODERN_*.md archive/ 2>/dev/null && echo "   ✅ Archived UI files"
mv PRODUCTION_*.md archive/ 2>/dev/null && echo "   ✅ Archived production files"
mv ECOMMERCE_*.md archive/ 2>/dev/null && echo "   ✅ Archived implementation files"
mv DATABASE_*.md archive/ 2>/dev/null && echo "   ✅ Archived database files"

# Remove system files
rm -f .DS_Store 2>/dev/null && echo "   ✅ Removed .DS_Store"

echo ""
echo "🎉 Cleanup completed successfully!"
echo ""
echo "📁 Current structure:"
echo "iwanyu-2.0/"
echo "├── backend/              # Express.js API server"
echo "├── iwanyu-frontend/      # React.js web app"
echo "├── archive/              # Old documentation files"
echo "├── DEPLOYMENT_GUIDE.md"
echo "├── REORGANIZATION_SUMMARY.md"
echo "├── README.md"
echo "├── migrate.sh"
echo "└── cleanup.sh"
echo ""
echo "📋 Next steps:"
echo "1. cd backend && npm run dev"
echo "2. cd iwanyu-frontend && npm start"
echo "3. Deploy to Render and Vercel"
echo ""
echo "🗑️  You can safely delete the /archive directory if you don't need the old files"
