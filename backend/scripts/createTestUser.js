const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔐 Creating test user with known password...');
    
    // Hash the password
    const password = 'testpass123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    
    // Create new test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '+250788123456',
        role: 'CUSTOMER'
      }
    });
    
    console.log('✅ Test user created successfully:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Phone: ${user.phone}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
