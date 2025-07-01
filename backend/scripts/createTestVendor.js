const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestVendor() {
  try {
    console.log('🧪 Creating test vendor...');
    
    // Create a vendor user first
    const hashedPassword = await bcryptjs.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        email: 'vendor@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Vendor',
        role: 'VENDOR'
      }
    });
    
    console.log(`✅ User created: ${user.email}`);
    
    // Create vendor profile
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName: 'Test Business',
        businessType: 'retail',
        description: 'A test business for product testing',
        isVerified: true,
        documentStatus: 'APPROVED'
      }
    });
    
    console.log(`✅ Vendor created: ${vendor.businessName}`);
    console.log(`   Verified: ${vendor.isVerified}`);
    console.log(`   Document Status: ${vendor.documentStatus}`);
    
  } catch (error) {
    console.error('❌ Error creating vendor:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVendor();
