const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: String,
    description: String,
    cost: Number,
    icon: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('Item', itemSchema);