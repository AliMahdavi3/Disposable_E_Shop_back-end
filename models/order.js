const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    items: [{
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        default: 'Pending'
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    additionalComment: {
        type: String,
        required: false,
    },
    totalPrice: {
        type: Number,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    formattedPrice: {
        type: String,
        required: true
    },
    paymentAuthority: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);