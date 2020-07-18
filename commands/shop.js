const Discord = require('discord.js');
const Item = require('../models/item.js');
const utility = require('../utility.js');

module.exports = {
    name: 'shop',
    description: 'displays a list of items available in the club shop',
    async execute(client, message, args) {

        //create embed
        const shopEmbed = new Discord.MessageEmbed();
        shopEmbed
            .setColor('#DA70D6')
            .setAuthor(`${message.guild.name} Shop`, message.guild.iconURL());

        //get items from database
        Item.find().exec((err, itemsQuery) => {
            let itemGroups = new Map();

            itemsQuery.forEach(i => {
                var item = i.toObject();

                if (itemGroups.has(item.category)) {
                    let group = itemGroups.get(item.category);
                    group.push(item);
                } else {
                    itemGroups.set(item.category, [item]);
                }
            });

            itemGroups.forEach((value, key, map) => {
                let cat = key.toUpperCase();
                let catItemStr = [];
                value.forEach(catItem => {
                    var itemIcon = utility.getEmoji(catItem.icon, client);
                    var currencyIcon = utility.getEmoji('tbbabelgold', client);
                    if (catItem.description) {
                        var desc = catItem.description;
                    } else {
                        var desc = 'no description';
                    }
                    catItemStr.push(`\n${itemIcon} \`${catItem.name.padEnd(15, ' ')}\` ${currencyIcon} **${catItem.cost}**\n*${desc}*\n`)
                });
                shopEmbed.addField(cat, catItemStr.join(''), true);
            });

            message.channel.send(shopEmbed);
        });
    }
}