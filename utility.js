const User = require('./models/user.js');
const PlayerLevel = require('./models/playerLevel.js');

module.exports = {
    getEmoji(id, client) {
        return client.emojis.cache.find(emoji => emoji.name === id);
    },

    async findOrCreateUserByDiscordId(id) {
        let userResult = await User.findOne({ 'userId': id }).catch(err => console.log(err));
        if (userResult == null || userResult == undefined) {
        let levelInfo = await PlayerLevel.findOne({level: { $eq: '1' }}).catch(err => console.log(err));
        userResult = await User.create({
                userId: id,
                inventory: [],
                equipment: [],
                stats: {
                    hp: levelInfo.hp,
                    energy: levelInfo.energy,
                    stamina: levelInfo.stamina
                }
            }).catch(err => console.log(err));
        }

        return userResult;
    },

    getCurrencyString(cost, client) {
        let amt = Number(cost);
        let remainder = 0;
        let currencyString = [];

        if (amt >= 1000) {
            let platinum = Math.floor(amt / 1000);
            let platCurrencyIcon = client.emojis.cache.find(emoji => emoji.name == 'tbcurrency4');
            currencyString[3] = `**${platinum}** ${platCurrencyIcon}`;
            remainder = amt % 1000;
            amt = remainder;
        }

        if (amt >= 100) {
            let gold = Math.floor(amt / 100);
            let goldCurrencyIcon = client.emojis.cache.find(emoji => emoji.name == 'tbcurrency3');
            currencyString[2] = `**${gold}** ${goldCurrencyIcon}`;
            remainder = amt % 100;
            amt = remainder;
        }

        if (amt >= 10) {
            let silver = Math.floor(amt / 10);
            let silverCurrencyIcon = client.emojis.cache.find(emoji => emoji.name == 'tbcurrency2');
            currencyString[1] = `**${silver}** ${silverCurrencyIcon}`;
            remainder = amt % 10;
            amt = remainder;
        }


        if (amt >= 1) {
            let copperCurrencyIcon = client.emojis.cache.find(emoji => emoji.name == 'tbcurrency1');
            currencyString[0] = `**${amt}** ${copperCurrencyIcon}`;
        }

        return currencyString.join(' ');
    }
}