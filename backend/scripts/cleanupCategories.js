"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function cleanupCategories() {
    console.log('🗑️  Cleaning up categories...');
    try {
        const allCategories = await prisma.category.findMany();
        console.log(`Found ${allCategories.length} categories`);
        const essentialCategories = [
            'Electronics',
            'Fashion',
            'Home & Garden',
            'Sports',
            'Books',
            'General'
        ];
        console.log('Ensuring essential categories exist...');
        const categoryMap = {};
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
            }
            else {
                await prisma.category.update({
                    where: { id: category.id },
                    data: { isActive: true }
                });
                console.log(`✅ Ensured category is active: ${categoryName}`);
            }
            categoryMap[categoryName] = category.id;
        }
        const generalCategory = await prisma.category.findFirst({
            where: { name: 'General' }
        });
        if (!generalCategory) {
            throw new Error('General category not found');
        }
        const categoriesToDelete = await prisma.category.findMany({
            where: {
                name: {
                    notIn: essentialCategories
                }
            }
        });
        console.log(`Found ${categoriesToDelete.length} categories to delete`);
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
        console.log('Deleting non-essential categories...');
        const deleteResult = await prisma.category.deleteMany({
            where: {
                name: {
                    notIn: essentialCategories
                }
            }
        });
        console.log(`Deleted ${deleteResult.count} categories`);
        const finalCategories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        console.log('🎯 Final categories:');
        finalCategories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} (Active: ${cat.isActive})`);
        });
        console.log('✅ Category cleanup completed!');
    }
    catch (error) {
        console.error('❌ Error cleaning up categories:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
cleanupCategories();
//# sourceMappingURL=cleanupCategories.js.map