const Discord = require('discord.js');
const Item = require('../models/item.js');
const utility = require('../utility.js');
const config = require('../config.json');
const paginationEmbed = require('discord.js-pagination');

const createEmbed = (message) => {
    const description = `Use command \`${config.prefix} buy [quantity] <item-name (or shortcode)>\` to purchase an item from the shop.\n${'༞'.padEnd(35, '༞')}`;
    const color = '#DA70D6';

    return new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(`${message.guild.name} Shop`, message.guild.iconURL())
        .setDescription(description);
}

module.exports = {
    name: 'shop',
    description: 'displays a list of items available in the club shop',
    async execute(client, message, args) {
        const pages = [];

        //get items from database
        Item.find().exec(async (err, itemsQuery) => {
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

            //begin constructing pages
            //for each category
            itemGroups.forEach((itemGroup, category, map) => {
                //create embed
                let embed = createEmbed(message);

                var cat = category.toUpperCase();
                let itemStr = [];

                //for each item in the category
                itemGroup.forEach(groupItem => {
                    var itemIcon = utility.getEmoji(groupItem.icon, client);
                    var currencyIcon = utility.getEmoji('tbbabelgold', client);
                    if (groupItem.description) {
                        var desc = groupItem.description;
                    } else {
                        var desc = 'no description';
                    }

                    itemStr.push(`${itemIcon} \`${groupItem.name.padEnd(15, ' ')}\` ${currencyIcon} **${groupItem.cost}**\n*${desc}*\n`);

                    if (itemStr.length == 5 || itemGroup.indexOf(groupItem) + 1 == itemGroup.length) {
                        if (itemGroup.indexOf(groupItem) > 5) {
                            embed.addField(cat += ' CONTD.', itemStr, true);
                        } else {
                            embed.addField(cat, itemStr, true);
                        }
                        itemStr = [];
                    } //limit items to 10 max per page
                    if (itemGroup.indexOf(groupItem) + 1 == 10) {
                        embed = createEmbed();
                    }
                });
                pages.push(embed);
            });

            pages.forEach(page => {
                page.setFooter(`${pages.indexOf(page) + 1}/${pages.length} pages`);
            });

            let pIndex = 0;
            if (args.length != 0) {
                //ensure arg is a number within range
                if (Number(args[0]) >= 0 && Number(args[0]) <= pages.length) {
                    pIndex = Number(args[0]) - 1;
                }
            }

            paginationEmbed(message, pages);           
        });
    }
}