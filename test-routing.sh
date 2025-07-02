#!/bin/bash

# Backend API Testing Script
# Tests all major endpoints to verify routing is working

BASE_URL="https://iwanyu-backend.onrender.com"
if [ "$1" = "local" ]; then
    BASE_URL="http://localhost:5000"
fi

echo "🧪 Testing Backend API Routes at $BASE_URL"
echo "================================================="

# Test 1: Root endpoint
echo "1. Testing root endpoint (/) ..."
response=$(curl -s "$BASE_URL/")
if echo "$response" | grep -q "Iwanyu E-commerce API"; then
    echo "✅ Root endpoint working"
else
    echo "❌ Root endpoint failed: $response"
fi

# Test 2: Health check
echo -e "\n2. Testing health endpoint (/api/health) ..."
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q "ok\|degraded"; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed: $response"
fi

# Test 3: Categories
echo -e "\n3. Testing categories endpoint (/api/categories) ..."
response=$(curl -s "$BASE_URL/api/categories")
if echo "$response" | grep -q "categories"; then
    echo "✅ Categories endpoint working"
else
    echo "❌ Categories endpoint failed: $response"
fi

# Test 4: Products
echo -e "\n4. Testing products endpoint (/api/products) ..."
response=$(curl -s "$BASE_URL/api/products")
if echo "$response" | grep -q "products\|success"; then
    echo "✅ Products endpoint working"
else
    echo "❌ Products endpoint failed: $response"
fi

# Test 5: Admin test route
echo -e "\n5. Testing admin test endpoint (/api/admin/test) ..."
response=$(curl -s "$BASE_URL/api/admin/test")
if echo "$response" | grep -q "Admin routes are working"; then
    echo "✅ Admin test endpoint working"
else
    echo "❌ Admin test endpoint failed: $response"
fi

# Test 6: Non-existent API route
echo -e "\n6. Testing non-existent API route (/api/nonexistent) ..."
response=$(curl -s "$BASE_URL/api/nonexistent")
if echo "$response" | grep -q "API Route Not Found"; then
    echo "✅ API 404 handler working"
else
    echo "❌ API 404 handler failed: $response"
fi

# Test 7: Frontend route redirect
echo -e "\n7. Testing frontend route redirect (/login) ..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/login")
if echo "$response" | grep -q "302"; then
    echo "✅ Frontend redirect working"
else
    echo "❌ Frontend redirect failed: $response"
fi

echo -e "\n================================================="
echo "🏁 Backend API routing test completed!"
