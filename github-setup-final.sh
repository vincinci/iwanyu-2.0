#!/bin/bash

# GitHub Repository Setup for Iwanyu Project
# This script helps you create and push to the correct repository

echo "🔧 GitHub Repository Setup - Iwanyu Project"
echo "==========================================="
echo ""

echo "🔍 Current Git Configuration:"
echo "   Username: $(git config --global user.name)"
echo "   Email: $(git config --global user.email)"
echo ""

echo "📋 Repository Setup Instructions:"
echo ""
echo "STEP 1: Create Repository on GitHub"
echo "   🌐 Go to: https://github.com/new"
echo "   📝 Repository name: iwanyu-2.0 (or iwanyu)"
echo "   👤 Owner: vincinci (your GitHub account)"
echo "   📖 Description: Multi-Vendor E-commerce Platform for Rwanda"
echo "   🔓 Choose: Public (recommended) or Private"
echo "   ❌ DON'T check: Add a README file"
echo "   ✅ Click: Create repository"
echo ""

echo "STEP 2: After creating the repository, choose your preferred URL:"
echo ""
echo "   Option A: Use your account (vincinci):"
echo "   git remote set-url origin https://github.com/vincinci/iwanyu-2.0.git"
echo ""
echo "   Option B: If you want to use Davy-00 account:"
echo "   git remote set-url origin https://github.com/Davy-00/iwanyu-2.0.git"
echo "   (You'll need proper authentication for Davy-00 account)"
echo ""

echo "STEP 3: Push to GitHub:"
echo "   git push -u origin main"
echo ""

echo "📊 What will be uploaded:"
echo "   - Complete multi-vendor e-commerce platform"
echo "   - 177 files with 45,557 lines of code"
echo "   - React frontend + Express backend"
echo "   - Production-ready with all features"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Which account did you create it under? (v=vincinci, d=Davy-00): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Vv]$ ]]; then
        echo "🔧 Setting remote to vincinci account..."
        git remote set-url origin https://github.com/vincinci/iwanyu-2.0.git
    elif [[ $REPLY =~ ^[Dd]$ ]]; then
        echo "🔧 Setting remote to Davy-00 account..."
        git remote set-url origin https://github.com/Davy-00/iwanyu-2.0.git
        echo "⚠️  Note: You may need authentication for Davy-00 account"
    fi
    
    echo ""
    echo "🚀 Attempting to push..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Project pushed to GitHub!"
        echo "🌐 Your repository is now live!"
        echo ""
        echo "📁 Project includes:"
        echo "   ✅ Complete e-commerce platform"
        echo "   ✅ Admin, vendor, and customer features"
        echo "   ✅ Secure authentication system"
        echo "   ✅ Payment integration ready"
        echo "   ✅ Production deployment configs"
    else
        echo ""
        echo "❌ Push failed. Common solutions:"
        echo "   1. Verify repository exists on GitHub"
        echo "   2. Check repository name matches exactly"
        echo "   3. Ensure you have push permissions"
        echo "   4. Try authentication with personal access token"
    fi
else
    echo ""
    echo "⏸️  Please create the repository first, then run this script again."
    echo "🌐 Go to: https://github.com/new"
fi
