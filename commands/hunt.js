const PlayerLevel = require('../models/playerLevel.js');
const Creature = require('../models/creature.js');
const utility = require('../utility.js');

module.exports = {
    name: 'hunt',
    description: 'search for monsters to slay in order to gain exp',
    aliases: ['h'],
    cooldown: 5,
    async execute(client, user, message, args) {
        if (user.stats.stamina == 0) {
            message.reply('You are out of stamina! Try buying a meal from the \`shop\`.')
        } else {
            let message = [];

            let availableStamina = Number(user.stats.stamina);
            let levelInfo = await PlayerLevel.findOne({ 'level': { $eq: 1 } }).catch(err => console.log(err));
            let combatCreature = await Creature.aggregate([
                {
                    '$match': {
                        'exp': {
                            '$lte': levelInfo.maxEncounterExp
                        },
                        'staminaCost': {
                            '$lte': availableStamina
                        }
                    }
                }, {
                    '$sample': {
                        'size': 1
                    }
                }
            ]).catch(err => console.log(err));

            let creatureHp = 0;
            for (let index = 0; index < combatCreature[0].hp.dieCount; index++) {
                let maxInt = combatCreature[0].hp.dieType.split('d')[1];
                let dieRoll = utility.getRandomInt(Number(maxInt) + 1);
                creatureHp += Number(dieRoll);
            }

            message.push(`You found a **${combatCreature[0].name}** with **${creatureHp}** HP!`);
            console.log(message.join('\n'));
        }
    }
}