#!/bin/bash

# GitHub Repository Setup Script for Iwanyu Project
# Run this after creating the repository on GitHub

echo "🚀 Iwanyu Project - GitHub Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the iwanyu project root directory"
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status

echo ""
echo "🔗 Current remote configuration:"
git remote -v

echo ""
echo "📋 Before running git push, make sure you have:"
echo "   1. ✅ Created the repository on GitHub: https://github.com/new"
echo "   2. ✅ Repository name: iwanyu"
echo "   3. ✅ Owner: Davy-00"
echo "   4. ✅ DON'T initialize with README (we already have files)"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Success! Your project has been pushed to GitHub!"
        echo "🌐 Repository URL: https://github.com/Davy-00/iwanyu"
        echo ""
        echo "📁 Project includes:"
        echo "   - Complete multi-vendor e-commerce platform"
        echo "   - React frontend (iwanyu-frontend/)"
        echo "   - Express backend (backend/)"
        echo "   - Admin security measures implemented"
        echo "   - Production-ready deployment configs"
        echo ""
        echo "🚀 Next Steps:"
        echo "   1. Deploy backend to Render.com"
        echo "   2. Deploy frontend to Vercel.com"
        echo "   3. See DEPLOYMENT_GUIDE.md for detailed instructions"
    else
        echo ""
        echo "❌ Push failed. Common solutions:"
        echo "   1. Check if repository exists: https://github.com/Davy-00/iwanyu"
        echo "   2. Verify you have push permissions"
        echo "   3. Try: git push --set-upstream origin main"
    fi
else
    echo ""
    echo "⏸️  Please create the repository first, then run this script again."
    echo "🌐 Go to: https://github.com/new"
fi
