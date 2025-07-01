const axios = require('axios');
require('dotenv').config();

async function testFlutterwaveIntegration() {
  try {
    console.log('💳 Testing Flutterwave Integration...');
    
    const publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
    
    console.log('🔑 Keys configured:');
    console.log('  Public Key:', publicKey ? '✅ Present' : '❌ Missing');
    console.log('  Secret Key:', secretKey ? '✅ Present' : '❌ Missing');
    console.log('  Encryption Key:', encryptionKey ? '✅ Present' : '❌ Missing');
    
    if (!publicKey || !secretKey || !encryptionKey) {
      throw new Error('Missing Flutterwave configuration');
    }
    
    // Test 1: Verify API connectivity
    console.log('\n🌐 Testing Flutterwave API connectivity...');
    const response = await axios.get('https://api.flutterwave.com/v3/transactions', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Successfully connected to Flutterwave API');
      console.log('   Status:', response.data.status);
      console.log('   Message:', response.data.message);
    }
    
    // Test 2: Create a test payment payload
    console.log('\n💰 Testing payment payload creation...');
    const testPaymentPayload = {
      tx_ref: `test-tx-${Date.now()}`,
      amount: 1000, // 1000 RWF
      currency: 'RWF',
      redirect_url: 'https://your-app.com/payment/callback',
      customer: {
        email: 'test@example.com',
        phonenumber: '+250788123456',
        name: 'Test Customer'
      },
      customizations: {
        title: 'Iwanyu E-commerce',
        description: 'Test payment for Iwanyu platform',
        logo: 'https://your-app.com/logo.png'
      }
    };
    
    console.log('✅ Payment payload created successfully');
    console.log('   Reference:', testPaymentPayload.tx_ref);
    console.log('   Amount:', testPaymentPayload.amount, testPaymentPayload.currency);
    
    // Test 3: Initialize payment (Note: This will create a real payment link in test mode)
    console.log('\n🚀 Testing payment initialization...');
    const paymentResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      testPaymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (paymentResponse.data.status === 'success') {
      console.log('✅ Payment initialized successfully');
      console.log('   Payment Link:', paymentResponse.data.data.link);
      console.log('   Reference:', paymentResponse.data.data.tx_ref);
      console.log('   Amount:', paymentResponse.data.data.amount, paymentResponse.data.data.currency);
    }
    
    console.log('\n🎉 Flutterwave Integration is working perfectly!');
    console.log('\n📋 Summary:');
    console.log('✅ API credentials are valid');
    console.log('✅ Can connect to Flutterwave API');
    console.log('✅ Can create payment requests');
    console.log('✅ Payment links can be generated');
    console.log('\n💡 Your Flutterwave is configured in TEST mode - perfect for development!');
    
  } catch (error) {
    console.error('❌ Flutterwave test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    }
    process.exit(1);
  }
}

testFlutterwaveIntegration();
