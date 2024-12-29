const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    code: {
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
    applicableTo: {
        type: [String], // Array of product IDs that this discount applies to
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);


