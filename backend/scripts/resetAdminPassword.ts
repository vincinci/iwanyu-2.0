import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔑 Resetting admin password...');

  try {
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@iwanyu.store'
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Reset password to admin123
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.user.update({
      where: {
        id: adminUser.id
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ Admin password reset successfully');
    console.log('📧 Email: admin@iwanyu.store');
    console.log('🔐 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
