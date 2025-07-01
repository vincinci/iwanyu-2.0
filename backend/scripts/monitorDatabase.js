#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDatabaseMetrics = collectDatabaseMetrics;
exports.generateReport = generateReport;
const db_1 = require("../src/utils/db");
const perf_hooks_1 = require("perf_hooks");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
async function collectDatabaseMetrics() {
    console.log('📊 Collecting database metrics...');
    const startTime = perf_hooks_1.performance.now();
    const connectionHealth = await (0, db_1.checkDatabaseConnection)();
    const responseTime = perf_hooks_1.performance.now() - startTime;
    const stats = (0, db_1.getDatabaseStats)();
    const tableStats = await collectTableStats();
    const indexStats = await collectIndexStats();
    return {
        connectionHealth,
        responseTime,
        tableStats,
        indexStats,
        performance: {
            avgQueryTime: responseTime,
            slowQueries: 0,
            totalQueries: stats.totalQueries,
            errorRate: stats.totalQueries > 0 ?
                (stats.failedQueries / stats.totalQueries * 100) : 0
        }
    };
}
async function collectTableStats() {
    const tables = [
        'users', 'vendors', 'products', 'categories', 'orders',
        'orderItems', 'reviews', 'cartItems', 'addresses', 'payments'
    ];
    const tableStats = [];
    for (const tableName of tables) {
        try {
            const count = await db_1.prisma[tableName].count();
            tableStats.push({
                tableName,
                recordCount: count,
                estimatedSize: estimateTableSize(count)
            });
        }
        catch (error) {
            console.warn(`⚠️ Could not get stats for table ${tableName}:`, error);
        }
    }
    return tableStats;
}
async function collectIndexStats() {
    try {
        const indexes = await db_1.prisma.$queryRaw `
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
    `;
        return indexes.map(idx => ({
            tableName: idx.tableName,
            indexName: idx.indexName,
            unique: Boolean(idx.unique)
        }));
    }
    catch (error) {
        console.warn('⚠️ Could not collect index stats:', error);
        return [];
    }
}
function estimateTableSize(recordCount) {
    const avgRecordSize = 500;
    const totalBytes = recordCount * avgRecordSize;
    if (totalBytes < 1024)
        return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024)
        return `${(totalBytes / 1024).toFixed(2)} KB`;
    if (totalBytes < 1024 * 1024 * 1024)
        return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
async function generateReport(metrics) {
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
        if (!acc[idx.tableName])
            acc[idx.tableName] = [];
        acc[idx.tableName].push(idx);
        return acc;
    }, {});
    Object.entries(indexesByTable).forEach(([tableName, indexes]) => {
        report += `- **${tableName}**: ${indexes.length} indexes\n`;
        indexes.forEach(idx => {
            report += `  - ${idx.indexName} ${idx.unique ? '(unique)' : ''}\n`;
        });
    });
    report += `\n## Recommendations\n`;
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
async function saveDatabaseReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), 'reports', `database-health-${timestamp}.md`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);
    return reportPath;
}
async function main() {
    console.log('🔍 Starting database monitoring...\n');
    try {
        const metrics = await collectDatabaseMetrics();
        const report = await generateReport(metrics);
        const reportPath = await saveDatabaseReport(report);
        console.log('📋 Database Health Summary:');
        console.log(`- Connection: ${metrics.connectionHealth ? '✅ Healthy' : '❌ Unhealthy'}`);
        console.log(`- Response Time: ${metrics.responseTime.toFixed(2)}ms`);
        console.log(`- Total Records: ${metrics.tableStats.reduce((sum, t) => sum + t.recordCount, 0).toLocaleString()}`);
        console.log(`- Error Rate: ${metrics.performance.errorRate.toFixed(2)}%`);
        console.log(`\n📄 Full report saved: ${reportPath}`);
        if (process.argv.includes('--optimize')) {
            console.log('\n🔧 Running database optimization...');
            await (0, db_1.optimizeDatabase)();
        }
        if (process.argv.includes('--backup')) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(process.cwd(), 'backups', `db-backup-${timestamp}.db`);
            console.log('\n💾 Creating database backup...');
            await (0, db_1.createDatabaseBackup)(backupPath);
            console.log(`✅ Backup saved: ${backupPath}`);
        }
    }
    catch (error) {
        console.error('❌ Database monitoring failed:', error);
        process.exit(1);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=monitorDatabase.js.map