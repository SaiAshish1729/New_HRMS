const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');
const { ROLES, STATUS, ATTENDENCE_STATUS } = require("../utills/constants");

const { formatInTimeZone } = require("date-fns-tz");

const IST_TIMEZONE = "Asia/Kolkata";

function formatIST(date) {
    if (!date) return null;
    return formatInTimeZone(date, IST_TIMEZONE, "dd-MM-yyyy hh:mm:ss a");
}

const addUsers = async (req, h) => {
    try {
        const { name, email, password, department_id, designation, role_id } = req.payload;
        const userExists = await prisma.user.findFirst({
            where: {
                email,
                deletedAt: null,
            }
        });
        if (userExists) {
            return h.response({ message: "User already exists" }).code(400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, department_id, designation, role_id
            }
        });
        return h.response({ success: true, data: newUser }).code(201);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while creating uesr", error }).code(500);
    }
}

const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const user = await prisma.user.findFirst({
            where: { email: email },
        });

        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "5d" });

        // Attendance logic
        const now = new Date();

        // Get today's date in YYYY-MM-DD (UTC)
        const todayStr = now.toISOString().split("T")[0];
        const today = new Date(todayStr);

        let attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        if (!attendance) {
            attendance = await prisma.attendance.create({
                data: {
                    userId: user.id,
                    date: today,
                    checkIn: now,
                    status: ATTENDENCE_STATUS.PRESENT,
                },
            });
        }

        //  Format IST time nicely
        const formatISTDateTime = (d) => {
            if (!d) return null;

            const datePart = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
                .format(d)
                .replace(/\//g, "-"); // "DD-MM-YYYY"

            const timePart = new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
                .format(d)
                .toLowerCase(); // "hh:mm:ss am/pm"

            return `${datePart} ${timePart}`;
        };

        const todaysLogin = attendance?.checkIn ? formatISTDateTime(attendance.checkIn) : null;

        return h.response({
            message: "Login successfully",
            token,
            data: user,
            todaysLogin,
        })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({
                message: "Server error while logging in user",
                error,
            })
            .code(500);
    }
};


const userProfile = async (req, h) => {
    try {
        const user = req.user;

        // Build "today" in IST to match your @db.Date column (no time)
        const todayISTStr = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date()); // -> "YYYY-MM-DD" in IST
        const today = new Date(todayISTStr); // ok for Prisma @db.Date comparisons



        //  calculate today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        // Fetch only today's attendance
        const todayAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        // Helper: format a Date to "DD-MM-YYYY hh:mm:ss am/pm" in IST
        const formatISTDateTime = (d) => {
            if (!d) return null;
            const datePart = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }).format(d).replace(/\//g, "-"); // DD-MM-YYYY

            const timePart = new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }).format(d).toLowerCase(); // hh:mm:ss am/pm

            return `${datePart} ${timePart}`;
        };

        const todaysLogin = todayAttendance?.checkIn
            ? formatISTDateTime(todayAttendance.checkIn)
            : null;

        return h.response({
            success: true, data: {
                ...user,
                todays_checkIn: todaysLogin,
            },
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while fetching profile", error }).code(500);
    }
};

// for admin only
const allUserList = async (req, h) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const total = await prisma.user.count({
            where: { deletedAt: null }
        });

        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            skip,
            take: limit,
            orderBy: { id: "desc" }
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const userList = await Promise.all(
            users.map(async (user) => {
                const attendance = await prisma.attendance.findFirst({
                    where: {
                        userId: user.id,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    },
                    select: { checkIn: true, checkOut: true, workingHours: true }
                });
                return {
                    ...user,
                    todayCheckIn_at: formatIST(attendance?.checkIn),
                    todaysCheckout_at: formatIST(attendance?.checkOut),
                    total_working_hours: attendance?.workingHours,
                };
            })
        );

        return h.response({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: userList
        }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while fetching user list", error }).code(500);
    }
};

const userCheckout = async (req, h) => {
    try {
        const user = req.user;
        const now = new Date();

        // Get today's date (UTC) for @db.Date comparison
        const todayStr = now.toISOString().split("T")[0];
        const today = new Date(todayStr);

        // Find today's attendance
        let attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        if (!attendance) {
            return h.response({ success: false, message: "No check-in found for today" }).code(400);
        }

        if (attendance.checkOut) {
            return h.response({ success: false, message: "Already checked out today" }).code(400);
        }

        // Calculate hours & minutes
        let workingHoursStr = null;
        if (attendance.checkIn) {
            const diffMs = now - attendance.checkIn;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            workingHoursStr = `${hours} hours ${minutes} minutes`;
        }
        // Update checkout
        const updatedAttendance = await prisma.attendance.update({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
            data: {
                checkOut: now,
                workingHours: workingHoursStr,
            },
        });
        if (workingHoursStr < "6 hours 0 minutes") {
            await prisma.attendance.update({
                where: {
                    userId_date: {
                        userId: user.id,
                        date: today,
                    },
                },
                data: {
                    status: "HALF DAY",
                },
            });

        }

        return h.response({
            success: true,
            message: "Checked out successfully",
            checkOut: formatIST(updatedAttendance.checkOut),
            workingHours: updatedAttendance.workingHours,
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while checkout", error }).code(500);
    }
};


module.exports = {
    addUsers,
    allUserList,
    userLogin,
    userProfile,
    userCheckout
}