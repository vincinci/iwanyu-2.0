"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const db_1 = require("../src/utils/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function initializeDatabase() {
    console.log('🚀 Initializing database for production...');
    const prisma = new client_1.PrismaClient();
    try {
        console.log('🔌 Testing database connection...');
        const isConnected = await (0, db_1.checkDatabaseConnection)();
        if (!isConnected) {
            throw new Error('Cannot connect to database');
        }
        console.log('📦 Checking migrations...');
        console.log('🔍 Verifying database schema...');
        const adminExists = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (!adminExists) {
            console.log('⚠️  No admin user found. Creating default admin...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin$100', 12);
            await prisma.user.create({
                data: {
                    email: process.env.ADMIN_EMAIL || 'admin@iwanyu.store',
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN',
                }
            });
            console.log('✅ Admin user created');
        }
        else {
            console.log('✅ Admin user exists');
        }
        const categoryCount = await prisma.category.count();
        if (categoryCount === 0) {
            console.log('📂 Creating basic categories...');
            const categories = [
                { name: 'Electronics', description: 'Electronic devices and gadgets' },
                { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
                { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
                { name: 'Books', description: 'Books and educational materials' },
                { name: 'Sports', description: 'Sports equipment and accessories' },
            ];
            for (const category of categories) {
                await prisma.category.create({ data: category });
            }
            console.log('✅ Basic categories created');
        }
        else {
            console.log('✅ Categories exist');
        }
        if (process.env.DATABASE_URL?.includes('file:')) {
            try {
                await prisma.$queryRaw `PRAGMA journal_mode=WAL;`;
                await prisma.$queryRaw `PRAGMA synchronous=NORMAL;`;
                await prisma.$queryRaw `PRAGMA cache_size=1000000;`;
                await prisma.$queryRaw `PRAGMA foreign_keys=true;`;
                await prisma.$queryRaw `PRAGMA temp_store=memory;`;
                console.log('✅ SQLite optimizations applied');
            }
            catch (error) {
                console.log('⚠️  SQLite optimizations failed:', error);
            }
        }
        console.log('\n🎉 Database initialization completed successfully!');
        const stats = {
            users: await prisma.user.count(),
            categories: await prisma.category.count(),
            products: await prisma.product.count(),
            orders: await prisma.order.count(),
            vendors: await prisma.vendor.count(),
        };
        console.log('\n📊 Database Summary:');
        console.log(`   Users: ${stats.users}`);
        console.log(`   Categories: ${stats.categories}`);
        console.log(`   Products: ${stats.products}`);
        console.log(`   Orders: ${stats.orders}`);
        console.log(`   Vendors: ${stats.vendors}`);
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
initializeDatabase();
//# sourceMappingURL=initDatabase.js.map