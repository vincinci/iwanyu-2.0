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
    environment: process.env.NODE_ENV
  });
});

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Iwanyu E-commerce API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      users: '/api/users',
      vendors: '/api/vendors',
      orders: '/api/orders',
      cart: '/api/cart',
      payments: '/api/payments'
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

// Debug: Log when admin routes are being mounted
console.log('🔧 Mounting admin routes...');
try {
  app.use('/api/admin', adminRoutes); // Remove database middleware temporarily for debugging
  console.log('✅ Admin routes mounted successfully');
} catch (error) {
  console.error('❌ Failed to mount admin routes:', error);
}

app.use('/api/analytics', requireDatabaseConnection, analyticsRoutes);
app.use('/api/import', requireDatabaseConnection, importRoutes);

// Catch-all for frontend routes - redirect to frontend domain
// This handles cases where users directly visit /login, /dashboard, etc.
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://iwanyu-2-0.vercel.app';

app.get('*', (req, res) => {
  // Check if this looks like a frontend route (not an API route)
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
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
  }
  
  // If not a frontend route, continue to notFound middleware
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found on this server. This is an API server - visit ${FRONTEND_URL} for the web application.`,
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
