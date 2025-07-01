#!/usr/bin/env node

import { 
  prisma, 
  getDatabaseStats, 
  checkDatabaseConnection,
  optimizeDatabase,
  createDatabaseBackup 
} from '../src/utils/db';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DatabaseMetrics {
  connectionHealth: boolean;
  responseTime: number;
  tableStats: Array<{
    tableName: string;
    recordCount: number;
    estimatedSize: string;
  }>;
  indexStats: Array<{
    tableName: string;
    indexName: string;
    unique: boolean;
  }>;
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
    errorRate: number;
  };
}

async function collectDatabaseMetrics(): Promise<DatabaseMetrics> {
  console.log('📊 Collecting database metrics...');
  
  // Test connection health and response time
  const startTime = performance.now();
  const connectionHealth = await checkDatabaseConnection();
  const responseTime = performance.now() - startTime;
  
  // Get database statistics
  const stats = getDatabaseStats();
  
  // Collect table statistics
  const tableStats = await collectTableStats();
  
  // Collect index information
  const indexStats = await collectIndexStats();
  
  return {
    connectionHealth,
    responseTime,
    tableStats,
    indexStats,
    performance: {
      avgQueryTime: responseTime,
      slowQueries: 0, // This would need to be tracked over time
      totalQueries: stats.totalQueries,
      errorRate: stats.totalQueries > 0 ? 
        (stats.failedQueries / stats.totalQueries * 100) : 0
    }
  };
}

async function collectTableStats(): Promise<Array<{
  tableName: string;
  recordCount: number;
  estimatedSize: string;
}>> {
  const tables = [
    'users', 'vendors', 'products', 'categories', 'orders', 
    'orderItems', 'reviews', 'cartItems', 'addresses', 'payments'
  ];
  
  const tableStats: Array<{
    tableName: string;
    recordCount: number;
    estimatedSize: string;
  }> = [];
  
  for (const tableName of tables) {
    try {
      // Get record count for each table
      const count = await (prisma as any)[tableName].count();
      
      tableStats.push({
        tableName,
        recordCount: count as number,
        estimatedSize: estimateTableSize(count)
      });
    } catch (error) {
      console.warn(`⚠️ Could not get stats for table ${tableName}:`, error);
    }
  }
  
  return tableStats;
}

async function collectIndexStats() {
  try {
    // Query SQLite system tables for index information
    const indexes = await prisma.$queryRaw`
      SELECT 
        m.tbl_name as tableName,
        m.name as indexName,
        m.sql,
        ii.unique
      FROM sqlite_master m
      LEFT JOIN pragma_index_info(m.name) ii ON 1=1
      WHERE m.type = 'index' 
      AND m.tbl_name NOT LIKE 'sqlite_%'
      GROUP BY m.name
    ` as Array<{
      tableName: string;
      indexName: string;
      sql: string;
      unique: number;
    }>;
    
    return indexes.map(idx => ({
      tableName: idx.tableName,
      indexName: idx.indexName,
      unique: Boolean(idx.unique)
    }));
  } catch (error) {
    console.warn('⚠️ Could not collect index stats:', error);
    return [];
  }
}

function estimateTableSize(recordCount: number): string {
  // Rough estimation based on average record size
  const avgRecordSize = 500; // bytes
  const totalBytes = recordCount * avgRecordSize;
  
  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(2)} KB`;
  if (totalBytes < 1024 * 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function generateReport(metrics: DatabaseMetrics): Promise<string> {
  const timestamp = new Date().toISOString();
  
  let report = `# Database Health Report
Generated: ${timestamp}

## Connection Health
- Status: ${metrics.connectionHealth ? '✅ Healthy' : '❌ Unhealthy'}
- Response Time: ${metrics.responseTime.toFixed(2)}ms

## Performance Metrics
- Total Queries: ${metrics.performance.totalQueries}
- Error Rate: ${metrics.performance.errorRate.toFixed(2)}%
- Average Query Time: ${metrics.performance.avgQueryTime.toFixed(2)}ms

## Table Statistics
`;

  metrics.tableStats.forEach(table => {
    report += `- **${table.tableName}**: ${table.recordCount.toLocaleString()} records (${table.estimatedSize})\n`;
  });

  report += `\n## Index Information\n`;
  
  const indexesByTable = metrics.indexStats.reduce((acc, idx) => {
    if (!acc[idx.tableName]) acc[idx.tableName] = [];
    acc[idx.tableName].push(idx);
    return acc;
  }, {} as Record<string, typeof metrics.indexStats>);

  Object.entries(indexesByTable).forEach(([tableName, indexes]) => {
    report += `- **${tableName}**: ${indexes.length} indexes\n`;
    indexes.forEach(idx => {
      report += `  - ${idx.indexName} ${idx.unique ? '(unique)' : ''}\n`;
    });
  });

  report += `\n## Recommendations\n`;
  
  // Add recommendations based on metrics
  if (metrics.performance.errorRate > 5) {
    report += `- ⚠️ High error rate detected (${metrics.performance.errorRate.toFixed(2)}%). Check database logs.\n`;
  }
  
  if (metrics.responseTime > 100) {
    report += `- ⚠️ Slow response time (${metrics.responseTime.toFixed(2)}ms). Consider optimization.\n`;
  }
  
  const totalRecords = metrics.tableStats.reduce((sum, table) => sum + table.recordCount, 0);
  if (totalRecords > 100000) {
    report += `- 💡 Large dataset detected (${totalRecords.toLocaleString()} total records). Consider implementing data archiving.\n`;
  }
  
  if (metrics.tableStats.some(table => table.recordCount > 50000)) {
    report += `- 💡 Large tables detected. Consider adding indexes for frequently queried columns.\n`;
  }

  return report;
}

async function saveDatabaseReport(report: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(process.cwd(), 'reports', `database-health-${timestamp}.md`);
  
  // Ensure reports directory exists
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  
  // Save report
  await fs.writeFile(reportPath, report);
  
  return reportPath;
}

async function main() {
  console.log('🔍 Starting database monitoring...\n');
  
  try {
    // Collect metrics
    const metrics = await collectDatabaseMetrics();
    
    // Generate report
    const report = await generateReport(metrics);
    
    // Save report
    const reportPath = await saveDatabaseReport(report);
    
    // Display summary
    console.log('📋 Database Health Summary:');
    console.log(`- Connection: ${metrics.connectionHealth ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`- Response Time: ${metrics.responseTime.toFixed(2)}ms`);
    console.log(`- Total Records: ${metrics.tableStats.reduce((sum, t) => sum + t.recordCount, 0).toLocaleString()}`);
    console.log(`- Error Rate: ${metrics.performance.errorRate.toFixed(2)}%`);
    console.log(`\n📄 Full report saved: ${reportPath}`);
    
    // Optional optimization
    if (process.argv.includes('--optimize')) {
      console.log('\n🔧 Running database optimization...');
      await optimizeDatabase();
    }
    
    // Optional backup
    if (process.argv.includes('--backup')) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(process.cwd(), 'backups', `db-backup-${timestamp}.db`);
      console.log('\n💾 Creating database backup...');
      await createDatabaseBackup(backupPath);
      console.log(`✅ Backup saved: ${backupPath}`);
    }
    
  } catch (error) {
    console.error('❌ Database monitoring failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
if (require.main === module) {
  main().catch(console.error);
}

export { collectDatabaseMetrics, generateReport };
