const mongoose = require('mongoose');

const playerLevelSchema = mongoose.Schema({
    level: Number,
    expToNextLvl: Number,
    maxEncounterExp: Number,
    hp: Number,
    energy: Number,
    stamina: Number,
    proficiencyModifier: Number
});

module.exports = mongoose.model('PlayerLevel', playerLevelSchema);