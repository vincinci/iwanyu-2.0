import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupCategories() {
  console.log('🗑️  Cleaning up categories...');

  try {
    // Get all current categories
    const allCategories = await prisma.category.findMany();
    console.log(`Found ${allCategories.length} categories`);

    // Define essential categories to keep
    const essentialCategories = [
      'Electronics',
      'Fashion', 
      'Home & Garden',
      'Sports',
      'Books',
      'General'
    ];

    // First, ensure essential categories exist
    console.log('Ensuring essential categories exist...');
    
    const categoryMap: { [key: string]: string } = {};
    
    for (const categoryName of essentialCategories) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            description: `${categoryName} products and accessories`,
            isActive: true
          }
        });
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        // Make sure it's active
        await prisma.category.update({
          where: { id: category.id },
          data: { isActive: true }
        });
        console.log(`✅ Ensured category is active: ${categoryName}`);
      }
      
      categoryMap[categoryName] = category.id;
    }

    // Get the General category ID for reassigning products
    const generalCategory = await prisma.category.findFirst({
      where: { name: 'General' }
    });

    if (!generalCategory) {
      throw new Error('General category not found');
    }

    // Get categories to delete
    const categoriesToDelete = await prisma.category.findMany({
      where: {
        name: {
          notIn: essentialCategories
        }
      }
    });

    console.log(`Found ${categoriesToDelete.length} categories to delete`);

    // Reassign products from categories to be deleted to General category
    for (const category of categoriesToDelete) {
      const productsCount = await prisma.product.count({
        where: { categoryId: category.id }
      });

      if (productsCount > 0) {
        console.log(`Reassigning ${productsCount} products from "${category.name}" to "General"`);
        await prisma.product.updateMany({
          where: { categoryId: category.id },
          data: { categoryId: generalCategory.id }
        });
      }
    }

    // Now delete the non-essential categories
    console.log('Deleting non-essential categories...');
    const deleteResult = await prisma.category.deleteMany({
      where: {
        name: {
          notIn: essentialCategories
        }
      }
    });

    console.log(`Deleted ${deleteResult.count} categories`);

    // Get final category list
    const finalCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('🎯 Final categories:');
    finalCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (Active: ${cat.isActive})`);
    });

    console.log('✅ Category cleanup completed!');

  } catch (error) {
    console.error('❌ Error cleaning up categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCategories();
