const mongoose = require('mongoose');

const creatureSchema = mongoose.Schema({
    name: String,
    hp: {
        dieCount: Number,
        dieSides: Number,
        modifier: Number
    },
    armor: Number,
    exp: Number,
    dmg: [{
        description: String,
        dieCount: Number,
        dieSides: Number,
        modifier: Number
    }],
    staminaCost: Number
});

module.exports = mongoose.model('Creature', creatureSchema);