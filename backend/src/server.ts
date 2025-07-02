import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import database utilities
import { 
  checkDatabaseConnection, 
  disconnectDatabase, 
  connectDatabase,
  getDatabaseStats,
  dbManager 
} from './utils/db';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import vendorRoutes from './routes/vendors';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import importRoutes from './routes/import';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import testRoutes from './routes/test';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { 
  databasePerformanceMonitor, 
  checkConnectionPool,
  requireDatabaseConnection 
} from './middleware/database';

dotenv.config();

// Validate critical environment variables
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('📋 Current environment variables:');
    console.error('- NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.error('- PORT:', process.env.PORT || 'not set');
    console.error('- DATABASE_URL:', process.env.DATABASE_URL ? 'set (hidden)' : 'NOT SET');
    console.error('- JWT_SECRET:', process.env.JWT_SECRET ? 'set (hidden)' : 'NOT SET');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Cannot start in production without required environment variables');
      process.exit(1);
    } else {
      console.warn('⚠️ Warning: Missing environment variables in development mode');
    }
  }
}

// Validate environment before starting
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://iwanyu-2-0.vercel.app',
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
      ].filter((url): url is string => Boolean(url))
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3003', 'http://127.0.0.1:3004', 'http://127.0.0.1:3005'],
  credentials: true
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database middleware - applied globally
app.use(databasePerformanceMonitor);
app.use(checkConnectionPool);

// Enhanced health check with database statistics
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  const dbStats = getDatabaseStats();
  
  res.json({ 
    status: dbHealth ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbHealth,
      lastHealthCheck: dbStats.lastHealthCheck,
      totalQueries: dbStats.totalQueries,
      failedQueries: dbStats.failedQueries,
      connectionAttempts: dbStats.connectionAttempts,
      errorRate: dbStats.totalQueries > 0 ? (dbStats.failedQueries / dbStats.totalQueries * 100).toFixed(2) + '%' : '0%'
    },
    version: process.version,
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    availableRoutes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login', 
        'GET /api/auth/profile',
        'PUT /api/auth/profile',
        'POST /api/auth/change-password'
      ],
      products: [
        'GET /api/products',
        'GET /api/products/:id',
        'POST /api/products',
        'PUT /api/products/:id',
        'DELETE /api/products/:id'
      ],
      categories: [
        'GET /api/categories',
        'GET /api/categories/:id',
        'POST /api/categories',
        'PUT /api/categories/:id'
      ],
      cart: [
        'GET /api/cart',
        'POST /api/cart/add',
        'PUT /api/cart/update',
        'DELETE /api/cart/remove'
      ],
      orders: [
        'GET /api/orders',
        'GET /api/orders/:id',
        'POST /api/orders',
        'PUT /api/orders/:id/status'
      ],
      admin: [
        'GET /api/admin/test',
        'GET /api/admin/dashboard/stats',
        'GET /api/admin/dashboard/recent-orders',
        'GET /api/admin/users',
        'GET /api/admin/orders',
        'GET /api/admin/vendors'
      ]
    }
  });
});

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Iwanyu E-commerce API',
    version: '1.0.1',
    status: 'running',
    timestamp: new Date().toISOString(),
    deploymentVersion: '1.0.1',
    lastUpdated: '2025-07-02T14:55:00Z',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      products: {
        list: 'GET /api/products',
        get: 'GET /api/products/:id',
        create: 'POST /api/products'
      },
      categories: {
        list: 'GET /api/categories'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart/add'
      },
      admin: {
        test: 'GET /api/admin/test',
        dashboard: 'GET /api/admin/dashboard/stats'
      }
    },
    documentation: 'https://github.com/vincinci/iwanyu-2.0'
  });
});

