const prisma = require("../config/DbConfig");

const fetchAlltypes = async (requestAnimationFrame, h) => {
    try {
        const types = await prisma.charges.findMany({
            where: {
                deleted_at: null,
            }
        });
        return h.response({ success: true, message: "All types with charges fetched successfully.", data: types }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ success: false, message: "Error while fetching types.", error });
    }
}

module.exports = {
    fetchAlltypes,

}