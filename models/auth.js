const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    city: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    zipCode: {
        type: String,
        required: false,
        trim: true,
    },
    birthDate: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'New User!'
    },

}, {
    timestamps: true
});



module.exports = mongoose.model('User', userSchema);