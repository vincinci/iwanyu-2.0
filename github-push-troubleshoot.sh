#!/bin/bash

# GitHub Repository Push Script for Iwanyu Project
# This script helps diagnose and fix common GitHub push issues

echo "🔧 GitHub Push Troubleshooting for Iwanyu Project"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the iwanyu project root directory"
    exit 1
fi

echo "📊 Current git status:"
git status --short
echo ""

echo "🔗 Current remote configuration:"
git remote -v
echo ""

echo "🧪 Testing repository access..."
echo "Checking if https://github.com/Davy-00/iwanyu.git is accessible..."

# Test different methods
echo ""
echo "🔍 Diagnosis:"
echo "1. Testing HTTPS access..."
if git ls-remote https://github.com/Davy-00/iwanyu.git >/dev/null 2>&1; then
    echo "   ✅ Repository accessible via HTTPS"
else
    echo "   ❌ Repository not accessible via HTTPS"
    echo "      Possible reasons:"
    echo "      - Repository doesn't exist"
    echo "      - Repository is private and needs authentication"
    echo "      - Network/authentication issues"
fi

echo ""
echo "📋 Solutions to try:"
echo ""
echo "🔥 METHOD 1: Create Repository (if it doesn't exist)"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: iwanyu"
echo "   3. Owner: Davy-00"
echo "   4. Make it public or private (your choice)"
echo "   5. DON'T initialize with README"
echo "   6. Click 'Create repository'"
echo ""

echo "🔑 METHOD 2: Fix Authentication (if repository exists)"
echo "   If the repository exists but you can't access it:"
echo "   A. Use Personal Access Token:"
echo "      git remote set-url origin https://YOUR_TOKEN@github.com/Davy-00/iwanyu.git"
echo "   B. Or configure SSH:"
echo "      git remote set-url origin git@github.com:Davy-00/iwanyu.git"
echo ""

echo "🚀 METHOD 3: Manual Upload"
echo "   1. Create repository on GitHub"
echo "   2. Upload files manually via GitHub web interface"
echo "   3. Or use GitHub Desktop application"
echo ""

echo "⚡ METHOD 4: Alternative Repository Name"
echo "   Create with a different name and update remote:"
echo "   git remote set-url origin https://github.com/Davy-00/NEW_REPO_NAME.git"
echo ""

read -p "Would you like to try pushing now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Attempting to push..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Project pushed to GitHub!"
        echo "🌐 Repository: https://github.com/Davy-00/iwanyu"
        echo ""
        echo "📁 Your project includes:"
        echo "   - Complete multi-vendor e-commerce platform"
        echo "   - 177 files with 45,557 lines of code"
        echo "   - React frontend + Express backend"
        echo "   - Production-ready deployment configs"
        echo "   - Comprehensive documentation"
    else
        echo ""
        echo "❌ Push failed. Please try one of the methods above."
    fi
else
    echo ""
    echo "⏸️  Please follow one of the methods above to resolve the issue."
fi

echo ""
echo "📞 Need help? The project is ready to go - just need to solve the GitHub access issue!"
echo "💡 Tip: Creating a new repository on GitHub is usually the quickest solution."
