import { checkDatabaseConnection, prisma } from '../src/utils/db';

async function checkDatabase() {
  console.log('🔍 Checking database connection and health...');
  
  try {
    // Check basic connection
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Check table existence and count records
    console.log('\n📊 Database Statistics:');
    
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`📂 Categories: ${categoryCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`📦 Products: ${productCount}`);
    
    const orderCount = await prisma.order.count();
    console.log(`🛒 Orders: ${orderCount}`);
    
    const vendorCount = await prisma.vendor.count();
    console.log(`🏪 Vendors: ${vendorCount}`);

    // Check admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (adminUser) {
      console.log(`\n👑 Admin user found: ${adminUser.email}`);
    } else {
      console.log('\n⚠️  No admin user found! Run: npm run create-admin');
    }

    // Check database size (for SQLite)
    if (process.env.DATABASE_URL?.includes('file:')) {
      try {
        const stats = await prisma.$queryRaw<[{ size: number }]>`
          SELECT page_count * page_size as size 
          FROM pragma_page_count(), pragma_page_size()
        `;
        
        if (stats && stats[0]) {
          const sizeInMB = stats[0].size / (1024 * 1024);
          console.log(`💾 Database size: ${sizeInMB.toFixed(2)} MB`);
        }
      } catch (error) {
        console.log('💾 Database size: Unable to calculate');
      }
    }

    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
