const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    imageUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);