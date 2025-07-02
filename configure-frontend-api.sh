#!/bin/bash

# Frontend API URL Configuration Script

echo "=== Frontend API URL Configuration ==="
echo ""

# Get the backend URL
echo "What's your deployed backend URL?"
echo "1. https://iwanyu-backend.onrender.com (if deployed)"
echo "2. http://localhost:5001 (for local development)"
echo "3. Custom URL"
echo ""

read -p "Enter choice (1-3) or full URL: " choice

case $choice in
    1|"1")
        API_URL="https://iwanyu-backend.onrender.com/api"
        ;;
    2|"2")
        API_URL="http://localhost:5001/api"
        ;;
    3|"3")
        read -p "Enter your custom backend URL (with /api): " API_URL
        ;;
    *)
        # Assume it's a full URL
        if [[ $choice == http* ]]; then
            API_URL=$choice
        else
            echo "Invalid choice. Using default localhost."
            API_URL="http://localhost:5001/api"
        fi
        ;;
esac

echo ""
echo "📝 Updating .env file with: $API_URL"

# Update the .env file
cat > iwanyu-frontend/.env << EOF
REACT_APP_API_URL=$API_URL
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X
REACT_APP_APP_NAME=Iwanyu Store
EOF

echo "✅ Frontend environment configured!"
echo ""
echo "🚀 Now you can:"
echo "1. For local development: cd iwanyu-frontend && npm start"
echo "2. For Vercel deployment: Add these environment variables in Vercel dashboard:"
echo "   REACT_APP_API_URL=$API_URL"
echo "   REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X"
echo ""
echo "🔗 Make sure your backend is running at: $API_URL"
