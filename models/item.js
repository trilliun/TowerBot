const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: String,
    description: String,
    details: String,
    cost: Number,
    category: String,
    rarity: String,
    icon: String,
    roll: {
        dieCount: Number,
        dieType: String,
        modifier: Number
    }
});

module.exports = mongoose.model('Item', itemSchema);