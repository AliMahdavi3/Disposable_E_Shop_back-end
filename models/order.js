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
    formattedPrice: {
        type: String,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: false
    },
    formattedDiscountedPrice: {
        type: String,
        required: false
    },
    discount: {
        discountCode: {
            type: String,
            required: false
        },
        percentage: {
            type: Number,
            required: false
        },
        amount: {
            type: Number,
            required: false
        },
    },
    paymentAuthority: {
        type: String,
        required: false
    },
    refId: {
        type: Number,
        required: false
    },
    cardPan: {
        type: String,
        required: false
    },
    fee: {
        type: Number,
        required: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);