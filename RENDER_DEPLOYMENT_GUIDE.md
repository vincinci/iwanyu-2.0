# Render Deployment Guide for Iwanyu 2.0

This guide provides step-by-step instructions for deploying the Iwanyu e-commerce platform on Render.

## 📋 Prerequisites

- [x] GitHub repository with your code pushed
- [x] Render account (free tier available)
- [x] PostgreSQL database URL (Neon, Supabase, or Render PostgreSQL)
- [x] Flutterwave API credentials (for payments)

## 🏗️ Project Structure

```
iwanyu-2.0/
├── backend/          # Node.js/Express API
├── iwanyu-frontend/  # React frontend
└── deploy configs    # Deployment files
```

## 🗄️ Database Setup

### Option 1: Using Neon (Recommended)

1. **Create Neon Account:**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for free account
   - Create a new project

2. **Get Database URL:**
   - Copy the connection string (looks like: `postgresql://user:pass@host/db`)
   - Save this for environment variables

### Option 2: Using Render PostgreSQL

1. **Create PostgreSQL Instance:**
   - In Render dashboard, click "New +"
   - Select "PostgreSQL"
   - Choose free tier
   - Name your database (e.g., `iwanyu-db`)

2. **Get Connection Details:**
   - Note the Internal Database URL for backend
   - Note the External Database URL for local development

## 🚀 Backend Deployment

### Step 1: Create Backend Service

1. **In Render Dashboard:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `iwanyu-2.0`

2. **Configure Service:**
   ```
   Name: iwanyu-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### Step 2: Environment Variables

Add these environment variables in Render:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Node Environment
NODE_ENV=production

# Server Port (Render sets this automatically)
PORT=10000

# Flutterwave (get from flutterwave.com)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TEST-your-encryption-key

# Frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend-app.onrender.com

# CORS Origins
CORS_ORIGIN=https://your-frontend-app.onrender.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Admin Default (for initial setup)
ADMIN_EMAIL=admin@iwanyu.rw
ADMIN_PASSWORD=SecurePassword123!
```

### Step 3: Custom Build Script

Create `backend/render-build.sh`:

```bash
#!/bin/bash
echo "Starting Render build..."

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Create uploads directory
mkdir -p dist/uploads

echo "Build completed successfully!"
```

Make it executable:
```bash
chmod +x backend/render-build.sh
```

Update `backend/package.json` scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "render-build": "./render-build.sh"
  }
}
```

### Step 4: Update Render Build Command

In Render service settings, update:
```
Build Command: ./render-build.sh
```

### Step 5: Health Check Endpoint

Ensure your backend has a health check (already included):
```typescript
// In src/server.ts
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🌐 Frontend Deployment

### Step 1: Create Frontend Service

1. **In Render Dashboard:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the repository: `iwanyu-2.0`

2. **Configure Static Site:**
   ```
   Name: iwanyu-frontend
   Root Directory: iwanyu-frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

### Step 2: Environment Variables

Add these environment variables for the frontend:

```bash
# API Configuration
REACT_APP_API_URL=https://iwanyu-backend.onrender.com

# App Configuration
REACT_APP_APP_NAME=Iwanyu Store
REACT_APP_APP_URL=https://iwanyu-frontend.onrender.com

# Build Configuration
CI=false
GENERATE_SOURCEMAP=false

# Node Options (for build optimization)
NODE_OPTIONS=--max-old-space-size=4096
```

### Step 3: Build Optimization

Update `iwanyu-frontend/package.json`:
```json
{
  "scripts": {
    "build": "CI=false react-scripts build"
  }
}
```

### Step 4: Redirects for SPA

Create `iwanyu-frontend/public/_redirects`:
```
/*    /index.html   200
```

## 🔧 Backend Configuration Files

### 1. Update CORS Configuration

In `backend/src/server.ts`, ensure CORS is properly configured:

```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://iwanyu-frontend.onrender.com', // Add your actual frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Database Connection

Ensure `backend/src/utils/database-config.ts` handles production properly:

```typescript
export class DatabaseConfigFactory {
  static createConfig(environment: string = process.env.NODE_ENV || 'development'): Prisma.PrismaClientOptions {
    const baseConfig: Prisma.PrismaClientOptions = {
      errorFormat: 'pretty',
    };

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          log: [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ],
          datasources: {
            db: {
              url: process.env.DATABASE_URL
            }
          }
        };
      // ... other cases
    }
  }
}
```

## 📦 Deployment Steps

### 1. Backend Deployment

1. **Push your code** to GitHub
2. **Create backend service** in Render
3. **Add environment variables**
4. **Deploy and monitor logs**
5. **Test health endpoint**: `https://your-backend.onrender.com/health`

### 2. Frontend Deployment

1. **Create static site** in Render
2. **Add environment variables** (including backend URL)
3. **Deploy and test**
4. **Update backend CORS** with frontend URL

### 3. Post-Deployment Setup

1. **Database Migration:**
   ```bash
   # Render will run this automatically
   npx prisma migrate deploy
   ```

2. **Create Admin User:**
   - Use your backend's admin creation endpoint
   - Or run the seed script if configured

3. **Test API Endpoints:**
   ```bash
   curl https://your-backend.onrender.com/health
   curl https://your-backend.onrender.com/api/products
   ```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Problem:** TypeScript compilation errors
```bash
# Check logs in Render dashboard
# Common fixes:
```

**Solution:**
- Ensure all dependencies are in `package.json`
- Check TypeScript configuration
- Verify environment variables

#### 2. Database Connection Issues

**Problem:** Can't connect to database
```
Error: P1001: Can't reach database server
```

**Solution:**
- Verify `DATABASE_URL` format
- Ensure database allows external connections
- Check SSL mode: `?sslmode=require`

#### 3. CORS Errors

**Problem:** Frontend can't reach backend
```
Access to fetch blocked by CORS policy
```

**Solution:**
```typescript
// Update CORS configuration
app.use(cors({
  origin: [
    'https://your-frontend.onrender.com',
    process.env.FRONTEND_URL
  ]
}));
```

#### 4. Frontend Build Issues

**Problem:** Out of memory during build
```
JavaScript heap out of memory
```

**Solution:**
- Add to environment variables:
  ```
  NODE_OPTIONS=--max-old-space-size=4096
  ```

#### 5. File Upload Issues

**Problem:** File uploads failing
```
ENOENT: no such file or directory
```

**Solution:**
- Ensure uploads directory exists
- Use absolute paths
- Consider using cloud storage (AWS S3, Cloudinary)

## 📊 Monitoring and Logs

### 1. Health Monitoring

- **Backend Health:** `https://your-backend.onrender.com/health`
- **Frontend:** Check if the site loads properly

### 2. Log Access

- **Render Dashboard:** View real-time logs
- **Log Levels:** Configure appropriate logging in production

### 3. Performance Monitoring

- Monitor response times
- Database query performance
- Memory usage

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit secrets to repository
- Use strong JWT secrets
- Rotate API keys regularly

### 2. Database Security

- Use SSL connections
- Regular backups
- Monitor for suspicious activity

### 3. API Security

- Rate limiting enabled
- Input validation
- HTTPS only

## 🚀 Going Live Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] API endpoints tested
- [ ] File uploads working
- [ ] Payment integration tested
- [ ] CORS properly configured
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 📞 Support

For deployment issues:
1. Check Render documentation
2. Review application logs
3. Test endpoints individually
4. Verify environment variables
5. Check database connectivity

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Neon Database](https://neon.tech/docs)

---

**Note:** Replace placeholder URLs and credentials with your actual values before deployment.
