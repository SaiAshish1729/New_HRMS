const prisma = require("../config/DbConfig");
const bcrypt = require('bcrypt');
const { ROLES, STATUS } = require("../utills/constants");

const adminSeeder = async (req, h) => {
    try {
        const roleExists = await prisma.role.findFirst({
            where: {
                role: ROLES.SUPER_ADMIN,
                deleted_at: null,
            }
        });
        if (!roleExists) {
            throw new Error("This user role does not exist");
        }

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: "admin@123.com",
                deleted_at: null,
            }
        });
        if (!superAdmin) {
            const password = "password";
            const hashedPassword = await bcrypt.hash(password, 10);
            const superAdminData = await prisma.admin.create({
                data: {
                    name: "Super_Admin",
                    email: "admin@123.com",
                    password: hashedPassword,
                    contact_no: "7003957953",
                    location: "Kolkata",
                    date_of_birth: "2024-11-30",
                    status: STATUS.ACTIVE,
                    role_id: roleExists.id,
                }
            });
            console.log("Super_Admin seeded successfully");
        }
    } catch (error) {
        console.log(error);
    }
}

adminSeeder().catch(e => {
    console.log(e);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});