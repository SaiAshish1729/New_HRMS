const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');

const adminLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const adminExists = await prisma.admin.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                contact_no: true,
                date_of_birth: true,
                location: true,
                profile_image: true,
                status: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                },
                created_at: true,
                updated_at: true,
            }
        });
        if (!adminExists) {
            return h.response({ message: "Admin not exists" }).code(400);
        }

        const isMatch = await bcrypt.compare(password, adminExists.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" }).code(400);
        }
        const token = jwt.sign({ email: adminExists.email }, process.env.SECRET, {
            expiresIn: "1d"
        });

        return h.response({ message: "Login sucessfully", token: token, data: adminExists }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while admin login", error }).code(500);
    }
}

const adminProfile = async (req, h) => {
    try {
        const adminData = await prisma.admin.findFirst({
            where: {
                id: req.adminId,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                contact_no: true,
                date_of_birth: true,
                location: true,
                profile_image: true,
                status: true,
                role: {
                    select: {
                        id: true,
                        role: true,
                    }
                },
                created_at: true,
                updated_at: true,
            }
        });
        return h.response({ message: "Admin profile fetched successfully", data: adminData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while fetching admin profile", error }).code(500);
    }
}

const changePassword = async (req, h) => {
    try {
        const { oldPassword, newPassword } = req.payload;

        // Fetch the admin data using the ID from the request
        const adminData = await prisma.admin.findFirst({
            where: {
                id: req.adminId,
                deleted_at: null,
            },
            select: {
                id: true,
                password: true,
            },
        });

        if (!adminData) {
            return h.response({ message: "Admin not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(oldPassword, adminData.password);
        if (!isMatch) {
            return h.response({ message: "Old password is incorrect" }).code(400);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.admin.update({
            where: { id: adminData.id },
            data: { password: hashedNewPassword },
        });

        return h.response({ message: "Password changed successfully" }).code(200);

    } catch (error) {
        console.error(error);
        return h.response({ message: "Error while admin change password", error }).code(500);
    }
};

module.exports = {
    adminLogin,
    adminProfile,
    changePassword,
}