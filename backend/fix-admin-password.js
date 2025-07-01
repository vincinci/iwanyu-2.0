const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔑 Testing admin login...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@iwanyu.store' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found');
    console.log('   Stored password hash:', admin.password);
    
    // Test the password
    const testPassword = 'Admin$100';
    const isValidPassword = await bcrypt.compare(testPassword, admin.password);
    
    console.log('🧪 Password test:');
    console.log('   Input password:', testPassword);
    console.log('   Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('🔧 Fixing admin password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Admin password updated');
      
      // Test again
      const updatedAdmin = await prisma.user.findUnique({
        where: { email: 'admin@iwanyu.store' }
      });
      
      const isValidNow = await bcrypt.compare(testPassword, updatedAdmin.password);
      console.log('✅ Password works now:', isValidNow);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
