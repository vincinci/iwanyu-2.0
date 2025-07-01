#!/bin/bash

# Iwanyu E-commerce Deployment Helper Script

echo "🚀 Iwanyu E-commerce Deployment Helper"
echo "======================================"
echo ""

echo "📋 Pre-deployment checklist:"
echo "1. ✅ GitHub repository pushed to: https://github.com/vincinci/iwanyu-2.0"
echo "2. 🏗️  Ready to deploy backend to Render"
echo "3. 🌐 Ready to deploy frontend to Vercel"
echo ""

echo "🔧 Quick Start URLs:"
echo "- Render Dashboard: https://dashboard.render.com"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo ""

echo "📖 Deployment Guide:"
echo "1. Deploy Backend (Render):"
echo "   • Go to render.com → New → PostgreSQL (create database first)"
echo "   • Then: New → Web Service → Connect GitHub repo"
echo "   • Root directory: 'backend'"
echo "   • Build: 'npm install && npm run db:generate && npm run build'"
echo "   • Start: 'npm run db:migrate && npm start'"
echo ""

echo "2. Deploy Frontend (Vercel):"
echo "   • Go to vercel.com → New Project → Import GitHub repo"
echo "   • Root directory: 'iwanyu-frontend'"
echo "   • Framework: Create React App"
echo ""

echo "🔑 Don't forget to set environment variables!"
echo "See DEPLOYMENT_CHECKLIST.md for complete details."
echo ""

echo "🎯 After deployment, test these URLs:"
echo "Backend health: https://your-backend.onrender.com/api/health"
echo "Frontend: https://your-frontend.vercel.app"
echo ""

echo "✅ Your Iwanyu platform is ready for deployment!"
