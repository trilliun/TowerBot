const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: String,
    currency: Number,
    inventory: [{
        item: mongoose.Types.ObjectId,
        quantity: Number
    }]
});

module.exports = mongoose.model('User', userSchema);