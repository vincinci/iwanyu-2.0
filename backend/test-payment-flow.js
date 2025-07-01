const axios = require('axios');

async function testPaymentFlow() {
  try {
    console.log('💳 Testing Complete Payment Flow...');
    
    // Step 1: Login as customer
    console.log('\n1. 🔑 Logging in as customer...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'customer@test.com',
      password: 'Customer123!'
    });
    
    const customerToken = loginResponse.data.data.token;
    const customerId = loginResponse.data.data.user.id;
    console.log('   ✅ Customer logged in successfully');
    
    // Step 2: Create a test product (as admin)
    console.log('\n2. 📦 Creating test product...');
    const adminLoginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'admin@iwanyu.store',
      password: 'Admin$100'
    });
    
    const adminToken = adminLoginResponse.data.data.token;
    
    // Get categories first
    const categoriesResponse = await axios.get('http://localhost:5002/api/categories');
    const categoryId = categoriesResponse.data.data[0].id;
    
    const productResponse = await axios.post('http://localhost:5002/api/admin/products', {
      name: 'Test Payment Product',
      description: 'Product for testing payment flow',
      price: 5000, // 5000 RWF
      stock: 10,
      categoryId: categoryId,
      images: []
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const productId = productResponse.data.data.id;
    console.log('   ✅ Product created:', productId);
    
    // Step 3: Create address directly in database for testing
    console.log('\n3. 📍 Creating customer address...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const address = await prisma.address.create({
      data: {
        userId: customerId,
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+250788123456',
        street: '123 Test Street',
        city: 'Kigali',
        state: 'Kigali',
        zipCode: '00001',
        country: 'Rwanda',
        isDefault: true
      }
    });
    
    const addressId = address.id;
    console.log('   ✅ Address created:', addressId);
    await prisma.$disconnect();
    
    // Step 4: Create order
    console.log('\n4. 🛒 Creating order...');
    const orderResponse = await axios.post('http://localhost:5002/api/orders', {
      addressId: addressId,
      paymentMethod: 'card',
      items: [{
        productId: productId,
        quantity: 1
      }],
      notes: 'Test order for payment flow'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    const orderId = orderResponse.data.data.id;
    console.log('   ✅ Order created:', orderId);
    console.log('   💰 Order total:', orderResponse.data.data.total, 'RWF');
    
    // Step 5: Initialize payment
    console.log('\n5. 💳 Initializing payment with Flutterwave...');
    const paymentResponse = await axios.post(`http://localhost:5002/api/orders/${orderId}/pay`, {
      paymentMethod: 'card',
      customerInfo: {
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '+250788123456'
      }
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    console.log('   ✅ Payment initialized successfully');
    console.log('   🔗 Payment Link:', paymentResponse.data.data.payment_link);
    console.log('   📋 Transaction Ref:', paymentResponse.data.data.tx_ref);
    
    console.log('\n🎉 Complete Payment Flow Test Successful!');
    console.log('\n📊 Summary:');
    console.log('✅ Customer authentication');
    console.log('✅ Address creation');
    console.log('✅ Product management');
    console.log('✅ Order creation');
    console.log('✅ Flutterwave payment initialization');
    console.log('\n💡 Payment link is ready for testing in browser!');
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPaymentFlow();
