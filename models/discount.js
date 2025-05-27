const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    discountCode: {
        type: String,
        required: true,
        unique: true
    },
    percentage: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
