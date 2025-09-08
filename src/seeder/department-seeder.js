const prisma = require("../config/DbConfig");
const { DEPARTMENTS } = require("../utills/constants");

const departmentSeeder = async (req, h) => {
    try {
        const allRoles = Object.values(DEPARTMENTS);


        const existingDepartments = await prisma.department.findMany({
            select: { department: true },
        });


        const existingDepartmentsNames = existingDepartments.map(role => role.role);
        // console.log("existingDepartmentsNames : ", existingDepartmentsNames);

        // Filter out roles that are not already present in the database
        const newDepartments = allRoles.filter(department => !existingDepartmentsNames.includes(department));

        // Add new roles to the database
        if (newDepartments.length > 0) {
            await prisma.department.createMany({
                data: newDepartments.map(department => ({ department })),
            });
            console.log("New departments added:", newDepartments);
        } else {
            console.log("No new department to add.");
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

departmentSeeder().catch(e => {
    console.log(e);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
})

module.exports = departmentSeeder;
