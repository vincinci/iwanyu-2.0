const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAddProduct() {
  try {
    console.log('🧪 Testing product creation...');
    
    // Get the vendor
    const vendor = await prisma.vendor.findFirst({
      include: { user: true }
    });
    
    if (!vendor) {
      console.log('❌ No vendor found');
      return;
    }
    
    console.log(`✅ Found vendor: ${vendor.businessName}`);
    console.log(`   Verified: ${vendor.isVerified}`);
    console.log(`   Document Status: ${vendor.documentStatus}`);
    
    // Get a category
    const category = await prisma.category.findFirst();
    if (!category) {
      console.log('❌ No categories found');
      return;
    }
    
    console.log(`✅ Found category: ${category.name}`);
    
    // Try to create a product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'This is a test product to verify product creation works',
        basePrice: 25000,
        categoryId: category.id,
        vendorId: vendor.id,
        sku: `TEST-${Date.now()}`,
        status: 'PENDING'
      }
    });
    
    console.log('✅ Product created successfully!');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Product Name: ${product.name}`);
    console.log(`   Status: ${product.status}`);
    
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAddProduct();
