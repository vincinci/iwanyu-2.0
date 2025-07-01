const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testAdminSecurity() {
  try {
    console.log('🔒 Testing Admin Security Measures...\n');

    // Test 1: Check current admin count
    console.log('📊 Test 1: Checking existing admin accounts...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    console.log(`✅ Found ${adminUsers.length} admin account(s):`);
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
    });

    if (adminUsers.length !== 1) {
      console.log('⚠️  WARNING: Expected exactly 1 admin account!');
    }

    // Test 2: Try to register as admin via API
    console.log('\n🚫 Test 2: Attempting to register with admin role via API...');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        email: 'hacker@test.com',
        password: 'password123',
        firstName: 'Hacker',
        lastName: 'User',
        role: 'ADMIN'
      });

      if (response.data.success) {
        const newUser = response.data.data.user;
        console.log(`❌ SECURITY ISSUE: User created with role: ${newUser.role}`);
        if (newUser.role === 'ADMIN') {
          console.log('🚨 CRITICAL: Admin role was assigned via registration!');
        }
      }
    } catch (error) {
      console.log('✅ Registration API correctly rejected or limited the request');
    }

    // Test 3: Check if unauthorized admin was created
    console.log('\n🔍 Test 3: Checking for unauthorized admin accounts...');
    const newAdmins = await prisma.user.findMany({
      where: { 
        role: 'ADMIN',
        email: { not: 'admin@iwanyu.store' }
      }
    });

    if (newAdmins.length > 0) {
      console.log('🚨 CRITICAL: Unauthorized admin accounts detected:');
      newAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
    } else {
      console.log('✅ No unauthorized admin accounts found');
    }

    // Test 4: Verify the official admin account
    console.log('\n👤 Test 4: Verifying official admin account...');
    const officialAdmin = await prisma.user.findUnique({
      where: { email: 'admin@iwanyu.store' },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (officialAdmin && officialAdmin.role === 'ADMIN') {
      console.log('✅ Official admin account is properly configured');
      console.log(`   Email: ${officialAdmin.email}`);
      console.log(`   Active: ${officialAdmin.isActive}`);
    } else {
      console.log('❌ Official admin account is missing or misconfigured!');
    }

    // Clean up any test accounts
    console.log('\n🧹 Cleaning up test accounts...');
    const deleted = await prisma.user.deleteMany({
      where: {
        email: 'hacker@test.com'
      }
    });
    
    if (deleted.count > 0) {
      console.log(`✅ Cleaned up ${deleted.count} test account(s)`);
    }

    console.log('\n🎯 Security Test Summary:');
    console.log(`   - Total admin accounts: ${adminUsers.length}`);
    console.log(`   - Official admin exists: ${officialAdmin ? '✅' : '❌'}`);
    console.log(`   - Unauthorized admins: ${newAdmins.length === 0 ? '✅ None' : `❌ ${newAdmins.length} found`}`);
    
    if (adminUsers.length === 1 && officialAdmin && newAdmins.length === 0) {
      console.log('\n🔒 ✅ ADMIN SECURITY: PROPERLY CONFIGURED');
    } else {
      console.log('\n🚨 ⚠️  ADMIN SECURITY: ISSUES DETECTED');
    }

  } catch (error) {
    console.error('❌ Security test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSecurity();
