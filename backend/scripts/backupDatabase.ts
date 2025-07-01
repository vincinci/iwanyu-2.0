import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

async function backupDatabase() {
  console.log('💾 Starting database backup...');
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!existsSync(backupsDir)) {
      mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (databaseUrl.includes('file:')) {
      // SQLite backup
      const dbPath = databaseUrl.replace('file:', '');
      const backupPath = path.join(backupsDir, `backup-${timestamp}.db`);
      
      await execAsync(`cp "${dbPath}" "${backupPath}"`);
      console.log(`✅ SQLite backup created: ${backupPath}`);
      
    } else if (databaseUrl.includes('postgresql://')) {
      // PostgreSQL backup
      const backupPath = path.join(backupsDir, `backup-${timestamp}.sql`);
      
      await execAsync(`pg_dump "${databaseUrl}" > "${backupPath}"`);
      console.log(`✅ PostgreSQL backup created: ${backupPath}`);
      
    } else {
      throw new Error('Unsupported database type. Only SQLite and PostgreSQL are supported.');
    }

    // Clean up old backups (keep last 10)
    const { stdout } = await execAsync(`ls -1t ${backupsDir}/backup-* | tail -n +11`);
    const oldBackups = stdout.trim().split('\n').filter(Boolean);
    
    for (const backup of oldBackups) {
      await execAsync(`rm "${backup}"`);
      console.log(`🗑️  Cleaned up old backup: ${path.basename(backup)}`);
    }

    console.log('✅ Database backup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();
