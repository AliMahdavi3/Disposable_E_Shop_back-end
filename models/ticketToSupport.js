const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketToSupportSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: [String],
        required: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed', 'on_hold'],
        default: 'open'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketToSupportSchema);