const Discord = require('Discord.js');
const Item = require('../models/item.js');
const utility = require('../utility.js');

module.exports = {
    name: 'inspect',
    description: 'displays the details and effects of an item',
    aliases: ['i'],
    usage: ['[item]'],
    cooldown: 5,
    async execute(client, user, message, args) {
        if (args && args.length > 0) {
            let query = await Item.find({ 'name': { "$regex": args.join(' '), "$options": "i" } }).catch(err => console.log(err));

            if (query.length == 1) {
                sendItemDetails(query[0], message, client);
            } else {
                let filterArray = [];
                let items = query.map(i => {
                    let index = query.indexOf(i);
                    filterArray.push(index);
                    return `**${index}** \`${i.name}\``;
                });

                await message.channel.send(`Several items matched your query. Did you mean one of these?\n${items.join('\n')}`)
                    .then(() => {
                        const itemInspectFilter = m => filterArray.includes(Number(m.content));
                        message.channel.awaitMessages(itemInspectFilter, { max: 1, time: 30000, errors: ['time'] })
                            .then(collected => {
                                selectedItemIndex = Number(collected.first().content);
                                selectedItem = query[selectedItemIndex];
                                sendItemDetails(selectedItem, message, client);
                            })
                    });
            }
        }
    }
}

async function sendItemDetails(item, message, client) {
    let embed = new Discord.MessageEmbed();
    let emojiId = utility.getEmojiId(item.icon, client);
    let emojiUri = utility.getEmojiUri(emojiId.id);    

    embed
    .setColor('#DA70D6')
    .setThumbnail(emojiUri)
    .setTitle(item.name)
    .setDescription(`\*${item.details}\*`)
    .addFields([
        { name: 'Use', value: item.description, inline: true },
        { name: 'Value', value: utility.getCurrencyString(item.cost, client), inline: true },
        { name: 'Rarity', value: item.rarity.toUpperCase(), inline: true },
        { name: 'Category', value: item.category.toUpperCase(), inline: true },
    ]);
    message.channel.send({embed});
}