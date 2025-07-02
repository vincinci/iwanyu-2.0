# MANUAL RENDER DEPLOYMENT GUIDE

## Current Issue
Render is not automatically deploying the latest backend code despite multiple attempts. The service appears to be stuck on an old version.

## Immediate Test
After the latest commit, try testing the new test endpoint:
```bash
curl -s "https://iwanyu-backend.onrender.com/api/test/deployment-test" | jq .
```

If this returns data, the new deployment worked. If it returns 404, manual intervention is needed.

## Manual Render Dashboard Steps

### Option 1: Manual Deploy (Try First)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find the `iwanyu-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Test endpoints

### Option 2: Create New Service (If Option 1 Fails)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect to GitHub repository: `vincinci/iwanyu-2.0`
4. Configure service:
   - **Name**: `iwanyu-backend-v2`
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npx prisma generate && npx prisma migrate deploy && npm start`

### Environment Variables (Copy from old service or set new)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Copy from existing iwanyu-db]
JWT_SECRET=[Generate new or copy existing]
FRONTEND_URL=https://iwanyu-2-0.vercel.app
ALLOWED_ORIGINS=https://iwanyu-2-0.vercel.app
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X
FLUTTERWAVE_ENCRYPTION_KEY=cc842f4c47bf3f882628801e
```

### Option 3: Delete and Recreate (Last Resort)
1. Delete the old `iwanyu-backend` service
2. Create new service with same configuration
3. Update frontend environment variable to new URL

## Update Frontend URL (If New Service Created)
If you create a new service, update the frontend:

1. Update Vercel environment variable:
   - Go to Vercel dashboard
   - Find `iwanyu-2-0` project
   - Go to Settings → Environment Variables
   - Update `REACT_APP_API_URL` to new Render URL

2. Or update the frontend `.env.production`:
   ```
   REACT_APP_API_URL=https://[NEW-SERVICE-NAME].onrender.com/api
   ```

## Verification Steps
Once deployment works, test these endpoints:

```bash
# New test endpoint (should work if deployment succeeded)
curl -s "https://[SERVICE-URL]/api/test/deployment-test" | jq .

# Root endpoint (should show new API documentation)
curl -s "https://[SERVICE-URL]/" | jq .

# Health check (should show comprehensive health info)
curl -s "https://[SERVICE-URL]/api/health" | jq .

# Admin test (should show admin routes working)
curl -s "https://[SERVICE-URL]/api/admin/test" | jq .

# Run full test suite
./test-routing.sh
```

## Expected Results After Successful Deployment
```json
{
  "message": "New deployment working!",
  "timestamp": "2025-07-02T...",
  "version": "1.0.3",
  "deploymentId": "test-deploy-..."
}
```

## Troubleshooting

### If Build Fails
- Check build logs in Render dashboard
- Verify `package.json` and `tsconfig.json` are correct
- Ensure all dependencies are in `package.json`

### If Start Fails  
- Check start logs for database connection errors
- Verify DATABASE_URL environment variable
- Check Prisma schema compatibility

### If Routes Still 404
- Verify the service is actually running the new code
- Check that `rootDir: backend` is set correctly
- Ensure the build created `dist/server.js` properly

## Alternative Deployment Services
If Render continues to have issues, consider:
- **Railway**: Similar to Render, good for Node.js
- **Fly.io**: Fast deployment, good free tier
- **Heroku**: Reliable but more expensive
- **DigitalOcean App Platform**: Good performance

## Files to Check
- `render.yaml` - Service configuration
- `backend/package.json` - Build scripts and dependencies  
- `backend/src/server.ts` - Route mounting and app structure
- `backend/tsconfig.json` - TypeScript compilation settings
