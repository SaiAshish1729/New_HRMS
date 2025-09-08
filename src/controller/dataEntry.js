const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');
const { ROLES, STATUS, UNIQUE_ID, PAYMENT_STATUS } = require("../utills/constants");
const moment = require('moment');

const enterData = async (req, h) => {
    try {
        const operator = req.operator;
        if (![ROLES.OPERATOR].includes(operator.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }

        const {
            vechile_no, type, first_wheight, m_first_wheight, second_weight, m_second_weight, net_weight,
            payment_status, payment_mode, paid_amount, due_amount, customer_name, customer_phone_number, second_weight_date, second_weight_time,
            // customer data
            name, unique_id, type_id, vechile_number, pay_status, email, contact_no, item,
            //  nested_customer_name, nested_customer_number,
        } = req.payload;

        // Find the next `serial_no`
        const lastEntry = await prisma.dataEntry.findFirst({
            orderBy: { serial_no: 'desc' },
            select: { serial_no: true }
        });

        const nextSerialNo = lastEntry ? lastEntry.serial_no + 1 : 1;

        const findCharge = await prisma.charges.findFirst({
            where: {
                type: type,
                deleted_at: null,
            }
        });
        if (!findCharge) {
            return h.response({ message: "No charges found for this type." }).code(404);
        }

        // handle customer
        const findCustomer = await prisma.customer.findFirst({
            where: {
                unique_id: unique_id,
                deleted_at: null,
            }
        });
        const result = await prisma.$transaction(async (tx) => {
            let customerId;
            if (!findCustomer) {
                const newCustomer = await prisma.customer.create({
                    data: {
                        name,
                        unique_id: UNIQUE_ID,
                        type_id, vechile_number, pay_status,
                        email, contact_no, item,
                        // nested_customer_name, nested_customer_number
                    }
                });
                customerId = newCustomer.id;
            } else {
                customerId = findCustomer.id;
            }

            // Create a new data entry
            const newForm = await prisma.dataEntry.create({
                data: {
                    serial_no: nextSerialNo,
                    vechile_no,
                    type_id: findCharge.id,
                    first_wheight,
                    m_first_wheight,
                    second_weight,
                    m_second_weight,
                    net_weight,
                    payment_status,
                    payment_mode,
                    paid_amount,
                    operator_id: operator.id,
                    customer_id: customerId,
                    charge: findCharge.charge,
                    due_amount,
                    customer_name, customer_phone_number,
                    second_weight_date, second_weight_time
                }
            });
            return { newForm }
        })

        return h.response({ success: true, message: "Data saved successfully", data: result }).code(201);
    } catch (error) {
        console.error("Error in enterData:", error);
        return h.response({ message: "Error creating operator", error: error.message }).code(500);
    }
};

// my entered data
const fetchMyDataEntryList = async (req, h) => {
    try {
        const operator = req.operator;
        if (![ROLES.OPERATOR].includes(operator.role.role)) {
            return h.response({ message: "You are not allowed to access this information!" }).code(401);
        }
        const myDataList = await prisma.dataEntry.findMany({
            where: {
                operator_id: operator.id,
                deleted_at: null,
            },
            include: {
                customer: true,
            }
        });
        return h.response({ success: true, message: "Data list fetched successfully.", data: myDataList }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error getting data list", error: error.message, }).code(500);
    }
}

// data entry list for admin 
const allDataEntry = async (req, h) => {
    try {
        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 10) {
            limit = 10;
        }
        const skip = (page - 1) * limit;

        const searchFilters = {};
        const relationFilters = {};
        if (req.query.search_field && req.query.search_input) {
            const searchField = req.query.search_field;
            const searchInput = req.query.search_input;
            if (searchField === 'serial_no') {
                searchFilters[searchField] = { equals: Number(searchInput) };
            } else if (searchField === 'operator_name') {
                relationFilters.operator = { name: { contains: searchInput } };
            } else if (searchField === 'customer_name') {
                relationFilters.customer = { name: { contains: searchInput } };
            }
            else {
                searchFilters[searchField] = { contains: searchInput };
            }

        }

        const DataList = await prisma.dataEntry.findMany({
            skip: skip,
            take: limit,
            where: {
                ...searchFilters,
                ...relationFilters,
                deleted_at: null,
            },
            include: {
                customer: true,
                operator: true,
                type: true,
            },
            orderBy: {
                id: "desc"
            }
        });

        const totalDataEntry = await prisma.dataEntry.count({ where: { ...searchFilters, ...relationFilters, deleted_at: null } });
        const totalPages = Math.ceil(totalDataEntry / limit);
        return h.response({
            success: true, message: "Data list fetched successfully.", data: DataList,
            meta: {
                total_data_entry_count: totalDataEntry,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ message: "Error while gettin all data list.", error }).code(500);
    }
}

// edit data
const editData = async (req, h) => {
    try {
        const operator = req.operator;
        // if (![ROLES.OPERATOR].includes(operator.role.role)) {
        //     return h.response({ message: "You are not allowed to access this information!" }).code(401);
        // }
        const { id } = req.params;
        const {
            vechile_no, wheel, type, first_wheight, m_first_wheight, second_weight, m_second_weight, net_weight,
            payment_status, payment_mode, paid_amount, due_amount, customer_name, customer_phone_number,
            second_weight_date, second_weight_time,
            // customer data
            name, email, contact_no, vechile_number, pay_status, item
        } = req.payload;
        const dataExists = await prisma.dataEntry.findFirst({
            where: {
                id: id,
                deleted_at: null,
            },
            include: {
                customer: true,
            }
        });
        if (!dataExists) {
            return h.response({ message: "Data not found" }).code(404);
        }
        const updateData = await prisma.dataEntry.update({
            where: {
                id: id,
            },
            data: {
                vechile_no, wheel, type_id: type, first_wheight, m_first_wheight, second_weight, m_second_weight, net_weight,
                payment_status, payment_mode, paid_amount, due_amount, type_id: type, customer_name, customer_phone_number,
                second_weight_date, second_weight_time
            }
        });

        // update customer
        const updateCustomerInfo = await prisma.customer.update({
            where: {
                id: dataExists.customer.id,
                deleted_at: null,
            },
            data: {
                name, email, contact_no, vechile_number, pay_status, item
            }
        });

        return h.response({ success: true, message: "Data updated successfully.", data: updateData, updateCustomerInfo }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while editing data.", error }).code(500);
    }
}
// ----------------------------------------------------------------
// ======================= (Reprots api) =======================>>
const reportGenerator = async (req, h) => {
    try {
        const admin = req.admin;

        const { filter } = req.query;

        // Get the start and end dates based on the filter
        let startDate, endDate;

        if (filter === 'today') {
            startDate = moment().startOf('day').toDate();
            endDate = moment().endOf('day').toDate();
        } else if (filter === 'week') {
            startDate = moment().startOf('week').toDate();
            endDate = moment().endOf('week').toDate();
        } else if (filter === 'month') {
            startDate = moment().startOf('month').toDate();
            endDate = moment().endOf('month').toDate();
        } else {
            return h.response({ message: "Invalid filter type! Use 'today', 'week', or 'month'." }).code(400);
        }
        // console.log("startDate :", startDate)
        // console.log("endDate", endDate)
        const dataEntries = await prisma.dataEntry.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                type: true,
                operator: true,
                customer: true,
            },
            orderBy: {
                id: "desc"
            }
        });

        const total_data_entry_count = await prisma.dataEntry.count({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        })

        return h.response({
            message: "Report generated successfully!",
            data: dataEntries,
            meta: {
                total_data_entry_count: total_data_entry_count
            }
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ message: "Error while generating report", error }).code(500);
    }
};
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------------------------------------------------------
// ======================= (Parking api) =======================>>
const parkingForm = async (req, h) => {
    try {
        const { vechile_no, contact_no, } = req.payload;

        const parkDetails = await prisma.parking.create({
            data: {
                vechile_no, contact_no,
            },
        });
        return h.response({ success: true, message: "Parking details saved successfully", data: parkDetails }).code(201);

    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while saving parking details.", error }).code(500);
    }
}

