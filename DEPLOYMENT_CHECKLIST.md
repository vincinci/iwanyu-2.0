# Iwanyu E-commerce Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [ ] PostgreSQL database created on Render
- [ ] Database connection string obtained
- [ ] Flutterwave account set up (test/live keys)
- [ ] JWT secret generated (min 32 characters)

### Frontend (Vercel)
- [ ] Vercel account connected to GitHub
- [ ] Frontend environment variables prepared

## 🚀 Deployment Steps

### Phase 1: Backend Deployment
1. [ ] Create PostgreSQL database on Render
2. [ ] Deploy backend web service to Render
3. [ ] Configure environment variables:
   - [ ] DATABASE_URL
   - [ ] JWT_SECRET  
   - [ ] FLUTTERWAVE_PUBLIC_KEY
   - [ ] FLUTTERWAVE_SECRET_KEY
   - [ ] NODE_ENV=production
   - [ ] PORT=5001
4. [ ] Verify backend deployment (check logs)
5. [ ] Test API endpoints: https://your-backend.onrender.com/api/health

### Phase 2: Frontend Deployment  
1. [ ] Deploy frontend to Vercel
2. [ ] Configure environment variables:
   - [ ] REACT_APP_API_URL (your Render backend URL)
   - [ ] REACT_APP_FLUTTERWAVE_PUBLIC_KEY
3. [ ] Verify frontend deployment
4. [ ] Test frontend-backend connection

### Phase 3: Cross-Origin Configuration
1. [ ] Update backend CORS settings:
   - [ ] FRONTEND_URL (your Vercel URL)
   - [ ] ALLOWED_ORIGINS (your Vercel URL)
2. [ ] Redeploy backend with new CORS settings
3. [ ] Test complete application flow

### Phase 4: Production Setup
1. [ ] Create admin account using backend script
2. [ ] Test admin login and dashboard
3. [ ] Test vendor registration and product creation
4. [ ] Test payment flow (Flutterwave)
5. [ ] Verify email notifications work

## 🔧 Environment Variables Reference

### Backend (Render)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your-secret-key-minimum-32-characters-long
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx (or FLWPUBK-xxxx for live)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxx (or FLWSECK-xxxx for live)
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx
```

## 🧪 Testing Checklist

### API Tests
- [ ] GET /api/health (backend health check)
- [ ] POST /api/auth/login (admin login)
- [ ] GET /api/admin/users (admin-only endpoint)
- [ ] POST /api/auth/register (customer registration)
- [ ] POST /api/products (vendor product creation)

### Frontend Tests  
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin dashboard accessible (admin only)
- [ ] Vendor dashboard accessible (vendors only)
- [ ] Product listing displays
- [ ] Product creation form works
- [ ] Payment flow initiates

## 🚨 Common Issues & Solutions

### Backend Issues
- **Database connection fails**: Check DATABASE_URL format
- **CORS errors**: Verify ALLOWED_ORIGINS matches frontend URL exactly
- **Build fails**: Check Node.js version compatibility (use 18.x)
- **Migration fails**: Ensure database is accessible and has proper permissions

### Frontend Issues  
- **API calls fail**: Verify REACT_APP_API_URL points to correct backend
- **Build fails**: Check for TypeScript errors or missing dependencies
- **Routing issues**: Ensure vercel.json is configured for SPA routing
- **Environment variables not working**: Prefix with REACT_APP_

### Cross-Origin Issues
- **Preflight CORS errors**: Add OPTIONS method support in backend
- **Credentials not sent**: Ensure withCredentials: true in API calls
- **Cookie issues**: Check sameSite and secure cookie settings

## 📞 Support URLs

- **Backend URL**: https://your-backend-name.onrender.com
- **Frontend URL**: https://your-frontend-name.vercel.app  
- **Database**: Render PostgreSQL Dashboard
- **Logs**: Render Service Logs / Vercel Function Logs

## 🎯 Post-Deployment

1. [ ] Set up monitoring (uptime checks)
2. [ ] Configure backup strategy
3. [ ] Set up SSL certificates (auto with Vercel/Render)
4. [ ] Configure custom domain (optional)
5. [ ] Set up analytics (Google Analytics)
6. [ ] Configure error tracking (Sentry)

---

**🚀 Your Iwanyu E-commerce Platform is Ready for Production!**
