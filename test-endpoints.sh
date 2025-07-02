#!/bin/bash

echo "🔧 Testing Backend Endpoints"
echo "============================="

BASE_URL="https://iwanyu-2-0.onrender.com"

echo "1. Testing root endpoint (/):"
curl -s "${BASE_URL}/" | head -3
echo -e "\n"

echo "2. Testing health endpoint (/health):"
curl -s "${BASE_URL}/health" | head -3
echo -e "\n"

echo "3. Testing API health endpoint (/api/health):"
curl -s "${BASE_URL}/api/health" | head -3
echo -e "\n"

echo "4. Testing categories endpoint (/api/categories):"
curl -s "${BASE_URL}/api/categories" | head -3
echo -e "\n"

echo "5. Testing admin test endpoint (/api/admin/test):"
curl -s "${BASE_URL}/api/admin/test" | head -3
echo -e "\n"

echo "6. Testing admin dashboard stats (/api/admin/dashboard/stats):"
curl -s "${BASE_URL}/api/admin/dashboard/stats" | head -3
echo -e "\n"

echo "Done!"
