const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNeonDatabase() {
  try {
    console.log('🔗 Testing Neon Database Connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon PostgreSQL database');
    
    // Test creating a user
    console.log('\n📝 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test-user@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER'
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Test reading users
    console.log('\n📖 Testing user retrieval...');
    const users = await prisma.user.findMany();
    console.log('✅ Found', users.length, 'users in database');
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 Neon Database is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testNeonDatabase();
