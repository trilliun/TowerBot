const Discord = require('discord.js');
const Item = require('../models/item.js');
const User = require('../models/user.js');
const utility = require('../utility.js');
const config = require('../config.json');
const paginationEmbed = require('discord.js-pagination');

const createEmbed = (message) => {
    const color = '#DA70D6';

    return new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(`${message.guild.name} Shop`, message.guild.iconURL());
}

module.exports = {
    name: 'shop',
    description: 'displays a list of items available in the general shop',
    async execute(client, message, args) {
        const pages = [];
        const user = await User.findOne({'userId': message.author.id});
        if (user == null || user == undefined || user.currency == 0) {
            var spend = '**no money**';
        } else {
            var spend = utility.getCurrencyString(user.currency, client);
        }
        
        var shopDescription = `Use command \`${config.prefix} buy [quantity] <item-name>\` to purchase an item from the shop.\nYou currently has ${spend} to spend.\n${'༞'.padEnd(35, '༞')}`;

        //get common items from database
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
                embed.setDescription(shopDescription);

                var cat = category.toUpperCase();
                let itemStr = [];

                //for each item in the category
                itemGroup.forEach(groupItem => {
                    var itemIcon = utility.getEmoji(groupItem.icon, client);
                    let currencyString = utility.getCurrencyString(groupItem.cost, client);
                    if (groupItem.description) {
                        var desc = groupItem.description;
                    } else {
                        var desc = 'no description';
                    }

                    itemStr.push(`${itemIcon} \`${groupItem.name.padEnd(15, ' ')}\` ${currencyString}\n*${desc}*\n`);

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

            if (pages.length > 1) {
                paginationEmbed(message, pages);           
            } else {
                message.channel.send(pages[0]);
            }
        });
    }
}