const getAllParkingDetails = async (req, h) => {
    try {
        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 10) {
            limit = 10;
        }
        const skip = (page - 1) * limit;

        const resp = await prisma.parking.findMany({
            skip: skip,
            take: limit,
            where: {
                deleted_at: null,
            },
            orderBy: {
                id: "desc"
            }
        });

        const total_count = await prisma.parking.count({
            where: {
                deleted_at: null,
            },
        });
        const totalPages = Math.ceil(total_count / limit);
        return h.response({
            success: true, message: "All parking details fetched successfully.", data: resp,
            meta: {
                total_count: total_count,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while fetching all parking details.", error }).code(500);
    }
}

const updateParkinTime = async (req, h) => {
    try {
        const { parking_id } = req.payload;
        const findData = await prisma.parking.findFirst({
            where: {
                id: parking_id,
                deleted_at: null,
            }
        });
        if (!findData) {
            return h.response({ message: "Parking record not found" }).code(404);
        }

        // Calculate the "to" time and duration
        const toTime = new Date();
        const fromTime = new Date(findData.from);
        const durationMs = Math.abs(toTime - fromTime);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        const totalDuration = `${hours}h ${minutes}m ${seconds}s`;

        const updateToData = await prisma.parking.update({
            where: {
                id: parking_id,
                deleted_at: null,
            },
            data: {
                to: new Date(Date.now()),
                total_hours: totalDuration,
            }
        });
        return h.response({ success: true, message: "Parking time updated successfully", data: updateToData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while updating parking status.", error }).code(500);
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------------------------------------------------------
// ======================= (Checkings api) =======================>>
const createCheckForm = async (req, h) => {
    try {
        const { vechile_no, contact_no, type_id, status, note } = req.payload;
        const typeExists = await prisma.charges.findFirst({
            where: {
                id: type_id,
                deleted_at: null,
            }
        });
        if (!typeExists) {
            return h.response({ message: "Type not found" }).code(404);
        }
        const newEntry = await prisma.check_Details.create({
            data: {
                vechile_no, contact_no, type_id: typeExists.id, status, amount: typeExists.check_charge, note,
            }
        });
        return h.response({ success: true, message: "Check details saved successfully.", data: newEntry }).code(201);
    } catch (error) {
        console.error(error);
        return h.response({ message: "Error while saving check form.", error }).code(500);
    }
}

const allCheckDetails = async (req, h) => {
    try {
        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 10) {
            limit = 10;
        }
        const skip = (page - 1) * limit;

        const resp = await prisma.check_Details.findMany({
            skip: skip,
            take: limit,
            where: {
                deleted_at: null,
            },
            include: {
                type: true,
            },
            orderBy: {
                id: "desc"
            }
        });
        const total_check_entry_count = await prisma.check_Details.count({
            where: {
                deleted_at: null,
            }
        });
        const totalPages = Math.ceil(total_check_entry_count / limit);
        return h.response({
            success: true, message: "All check details fetched successfully.", data: resp,
            meta: {
                total_count: total_check_entry_count,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ message: "Error while fetching all check details .", error }).code(500);
    }
}

const updateCheckStatus = async (req, h) => {
    try {
        const { check_id, status } = req.payload;
        const checkExists = await prisma.check_Details.findFirst({
            where: {
                id: check_id,
                deleted_at: null,
            }
        });
        if (!checkExists) {
            return h.response({ message: "Check details not found" }).code(404);
        }
        const editStatus = await prisma.check_Details.update({
            where: {
                id: checkExists.id,
            },
            data: {
                status: status,
            }
        });
        return h.response({ success: true, message: "Check status updated successfully.", data: editStatus }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while updating check status.", error }).code(500);
    }
}
// ======================== () ==============================>>>
const fetchRevenueFromCheckings = async (req, h) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Fetch the sum of the amount where status is 'Paid' and date is today
        const revenue = await prisma.check_Details.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: PAYMENT_STATUS.PAID,
                created_at: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const totalRevenue = await prisma.check_Details.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: PAYMENT_STATUS.PAID,
                deleted_at: null,
            }
        });
        return h.response({
            success: true,
            message: "Successfully fetched today's revenuem frorm checkings.",
            todays_revenuw: revenue._sum.amount || 0,
            totalRevenue: totalRevenue._sum.amount || 0,
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while fetching check revenue.", error }).code(500);
    }
}

// =============== (Ledger section)===================>>>
const createLedger = async (req, h) => {
    try {
        const { amount, parking, check, due_paid, expenses, wages, commission, loan, remarks, total_balance } = req.payload;
        const newEntry = await prisma.ledger.create({
            data: {
                amount, parking, check, due_paid, expenses, wages, commission, loan, remarks, total_balance
            }
        });
        return h.response({ success: true, message: "Ledger created successfully.", data: newEntry }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while creating ledger.", error }).code(500);
    }
}
const getAllLedger = async (req, h) => {
    try {
        const page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        if (page < 0) {
            page = 1;
        }
        if (limit <= 0 || limit >= 10) {
            limit = 10;
        }
        const skip = (page - 1) * limit;
        const resp = await prisma.ledger.findMany({
            skip: skip,
            take: limit,
            where: {
                deleted_at: null,
            }
        });
        const total_check_entry_count = await prisma.ledger.count({
            where: {
                deleted_at: null,
            }
        });
        const totalPages = Math.ceil(total_check_entry_count / limit);

        return h.response({
            success: true, message: "Ledger fetched successfully.", data: resp,
            meta: {
                total_count: total_check_entry_count,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            }
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: true, message: "Error while fetching ledger.", error }).code(500);
    }
}
module.exports = {
    enterData,
    fetchMyDataEntryList,
    allDataEntry,
    editData,
    reportGenerator,
    parkingForm,
    getAllParkingDetails,
    updateParkinTime,
    createCheckForm,
    allCheckDetails,
    updateCheckStatus,
    fetchRevenueFromCheckings,
    createLedger,
    getAllLedger
}