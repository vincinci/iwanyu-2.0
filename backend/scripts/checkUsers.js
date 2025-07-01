const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        addresses: true
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'Not provided'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Addresses: ${user.addresses.length}`);
      
      if (user.addresses.length > 0) {
        user.addresses.forEach((addr, i) => {
          console.log(`   Address ${i + 1}: ${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
