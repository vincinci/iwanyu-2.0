const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...');
    
    const products = await prisma.product.findMany({
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        category: true
      }
    });
    
    console.log(`📊 Found ${products.length} products:\n`);
    
    products.forEach((product, index) => {
      console.log(`📦 Product ${index + 1}:`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Description: ${product.description}`);
      console.log(`   Base Price: $${product.basePrice}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Category: ${product.category?.name || 'None'}`);
      console.log(`   Vendor: ${product.vendor?.businessName || 'None'} (${product.vendor?.user?.email || 'None'})`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
