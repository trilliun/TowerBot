const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    discordId: String,
    currency: { type: Number, default: 0 },
    avatar:
    {
        gender: { type: Number, default: 1 },
        backgroundImg: { type: mongoose.Types.ObjectId, ref: 'Image', default: mongoose.Types.ObjectId('5f139709d543d0264484eb78') },
        avatarBase: { type: mongoose.Types.ObjectId, ref: 'CharacterComponent', default: mongoose.Types.ObjectId('5f175aa4430a7253ec1d088d')},
        underwear: { type: mongoose.Types.ObjectId, ref: 'CharacterComponent', default: mongoose.Types.ObjectId('5f175f02430a7253ec1d088f')},
        hair: { type: mongoose.Types.ObjectId, ref: 'CharacterComponent', default: mongoose.Types.ObjectId('5f17605c430a7253ec1d0890')},
        eyes: { type: mongoose.Types.ObjectId, ref: 'CharacterComponent', default: null }
    }, 
    inventory: [{
        item: { type: mongoose.Types.ObjectId, ref: 'Item' },
        quantity: Number
    }],
    equipment: { 
        head: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        body: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        hands: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        mainHand: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        special: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        accessory: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        feet: { type: mongoose.Types.ObjectId, ref: 'Item', default: null },
        offHand: { type: mongoose.Types.ObjectId, ref: 'Item', default: null }
    },
    stats: {
        level: { type: Number, default: 1 },
        hp: Number,
        energy: Number,
        stamina: Number,
        armor: { type: Number, default: 0 },
        exp: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('User', userSchema);