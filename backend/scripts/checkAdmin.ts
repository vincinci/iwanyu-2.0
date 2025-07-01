import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  console.log('🔍 Checking for admin users...');

  try {
    // Check if any admin users exist
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    });

    console.log(`Found ${adminUsers.length} admin user(s)`);

    if (adminUsers.length > 0) {
      console.log('📋 Admin users:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email} | Name: ${admin.firstName} ${admin.lastName} | ID: ${admin.id}`);
      });
    } else {
      console.log('❌ No admin users found. Creating default admin...');
      
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@iwanyu.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      });

      console.log('✅ Default admin user created:');
      console.log(`Email: admin@iwanyu.com`);
      console.log(`Password: admin123`);
      console.log(`ID: ${adminUser.id}`);
    }

    // Also check database connectivity
    console.log('\n🔗 Testing database connection...');
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    
    console.log(`Total users: ${userCount}`);
    console.log(`Total products: ${productCount}`);
    console.log(`Total orders: ${orderCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();
