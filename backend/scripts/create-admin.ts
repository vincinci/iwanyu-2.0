import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin account...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Existing admin email:', existingAdmin.email);
      console.log('🆔 Existing admin ID:', existingAdmin.id);
      console.log('ℹ️  Use resetAdminPassword.ts to change the admin password if needed.');
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword('Admin$100');

    // Create admin user (only if none exists)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@iwanyu.store',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@iwanyu.store');
    console.log('🔑 Password: Admin$100');
    console.log('👤 Role: ADMIN');
    console.log('🆔 User ID:', admin.id);

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
