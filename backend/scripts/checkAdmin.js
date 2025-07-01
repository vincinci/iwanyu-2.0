"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function checkAndCreateAdmin() {
    console.log('🔍 Checking for admin users...');
    try {
        const adminUsers = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            }
        });
        console.log(`Found ${adminUsers.length} admin user(s)`);
        if (adminUsers.length > 0) {
            console.log('📋 Admin users:');
            adminUsers.forEach((admin, index) => {
                console.log(`${index + 1}. Email: ${admin.email} | Name: ${admin.firstName} ${admin.lastName} | ID: ${admin.id}`);
            });
        }
        else {
            console.log('❌ No admin users found. Creating default admin...');
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
            const adminUser = await prisma.user.create({
                data: {
                    email: 'admin@iwanyu.com',
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Default admin user created:');
            console.log(`Email: admin@iwanyu.com`);
            console.log(`Password: admin123`);
            console.log(`ID: ${adminUser.id}`);
        }
        console.log('\n🔗 Testing database connection...');
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        console.log(`Total users: ${userCount}`);
        console.log(`Total products: ${productCount}`);
        console.log(`Total orders: ${orderCount}`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkAndCreateAdmin();
//# sourceMappingURL=checkAdmin.js.map