const ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    EMPLOYEE: "employee",
};
const ATTENDENCE_STATUS = {
    PRESENT: "present",
    ABSCENT: "abscent"
}
const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

const DEPARTMENTS = {
    IT: "IT",
    MARKETING: "MARKETING",
    SALES: "SALES",
    OTHERS: "OTHERS"
}


const UNIQUE_ID = Math.floor(100000 + Math.random() * 900000).toString();

module.exports = {
    ROLES,
    STATUS,
    UNIQUE_ID,
    ATTENDENCE_STATUS,
    DEPARTMENTS,
}