// Health check shortcut (for monitoring tools that expect /health)
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// API Routes with database connection requirements for critical endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', requireDatabaseConnection, userRoutes);
app.use('/api/vendors', requireDatabaseConnection, vendorRoutes);
app.use('/api/products', requireDatabaseConnection, productRoutes);
app.use('/api/categories', requireDatabaseConnection, categoryRoutes);
app.use('/api/cart', requireDatabaseConnection, cartRoutes);
app.use('/api/checkout', requireDatabaseConnection, checkoutRoutes);
app.use('/api/orders', requireDatabaseConnection, orderRoutes);
app.use('/api/payments', requireDatabaseConnection, paymentRoutes);
app.use('/api/upload', uploadRoutes);

// TEST ROUTE - Simple deployment verification
app.use('/api/test', testRoutes);
console.log('🧪 [TEST-ROUTE] Test routes mounted at /api/test');

// Debug: Log when admin routes are being mounted - DEPLOYMENT CHECK - v4
console.log('🔧 [DEPLOY-CHECK-v4] Mounting admin routes at /api/admin...');
try {
  app.use('/api/admin', requireDatabaseConnection, adminRoutes); // Re-add database middleware
  console.log('✅ [DEPLOY-CHECK-v4] Admin routes mounted successfully at /api/admin');
  console.log('🔧 [DEPLOY-CHECK-v4] Admin routes should be available at: /api/admin/test, /api/admin/dashboard/stats');
  console.log('📊 [DEPLOY-CHECK-v4] Deployment timestamp:', new Date().toISOString());
} catch (error) {
  console.error('❌ [DEPLOY-CHECK-v4] Failed to mount admin routes:', error);
}

app.use('/api/analytics', requireDatabaseConnection, analyticsRoutes);
app.use('/api/import', requireDatabaseConnection, importRoutes);

// Catch-all for frontend routes - redirect to frontend domain
// This handles cases where users directly visit /login, /dashboard, etc.
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://iwanyu-2-0.vercel.app';

// API 404 handler - only for /api/* routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API Route Not Found',
    message: `The API endpoint ${req.originalUrl} was not found on this server.`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register', 
      '/api/products',
      '/api/categories',
      '/api/cart',
      '/api/orders',
      '/api/admin',
      '/api/users',
      '/api/vendors'
    ]
  });
});

// Frontend route redirects - for non-API routes only
app.get('*', (req, res) => {
  // Common frontend routes that should be redirected
  const frontendRoutes = [
    '/login', '/register', '/dashboard', '/profile', '/cart', '/checkout',
    '/products', '/collections', '/search', '/orders', '/wishlist',
    '/vendor', '/admin', '/about', '/contact', '/become-vendor',
    '/payment-methods', '/security', '/forgot-password'
  ];
  
  // Check if this is a frontend route or starts with one
  const isFrontendRoute = frontendRoutes.some(route => 
    req.path === route || req.path.startsWith(route + '/')
  );
  
  if (isFrontendRoute || req.path === '/') {
    // Redirect to frontend with the same path and query string
    const queryString = Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query as any).toString() : '';
    const redirectUrl = `${FRONTEND_URL}${req.path}${queryString}`;
    console.log(`🔄 Redirecting frontend route ${req.path} to ${redirectUrl}`);
    return res.redirect(302, redirectUrl);
  }
  
  // For unknown routes, show a helpful 404
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found. This is an API server - visit ${FRONTEND_URL} for the web application.`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    frontendUrl: FRONTEND_URL
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize server with enhanced database connection
async function startServer() {
  try {
    // Enhanced database connection with optimizations
    console.log('🔌 Initializing database connection...');
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Set up database event listeners
    (dbManager as any).on('connected', () => {
      console.log('📡 Database connection restored');
    });

    (dbManager as any).on('disconnected', (error: Error) => {
      console.error('📡 Database connection lost:', error.message);
    });

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

    // Enhanced graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📥 Received ${signal}, starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        // Disconnect from database
        await disconnectDatabase();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught Exception:', error);
      await disconnectDatabase();
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await disconnectDatabase();
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
