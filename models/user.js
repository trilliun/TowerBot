const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: String,
    currency: {type: Number, default: 0},
    level: {type: Number, default: 1},
    femaleCharacter: {type: Boolean, default: true},
    appearanceType: {type: Number, default:0},
    profileBackground: { type: mongoose.Types.ObjectId, default: mongoose.Types.ObjectId('5f139709d543d0264484eb78')},
    profilePicture: { type: mongoose.Types.ObjectId, default: mongoose.Types.ObjectId('5f13b538d543d0264484eb91')},
    inventory: [{
        item: mongoose.Types.ObjectId,
        quantity: Number
    }],
    equipment: [{
        item: mongoose.Types.ObjectId,
        quantity: Number
    }],
    stats: {
        hp: Number,
        energy: Number,
        stamina: Number,
        armor: { type: Number, default: 0 },
        exp: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('User', userSchema);