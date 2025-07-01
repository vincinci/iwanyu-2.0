"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/utils/db");
async function checkDatabase() {
    console.log('🔍 Checking database connection and health...');
    try {
        const isConnected = await (0, db_1.checkDatabaseConnection)();
        if (!isConnected) {
            console.error('❌ Database connection failed');
            process.exit(1);
        }
        console.log('\n📊 Database Statistics:');
        const userCount = await db_1.prisma.user.count();
        console.log(`👥 Users: ${userCount}`);
        const categoryCount = await db_1.prisma.category.count();
        console.log(`📂 Categories: ${categoryCount}`);
        const productCount = await db_1.prisma.product.count();
        console.log(`📦 Products: ${productCount}`);
        const orderCount = await db_1.prisma.order.count();
        console.log(`🛒 Orders: ${orderCount}`);
        const vendorCount = await db_1.prisma.vendor.count();
        console.log(`🏪 Vendors: ${vendorCount}`);
        const adminUser = await db_1.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (adminUser) {
            console.log(`\n👑 Admin user found: ${adminUser.email}`);
        }
        else {
            console.log('\n⚠️  No admin user found! Run: npm run create-admin');
        }
        if (process.env.DATABASE_URL?.includes('file:')) {
            try {
                const stats = await db_1.prisma.$queryRaw `
          SELECT page_count * page_size as size 
          FROM pragma_page_count(), pragma_page_size()
        `;
                if (stats && stats[0]) {
                    const sizeInMB = stats[0].size / (1024 * 1024);
                    console.log(`💾 Database size: ${sizeInMB.toFixed(2)} MB`);
                }
            }
            catch (error) {
                console.log('💾 Database size: Unable to calculate');
            }
        }
        console.log('\n✅ Database check completed successfully!');
    }
    catch (error) {
        console.error('❌ Database check failed:', error);
        process.exit(1);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
checkDatabase();
//# sourceMappingURL=checkDatabase.js.map