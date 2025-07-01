import { PrismaClient, Prisma } from '@prisma/client';

// Database configuration factory for different environments
export class DatabaseConfigFactory {
  static createConfig(environment: string = process.env.NODE_ENV || 'development'): Prisma.PrismaClientOptions {
    const baseConfig: Prisma.PrismaClientOptions = {
      errorFormat: 'pretty',
    };

    // Validate DATABASE_URL for production
    if (environment === 'production' && !process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for production');
    }

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          log: [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ],
          // Production connection settings for PostgreSQL
          datasources: {
            db: {
              url: process.env.DATABASE_URL!
            }
          }
        };

      case 'staging':
        return {
          ...baseConfig,
          log: [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'info' },
          ],
        };

      case 'development':
      default:
        return {
          ...baseConfig,
          log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' }
          ],
        };
    }
  }

  static getConnectionPoolSettings() {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbType = this.getDatabaseType();

    if (dbType === 'postgresql') {
      return {
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
        poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '60'),
        statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
      };
    }

    // SQLite settings
    return {
      busyTimeout: 30000,
      journalMode: 'WAL',
      synchronous: 'NORMAL',
      cacheSize: -64000, // 64MB
      tempStore: 'MEMORY',
      foreignKeys: true,
    };
  }

  static getDatabaseType(): 'sqlite' | 'postgresql' | 'mysql' {
    const url = process.env.DATABASE_URL || '';
    
    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
      return 'postgresql';
    }
    
    if (url.startsWith('mysql://')) {
      return 'mysql';
    }
    
    return 'sqlite';
  }

  static async applyDatabaseOptimizations(prisma: PrismaClient): Promise<void> {
    const dbType = this.getDatabaseType();
    
    try {
      if (dbType === 'sqlite') {
        await this.applySQLiteOptimizations(prisma);
      } else if (dbType === 'postgresql') {
        await this.applyPostgreSQLOptimizations(prisma);
      }
      
      console.log(`✅ ${dbType.toUpperCase()} optimizations applied`);
    } catch (error) {
      console.error(`❌ Failed to apply ${dbType} optimizations:`, error);
    }
  }

  private static async applySQLiteOptimizations(prisma: PrismaClient): Promise<void> {
    const optimizations = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = -64000',
      'PRAGMA foreign_keys = ON',
      'PRAGMA busy_timeout = 30000',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 268435456', // 256MB
    ];

    for (const pragma of optimizations) {
      await prisma.$executeRaw(Prisma.raw(pragma));
    }
  }

  private static async applyPostgreSQLOptimizations(prisma: PrismaClient): Promise<void> {
    // PostgreSQL optimizations
    const optimizations = [
      'SET statement_timeout = 30000', // 30 seconds
      'SET lock_timeout = 10000',      // 10 seconds
      'SET idle_in_transaction_session_timeout = 300000', // 5 minutes
    ];

    for (const sql of optimizations) {
      try {
        await prisma.$executeRaw(Prisma.raw(sql));
      } catch (error) {
        console.warn(`Warning: Could not apply optimization "${sql}":`, error);
      }
    }
  }
}

// Connection health monitoring
export class DatabaseHealthMonitor {
  private static instance: DatabaseHealthMonitor;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthStatus: boolean = false;
  private healthHistory: Array<{ timestamp: Date; healthy: boolean; responseTime: number }> = [];

  static getInstance(): DatabaseHealthMonitor {
    if (!this.instance) {
      this.instance = new DatabaseHealthMonitor();
    }
    return this.instance;
  }

  startMonitoring(prisma: PrismaClient, intervalMs: number = 30000): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck(prisma);
    }, intervalMs);

    console.log(`🔍 Database health monitoring started (interval: ${intervalMs}ms)`);
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      console.log('🛑 Database health monitoring stopped');
    }
  }

  private async performHealthCheck(prisma: PrismaClient): Promise<void> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      this.recordHealthStatus(true, responseTime);
      
      if (!this.lastHealthStatus) {
        console.log('✅ Database connection restored');
        this.lastHealthStatus = true;
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordHealthStatus(false, responseTime);
      
      if (this.lastHealthStatus) {
        console.error('❌ Database connection lost:', error);
        this.lastHealthStatus = false;
      }
    }
  }

  private recordHealthStatus(healthy: boolean, responseTime: number): void {
    this.healthHistory.push({
      timestamp: new Date(),
      healthy,
      responseTime
    });

    // Keep only last 100 records
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100);
    }
  }

  getHealthStats() {
    const recent = this.healthHistory.slice(-10);
    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(h => h.healthy).length;
    const avgResponseTime = recent.reduce((sum, h) => sum + h.responseTime, 0) / recent.length;

    return {
      currentStatus: this.lastHealthStatus,
      uptime: totalChecks > 0 ? (healthyChecks / totalChecks * 100).toFixed(2) + '%' : 'N/A',
      averageResponseTime: avgResponseTime ? avgResponseTime.toFixed(2) + 'ms' : 'N/A',
      recentHistory: recent,
      totalChecks
    };
  }
}

export default DatabaseConfigFactory;
