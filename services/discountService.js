const Discount = require('../models/discount');

const validateDiscountCode = async (code) => {
    const discount = await Discount.findOne({ code: code, isActive: true }).exec();
    if (discount.isActive && (discount.expiresAt === undefined || discount.expiresAt > new Date())) {
        return discount
    } else {
        return null
    }
};

const calculateDiscountAmount = (subtotal, discount) => {
    return (subtotal * discount.percentage) / 100;
};

module.exports = {
    validateDiscountCode,
    calculateDiscountAmount
};