const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@iwanyu.store' }
    });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Active:', admin.isActive);
      console.log('   Created:', admin.createdAt);
    } else {
      console.log('❌ Admin user not found');
    }
    
    const allUsers = await prisma.user.findMany();
    console.log('\n📊 Total users in database:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
