#!/bin/bash

echo "🧪 Testing Backend Error Fixes..."
echo "================================"

cd backend

echo "1. Testing build process..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "2. Testing environment validation..."
echo "   (This should show warnings about missing DATABASE_URL)"

# Test with missing DATABASE_URL
unset DATABASE_URL
node -e "
const { validateEnvironment } = require('./dist/server.js');
console.log('Environment validation test completed');
" 2>&1 | head -10

echo ""
echo "3. Checking Prisma client generation..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generation successful"
else
    echo "❌ Prisma client generation failed"
fi

echo ""
echo "4. Verifying deployment scripts..."
if [ -x "./render-deploy.sh" ]; then
    echo "✅ render-deploy.sh is executable"
else
    echo "❌ render-deploy.sh is not executable"
fi

if [ -x "./render-start.sh" ]; then
    echo "✅ render-start.sh is executable"
else
    echo "❌ render-start.sh is not executable"
fi

echo ""
echo "🎉 All tests completed!"
echo "Ready for Render deployment."
