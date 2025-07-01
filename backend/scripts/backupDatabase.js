"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function backupDatabase() {
    console.log('💾 Starting database backup...');
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL not found in environment variables');
        }
        const backupsDir = path_1.default.join(process.cwd(), 'backups');
        if (!(0, fs_1.existsSync)(backupsDir)) {
            (0, fs_1.mkdirSync)(backupsDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        if (databaseUrl.includes('file:')) {
            const dbPath = databaseUrl.replace('file:', '');
            const backupPath = path_1.default.join(backupsDir, `backup-${timestamp}.db`);
            await execAsync(`cp "${dbPath}" "${backupPath}"`);
            console.log(`✅ SQLite backup created: ${backupPath}`);
        }
        else if (databaseUrl.includes('postgresql://')) {
            const backupPath = path_1.default.join(backupsDir, `backup-${timestamp}.sql`);
            await execAsync(`pg_dump "${databaseUrl}" > "${backupPath}"`);
            console.log(`✅ PostgreSQL backup created: ${backupPath}`);
        }
        else {
            throw new Error('Unsupported database type. Only SQLite and PostgreSQL are supported.');
        }
        const { stdout } = await execAsync(`ls -1t ${backupsDir}/backup-* | tail -n +11`);
        const oldBackups = stdout.trim().split('\n').filter(Boolean);
        for (const backup of oldBackups) {
            await execAsync(`rm "${backup}"`);
            console.log(`🗑️  Cleaned up old backup: ${path_1.default.basename(backup)}`);
        }
        console.log('✅ Database backup completed successfully!');
    }
    catch (error) {
        console.error('❌ Database backup failed:', error);
        process.exit(1);
    }
}
backupDatabase();
//# sourceMappingURL=backupDatabase.js.map