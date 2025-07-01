# Iwanyu E-commerce - Deployment Guide

This project has been reorganized into separate frontend and backend applications for optimal deployment on modern cloud platforms.

## 📁 Project Structure

```
iwanyu-2.0/
├── backend/              # Express.js API server (Deploy to Render)
│   ├── src/             # TypeScript source code
│   ├── prisma/          # Database schema and migrations
│   ├── uploads/         # File uploads directory
│   ├── package.json     # Backend dependencies
│   ├── render.yaml      # Render deployment config
│   └── README.md        # Backend documentation
│
├── iwanyu-frontend/     # React.js web app (Deploy to Vercel)
│   ├── src/            # React source code
│   ├── public/         # Static assets
│   ├── package.json    # Frontend dependencies
│   ├── vercel.json     # Vercel deployment config
│   └── README.md       # Frontend documentation
│
└── (legacy files)      # Original mixed structure (can be removed)
```

## 🚀 Quick Deployment

### Backend (Render)

1. **Prepare the backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Connect your Git repository
   - Choose "Web Service"
   - Set root directory to `backend`
   - Use these settings:
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Environment:** Node.js

3. **Configure environment variables in Render:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_rby0wxG8OuoI@ep-morning-violet-a8o56p2z-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=your-jwt-secret
   FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X
   FLUTTERWAVE_SECRET_KEY=FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X
   FLUTTERWAVE_ENCRYPTION_KEY=cc842f4c47bf3f882628801e
   NODE_ENV=production
   ```

### Frontend (Vercel)

1. **Prepare the frontend:**
   ```bash
   cd iwanyu-frontend
   npm install
   cp .env.example .env
   # Update REACT_APP_API_URL with your Render backend URL
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your Git repository
   - Choose "Framework Preset: Create React App"
   - Set root directory to `iwanyu-frontend`

3. **Configure environment variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   ```

## 🔧 Development Setup

### Local Development

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Backend runs on http://localhost:5001
   ```

2. **Start the frontend:**
   ```bash
   cd iwanyu-frontend
   npm install
   npm start
   # Frontend runs on http://localhost:3000
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
FLUTTERWAVE_SECRET_KEY="your-flutterwave-key"
FLUTTERWAVE_PUBLIC_KEY="your-flutterwave-public-key"
NODE_ENV="development"
PORT=5001
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
```

## 📊 Database Setup

The backend uses PostgreSQL with Prisma ORM:

1. **Set up database:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   npm run db:seed
   ```

2. **Monitor database:**
   ```bash
   npm run db:studio
   ```

## 🔍 Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Prisma
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Payment integration (Flutterwave)
- ✅ Admin dashboard endpoints
- ✅ Product management
- ✅ Order processing

### Frontend App
- ✅ React 18 with TypeScript
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Product catalog with search

## 🛠 Maintenance

### Backend Updates
```bash
cd backend
npm run build
npm run db:migrate
npm start
```

### Frontend Updates
```bash
cd iwanyu-frontend
npm run build
# Deploy automatically triggers on git push
```

## 📝 Documentation

- **Backend API:** See `backend/README.md`
- **Frontend App:** See `iwanyu-frontend/README.md`
- **API Documentation:** Available at `/api/docs` when backend is running

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors:** Check that REACT_APP_API_URL is correctly set
2. **Database connection:** Verify DATABASE_URL in backend environment
3. **Build failures:** Check Node.js version compatibility (18+)
4. **Payment issues:** Verify Flutterwave keys in backend environment

### Getting Help

- Check the individual README files in `backend/` and `iwanyu-frontend/`
- Review environment variable configuration
- Check deployment logs in Render and Vercel dashboards

## 📄 License

This project is licensed under the MIT License.
