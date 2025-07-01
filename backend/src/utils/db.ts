import { PrismaClient, Prisma } from '@prisma/client';
import { EventEmitter } from 'events';
import { DatabaseConfigFactory, DatabaseHealthMonitor } from './database-config';

declare global {
  var __prisma: PrismaClient | undefined;
  var __dbConnectionMonitor: EventEmitter | undefined;
  var __dbHealthMonitor: DatabaseHealthMonitor | undefined;
}

// Database connection state
interface DatabaseState {
  isConnected: boolean;
  lastHealthCheck: Date;
  connectionAttempts: number;
  totalQueries: number;
  failedQueries: number;
}

class DatabaseManager extends EventEmitter {
  private state: DatabaseState = {
    isConnected: false,
    lastHealthCheck: new Date(),
    connectionAttempts: 0,
    totalQueries: 0,
    failedQueries: 0
  };

  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.startHealthCheckMonitoring();
  }

  private startHealthCheckMonitoring() {
    // Run health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      if (!this.state.isConnected) {
        this.state.isConnected = true;
        this.emit('connected');
        console.log('✅ Database reconnected');
      }
      this.state.lastHealthCheck = new Date();
    } catch (error) {
      if (this.state.isConnected) {
        this.state.isConnected = false;
        this.emit('disconnected', error);
        console.error('❌ Database connection lost:', error);
      }
    }
  }

  getState(): DatabaseState {
    return { ...this.state };
  }

  incrementQueryCount(): void {
    this.state.totalQueries++;
  }

  incrementFailedQuery(): void {
    this.state.failedQueries++;
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.removeAllListeners();
  }
}

// Database configuration with enhanced options using factory
const databaseConfig = DatabaseConfigFactory.createConfig();

// Validate environment variables before creating Prisma client
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required for production');
  process.exit(1);
}

console.log('🔗 Database configuration:', {
  environment: process.env.NODE_ENV,
  hasDbUrl: !!process.env.DATABASE_URL,
  dbType: DatabaseConfigFactory.getDatabaseType()
});

// Create singleton Prisma instance with enhanced logging
export const prisma = globalThis.__prisma ?? new PrismaClient(databaseConfig);

// Create database manager instance
export const dbManager = globalThis.__dbConnectionMonitor ?? new DatabaseManager();

// Create health monitor instance
export const healthMonitor = globalThis.__dbHealthMonitor ?? DatabaseHealthMonitor.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
  globalThis.__dbConnectionMonitor = dbManager;
  globalThis.__dbHealthMonitor = healthMonitor;
}

// Enhanced logging setup for development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Database logging enabled for development');
  console.log(`� Database type: ${DatabaseConfigFactory.getDatabaseType().toUpperCase()}`);
}

// Initialize database optimizations and monitoring
export async function initializeDatabaseOptimizations(): Promise<void> {
  try {
    // Apply database-specific optimizations
    await DatabaseConfigFactory.applyDatabaseOptimizations(prisma);
    
    // Start health monitoring
    healthMonitor.startMonitoring(prisma);
    
    console.log('✅ Database optimizations and monitoring initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database optimizations:', error);
  }
}

// Enhanced database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    (dbManager as DatabaseManager).incrementQueryCount();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection healthy');
    return true;
  } catch (error) {
    (dbManager as DatabaseManager).incrementFailedQuery();
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Database connection with retry and monitoring
export async function connectDatabase(): Promise<boolean> {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      await prisma.$connect();
      await initializeDatabaseOptimizations();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      retryCount++;
      console.error(`❌ Database connection attempt ${retryCount}/${maxRetries} failed:`, error);
      
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ Failed to connect to database after all retries');
  return false;
}

// Graceful database disconnection
export async function disconnectDatabase(): Promise<void> {
  try {
    // Stop health monitoring
    healthMonitor.stopMonitoring();
    
    // Clean up connection monitoring
    (dbManager as DatabaseManager).destroy();
    
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('✅ Database disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error);
  }
}

// Get database statistics with health monitoring
export function getDatabaseStats(): DatabaseState & { healthStats: any } {
  const baseStats = (dbManager as DatabaseManager).getState();
  const healthStats = healthMonitor.getHealthStats();
  
  return {
    ...baseStats,
    healthStats
  };
}

// Database vacuum and optimization (SQLite)
export async function optimizeDatabase(): Promise<void> {
  try {
    console.log('🔧 Starting database optimization...');
    
    // Run VACUUM to reclaim space and optimize
    await prisma.$executeRaw`VACUUM;`;
    
    // Analyze tables for query optimization
    await prisma.$executeRaw`ANALYZE;`;
    
    // Rebuild indexes for better performance
    await prisma.$executeRaw`REINDEX;`;
    
    console.log('✅ Database optimization completed');
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  }
}

// Database transaction helper with enhanced error handling
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  const defaultOptions = {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
    ...options
  };

  try {
    (dbManager as DatabaseManager).incrementQueryCount();
    return await prisma.$transaction(callback, defaultOptions);
  } catch (error) {
    (dbManager as DatabaseManager).incrementFailedQuery();
    console.error('❌ Transaction failed:', error);
    throw error;
  }
}

// Database retry helper for critical operations with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    factor?: number;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    factor = 2
  } = options || {};

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      (dbManager as DatabaseManager).incrementFailedQuery();
      
      const isLastAttempt = attempt === maxRetries;
      const isRetryableError = isRetryableErrorType(error as Error);
      
      if (isLastAttempt || !isRetryableError) {
        console.error(`Database operation failed after ${attempt} attempts:`, error);
        break;
      }
      
      const delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Helper function to determine if an error is retryable
function isRetryableErrorType(error: Error): boolean {
  const retryableMessages = [
    'database is locked',
    'connection lost',
    'timeout',
    'network error',
    'socket hangup'
  ];
  
  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

// Database backup helper
export async function createDatabaseBackup(backupPath: string): Promise<void> {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // For SQLite, copy the database file
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    
    // Ensure backup directory exists
    const backupDir = path.dirname(backupPath);
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup with timestamp
    await fs.copyFile(dbPath, backupPath);
    
    console.log(`✅ Database backup created: ${backupPath}`);
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

// Export default instance
export default prisma;
