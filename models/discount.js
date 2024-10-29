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
        type: Date,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Discount', discountSchema);


