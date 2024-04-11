const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const questionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Question', questionSchema);