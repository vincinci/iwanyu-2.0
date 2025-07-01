"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function resetAdminPassword() {
    console.log('🔑 Resetting admin password...');
    try {
        const adminUser = await prisma.user.findFirst({
            where: {
                email: 'admin@iwanyu.store'
            }
        });
        if (!adminUser) {
            console.log('❌ Admin user not found');
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
        await prisma.user.update({
            where: {
                id: adminUser.id
            },
            data: {
                password: hashedPassword
            }
        });
        console.log('✅ Admin password reset successfully');
        console.log('📧 Email: admin@iwanyu.store');
        console.log('🔐 Password: admin123');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
resetAdminPassword();
//# sourceMappingURL=resetAdminPassword.js.map