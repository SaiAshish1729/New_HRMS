const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');
const { ROLES, STATUS } = require("../utills/constants");

// ```````````````````````````````````````````````````````````````````````````````````````````````````
// =============== (This section is only accessible by admin) =============================>>>
// ```````````````````````````````````````````````````````````````````````````````````````````````````

const createOperator = async (req, h) => {
    try {
        const admin = req.admin;
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const { profile_image: file, name, email, password, gender, contact_no, location, date_of_birth } = req.payload;

        const operatorExists = await prisma.operator.findFirst({
            where: {
                email: email,
                deleted_at: null,
            }
        });
        if (operatorExists) {
            return h.response({ message: "This operator already exists" }).code(400);
        }

        const roleExists = await prisma.role.findFirst({
            where: {
                role: ROLES.OPERATOR,
                deleted_at: null,
            }
        });
        if (!roleExists) {
            return h.response({ message: "Role not found" }).code(404);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newOperator = await prisma.operator.create({
            data: {
                name,
                email,
                gender,
                contact_no,
                location,
                date_of_birth,
                password: hashedPassword,
                role_id: roleExists.id,
                profile_image: "",
            }
        });

        let uniqueFilename = "";
        if (file) {
            const uploadDir = path.join(__dirname, "..", "uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            uniqueFilename = `${Date.now()}_${file.hapi.filename}`;
            const uploadPath = path.join(uploadDir, uniqueFilename);

            const fileStream = fs.createWriteStream(uploadPath);
            file.pipe(fileStream);

            await new Promise((resolve, reject) => {
                fileStream.on("finish", resolve);
                fileStream.on("error", reject);
            });

            const finalData = await prisma.operator.update({
                where: { id: newOperator.id },
                data: { profile_image: uniqueFilename },
            });
            return finalData;
        }

        return h.response({ success: true, message: "Operator created successfully", data: newOperator }).code(201);
    } catch (error) {
        console.error("Error creating operator:", error);
        return h.response({ message: "Error creating operator", error: error.message, }).code(500);
    }
};

const fetchAllOperators = async (req, h) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return h.response({ message: "You are not an admin" }).code(403);
        }
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 5;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 5) {
            limit = 5;
        }
        const skip = (page - 1) * limit;

        const searchFilters = {};
        if (req.query.search_field && req.query.search_input) {
            const searchField = req.query.search_field;
            const searchInput = req.query.search_input;
            searchFilters[searchField] = { contains: searchInput };
        }

        const allOperators = await prisma.operator.findMany({
            skip: skip,
            take: limit,
            where: {
                ...searchFilters,
                deleted_at: null,
            },
            orderBy: {
                id: "desc"
            }
        });
        const totalOperators = await prisma.operator.count({ where: { deleted_at: null } });
        const totalPages = Math.ceil(totalOperators / limit);
        return h.response({
            success: true, message: "Operator fetched successfully",
            data: allOperators,
            meta: {
                total_operator_count: totalOperators,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error creating operator", error: error.message, }).code(500);
    }
}

// fetch single operator
const fetchSingleOperatorById = async (req, h) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return h.response({ message: "You are not an admin" }).code(403);
        }
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }
        const { operator_id } = req.params;
        const operatorData = await prisma.operator.findFirst({
            where: {
                id: operator_id,
                deleted_at: null,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                }
            }
        });
        return h.response({ sucess: true, message: "Operator data fetched successfully", data: operatorData }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while fetching single operator", error: error, }).code(500);
    }
}

// edit operator
const editOperator = async (req, h) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return h.response({ message: "You are not an admin" }).code(403);
        }
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const { operator_id, name, gender, contact_no, location, date_of_birth, status } = req.payload;
        const operatorExists = await await prisma.operator.findUnique({
            where: {
                id: operator_id,
                deleted_at: null,
            }
        });
        if (!operatorExists) {
            return h.response({ message: "Operator not found" }).code(404);
        }
        const editData = await prisma.operator.update({
            where: {
                id: operatorExists.id,
            },
            data: {
                name: name, gender, contact_no, location, date_of_birth, status
            }
        });
        return h.response({ success: true, message: "Operator updated successfully.", data: editData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error editing operator", error: error.message, }).code(500);
    }
}
// delete operator
const deleteOperator = async (req, h) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return h.response({ message: "You are not an admin" }).code(403);
        }
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const { operator_id } = req.payload;
        const operator = await prisma.operator.findFirst({
            where: {
                id: operator_id,
                deleted_at: null,
            }
        });
        if (!operator) {
            return h.response({ message: "No operator found with provided operator_id" }).code(404);
        }
        const removeOperator = await prisma.operator.delete({
            where: {
                id: operator.id,
            }
        });
        return h.response({ success: true, message: "Operator deleted successfully", }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while deleting operator.", error: error, }).code(500);
    }
}

// suspend an operator
const suspendOperator = async (req, h) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return h.response({ message: "You are not an admin" }).code(403);
        }
        if (![ROLES.SUPER_ADMIN].includes(admin.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const { operator_id, status } = req.payload;
        const existingOperator = await prisma.operator.findFirst({
            where: {
                id: operator_id,
                deleted_at: null,
            }
        });
        if (!existingOperator) {
            return h.response({ message: "Operator not found" }).code(404);
        }
        const suspend_Operator = await prisma.operator.update({
            where: {
                id: existingOperator.id,
            },
            data: {
                status: status,
            }
        });
        return h.response({ message: "Operator status updated successfully.", data: suspend_Operator }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while deleting operator.", error: error, }).code(500);
    }
}

// ```````````````````````````````````````````````````````````````````````````````````````````````````
// =============== (This section is accessible by operators) =============================>>>
// ```````````````````````````````````````````````````````````````````````````````````````````````````
const operatorLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const operatorExists = await prisma.operator.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                }
            }
        });
        if (!operatorExists) {
            return h.response({ message: "Operator does not exist" }).code(400);
        }
        if (operatorExists.status === STATUS.INACTIVE) {
            return h.response({ message: "You are currently suspended.Please contact with administrator" }).code(400);
        }

        const isMatch = await bcrypt.compare(password, operatorExists.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" }).code(400);
        }
        const token = jwt.sign({ id: operatorExists.id, email: operatorExists.email }, process.env.SECRET, {
            expiresIn: "1d"
        });


        return h.response({ message: "Login sucessfully", token: token, data: operatorExists }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while operator login", error: error, }).code(500);
    }
}

// operator's profile
const operatorProfile = async (req, h) => {
    try {
        const operatorData = await prisma.operator.findUnique({
            where: {
                id: req.operatorId,
                deleted_at: null,
            }
        });
        // console.log("Id : ", req.operatorId)
        return h.response({ message: "Operator profile fetched successfully", data: operatorData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while fetching operator's profile.", error: error, }).code(500);
    }
}

module.exports = {
    createOperator,
    fetchAllOperators,
    fetchSingleOperatorById,
    operatorLogin,
    operatorProfile,
    deleteOperator,
    editOperator,
    suspendOperator,

}