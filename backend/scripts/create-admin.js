"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_1 = require("../src/utils/auth");
const prisma = new client_1.PrismaClient();
async function createAdmin() {
    try {
        console.log('🔐 Creating admin account...');
        const hashedPassword = await (0, auth_1.hashPassword)('Admin$100');
        const admin = await prisma.user.upsert({
            where: { email: 'admin@iwanyu.store' },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                email: 'admin@iwanyu.store',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                isActive: true,
            },
        });
        console.log('✅ Admin account created successfully!');
        console.log('📧 Email: admin@iwanyu.store');
        console.log('🔑 Password: Admin$100');
        console.log('👤 Role: ADMIN');
        console.log('🆔 User ID:', admin.id);
    }
    catch (error) {
        console.error('❌ Error creating admin account:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdmin()
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=create-admin.js.map