const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: [String],
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);