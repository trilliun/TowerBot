const mongoose = require('mongoose');

const guildDataSchema = mongoose.Schema({
    currencyId: String
});

module.exports = mongoose.model('GuildData', guildDataSchema);