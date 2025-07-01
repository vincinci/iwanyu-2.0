import { Request, Response, NextFunction } from 'express';
import { checkDatabaseConnection, getDatabaseStats, withRetry } from '../utils/db';

// Enhanced middleware to check database connection for critical routes
export const requireDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use retry logic for critical database checks
    const isConnected = await withRetry(
      () => checkDatabaseConnection(),
      { maxRetries: 2, baseDelay: 500 }
    );
    
    if (!isConnected) {
      const stats = getDatabaseStats();
      
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
        error: 'DATABASE_UNAVAILABLE',
        retryAfter: 30, // seconds
        stats: {
          lastHealthCheck: stats.lastHealthCheck,
          failedQueries: stats.failedQueries,
          errorRate: stats.totalQueries > 0 ? 
            (stats.failedQueries / stats.totalQueries * 100).toFixed(2) + '%' : '0%'
        }
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Database connection check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection check failed',
      error: 'DATABASE_CHECK_FAILED',
      retryAfter: 60
    });
  }
};

// Performance monitoring middleware
export const databasePerformanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add database timestamp for request tracking
  req.dbTimestamp = Date.now();
  
  // Add cleanup on response finish
  res.on('finish', () => {
    if (req.dbTimestamp) {
      const duration = Date.now() - req.dbTimestamp;
      
      // Log slow database operations
      if (duration > 5000) { // 5 seconds
        console.warn(`🐌 Slow database operation detected: ${req.method} ${req.path} took ${duration}ms`);
      }
    }
  });
  
  next();
};

// Lightweight middleware for non-critical routes
export const addDatabaseContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add database timestamp for request tracking
  req.dbTimestamp = Date.now();
  
  // Add database health status to response headers
  res.set('X-DB-Health', 'checking');
  
  next();
};

// Database connection pool health middleware
export const checkConnectionPool = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = getDatabaseStats();
    
    // Check if error rate is too high
    const errorRate = stats.totalQueries > 0 ? 
      (stats.failedQueries / stats.totalQueries) : 0;
    
    if (errorRate > 0.1) { // More than 10% error rate
      console.warn(`⚠️ High database error rate detected: ${(errorRate * 100).toFixed(2)}%`);
      
      // Add warning header but don't block request
      res.set('X-DB-Warning', 'High error rate detected');
    }
    
    // Update health status header
    res.set('X-DB-Health', stats.isConnected ? 'healthy' : 'degraded');
    res.set('X-DB-Last-Check', stats.lastHealthCheck.toISOString());
    
    next();
  } catch (error) {
    console.error('Connection pool check failed:', error);
    res.set('X-DB-Health', 'unknown');
    next();
  }
};

// Extend Request interface to include database context
declare global {
  namespace Express {
    interface Request {
      dbTimestamp?: number;
    }
  }
}
