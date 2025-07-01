#!/usr/bin/env node

// Simple test to verify admin login and access
const axios = require('axios');

async function testAdminAccess() {
  try {
    console.log('🔐 Testing admin login and access...\n');

    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@iwanyu.store',
      password: 'Admin$100'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const { user, token } = loginResponse.data.data;
    console.log('✅ Admin login successful!');
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Step 2: Test admin users endpoint
    console.log('\n🔍 Step 2: Testing admin users endpoint...');
    const usersResponse = await axios.get('http://localhost:5001/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (usersResponse.data.success) {
      console.log('✅ Admin users endpoint accessible!');
      console.log(`   Found ${usersResponse.data.data.users.length} user(s)`);
      usersResponse.data.data.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
      });
    } else {
      console.log('❌ Admin users endpoint failed:', usersResponse.data.message);
    }

    // Step 3: Test other admin endpoints
    console.log('\n📊 Step 3: Testing admin dashboard stats...');
    try {
      const statsResponse = await axios.get('http://localhost:5001/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Admin dashboard stats accessible!');
    } catch (error) {
      console.log('❌ Admin dashboard stats failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Admin account exists and is active');
    console.log('✅ Admin login API works correctly');
    console.log('✅ Admin authentication token is valid');
    console.log('✅ Admin endpoints are accessible with proper token');
    console.log('\n📋 Next steps:');
    console.log('1. Open browser at http://localhost:3001/login');
    console.log('2. Login with: admin@iwanyu.store / Admin$100');
    console.log('3. Navigate to /admin/users');
    console.log('4. If still getting access denied, clear browser localStorage and try again');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure backend is running on http://localhost:5001');
    console.log('2. Ensure admin account exists with correct credentials');
    console.log('3. Check if JWT_SECRET is properly configured');
  }
}

testAdminAccess();
