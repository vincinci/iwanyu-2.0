"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_1 = require("../src/utils/auth");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const adminPassword = await (0, auth_1.hashPassword)('Admin$100');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@iwanyu.store' },
        update: {},
        create: {
            email: 'admin@iwanyu.store',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user created:', admin.email);
    const categories = [
        {
            name: 'Electronics',
            description: 'Electronic devices and gadgets',
        },
        {
            name: 'Fashion',
            description: 'Clothing, shoes, and accessories',
        },
        {
            name: 'Home & Garden',
            description: 'Home improvement and garden supplies',
        },
        {
            name: 'Books',
            description: 'Books and educational materials',
        },
        {
            name: 'Sports',
            description: 'Sports equipment and accessories',
        },
    ];
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('✅ Categories created');
    console.log('🎉 Database seeding completed! Only admin user and basic categories created.');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map