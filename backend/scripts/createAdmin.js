"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function createAdminUser() {
    console.log('Creating admin user...');
    try {
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@iwanyu.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN'
            }
        });
        console.log('Admin user created successfully!');
        console.log('Email: admin@iwanyu.com');
        console.log('Password: admin123');
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdminUser();
//# sourceMappingURL=createAdmin.js.map