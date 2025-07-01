// Test script to verify login and profile functionality
const testUserLogin = async () => {
  const API_BASE = 'http://localhost:5001/api';
  
  try {
    console.log('🧪 Testing user login and profile...');
    
    // Test login
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'davyncidavy@gmail.com',
        password: 'password123' // You'll need to use the actual password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login response:', loginData);
    
    if (loginData.success) {
      const token = loginData.data.token;
      console.log('✅ Login successful, token received');
      console.log('👤 User data from login:', loginData.data.user);
      
      // Test profile endpoint
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('📄 Profile response:', profileData);
      
      if (profileData.success) {
        console.log('✅ Profile data retrieved successfully');
        console.log('📊 User profile details:', profileData.data.user);
      } else {
        console.error('❌ Profile request failed:', profileData.message);
      }
    } else {
      console.error('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Note: This would need to be run in a browser console or with proper fetch polyfill
console.log('Copy and paste this function into your browser console, then call testUserLogin()');
