const axios = require('axios');

async function testVendorProductCreation() {
  try {
    console.log('🧪 Testing vendor product creation flow...');
    
    // Step 1: Login as vendor
    console.log('📝 Logging in as vendor...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'vendor@test.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    const vendor = loginResponse.data.data.user;
    
    console.log(`✅ Login successful!`);
    console.log(`   Vendor: ${vendor.firstName} ${vendor.lastName}`);
    console.log(`   Business: ${vendor.vendor.businessName}`);
    console.log(`   Verified: ${vendor.vendor.isVerified}`);
    console.log(`   Status: ${vendor.vendor.documentStatus}`);
    
    // Step 2: Get categories
    console.log('🏷️ Fetching categories...');
    const categoriesResponse = await axios.get('http://localhost:5001/api/categories');
    const categories = categoriesResponse.data.data;
    console.log(`✅ Found ${categories.length} categories`);
    
    // Step 3: Create a product
    console.log('📦 Creating product...');
    const productData = {
      name: 'Frontend Flow Test Product',
      description: 'A product created to test the complete frontend flow',
      basePrice: '25.99',
      categoryId: categories[0].id, // Use first category
      weight: '0.8',
      dimensions: '{"length": 15, "width": 10, "height": 5}',
      tags: 'test,frontend,flow'
    };
    
    const productResponse = await axios.post('http://localhost:5001/api/products', productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (productResponse.data.success) {
      const product = productResponse.data.data.product;
      console.log('✅ Product created successfully!');
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Price: RWF ${product.basePrice}`);
      console.log(`   Category: ${product.category.name}`);
      console.log(`   Status: ${product.status}`);
    } else {
      console.log('❌ Product creation failed:', productResponse.data.error);
    }
    
    // Step 4: Verify product exists
    console.log('🔍 Verifying product was created...');
    const productsResponse = await axios.get('http://localhost:5001/api/products');
    const products = productsResponse.data.data;
    
    const createdProduct = products.find(p => p.name === productData.name);
    if (createdProduct) {
      console.log('✅ Product verification successful!');
      console.log(`   Found product: ${createdProduct.name}`);
    } else {
      console.log('❌ Product not found in products list');
    }
    
    console.log('\n🎉 Vendor product creation flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVendorProductCreation();
