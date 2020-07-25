const Discord = require('discord.js')
const Item = require('../models/item.js')
const utility = require('../utility.js')
const config = require('../config.json')
const paginationEmbed = require('discord.js-pagination')

module.exports = {
  name: 'shop',
  description: 'displays a list of items available in the general shop',
  cooldown: 5,
  usage: ['[page-number | optional]', '[item-category | optional]'],
  async execute (client, user, message, args) {
    const pages = []

    // get user's available money
    if (user.currency === 0) {
      var spend = '**no money**'
    } else {
      var spend = utility.getCurrencyString(user.currency, client)
    }

    var shopDescription = `Use command \`${config.prefix} buy [quantity] <item-name>\`\nto purchase an item from the shop.\n<@${message.author.id}> currently has ${spend} to spend.\n${'༞'.padEnd(35, '༞')}`

    // get common and uncommon items from database
    Item.find({ $or: [{ rarity: 'common' }, { rarity: 'uncommon' }] }).exec(async (err, itemsQuery) => {
      if (err) { console.log(err) }
      const itemGroups = new Map()

      // if user passed a word argument instead of a page number
      if (isNaN(args[0]) && args[0] !== undefined) {
        const requestedCategory = []
        itemsQuery.forEach(i => { if (i.category === args[0]) { requestedCategory.push(i) } }) // assuming category is one word
        if (requestedCategory.length === 0) {
          message.reply('No items matched the category ' + args[0])
          return
        }
        itemGroups.set(requestedCategory[0].category, requestedCategory)
      } else {
        // collect items from all available categories
        itemsQuery.forEach(i => {
          var item = i.toObject()

          if (itemGroups.has(item.category)) {
            const group = itemGroups.get(item.category)
            group.push(item)
          } else {
            itemGroups.set(item.category, [item])
          }
        })
      }

      // begin constructing pages
      // for each category
      itemGroups.forEach((itemGroup, category, map) => {
        // create embed
        let embed = createShopEmbed(message)
        embed.setDescription(shopDescription)

        var cat = category.toUpperCase()
        let itemStr = []

        // for each item in the category
        itemGroup.forEach(groupItem => {
          var itemIcon = utility.getEmojiId(groupItem.icon, client)
          const currencyString = utility.getCurrencyString(groupItem.cost, client)
          if (groupItem.description) {
            var desc = groupItem.description
          } else {
            var desc = 'no description'
          }

          itemStr.push(`${itemIcon} **\`${groupItem.name.padEnd(30, '-')}\`** ${currencyString}\n*${desc}*`)

          if (itemStr.length === 5 || itemGroup.indexOf(groupItem) + 1 === itemGroup.length) {
            if (itemGroup.indexOf(groupItem) > 5) {
              embed.addField(cat += ' CONTD.', itemStr)
            } else {
              embed.addField(cat, itemStr)
            }
            itemStr = []
          } // limit items to 10 max per page
          if (itemGroup.indexOf(groupItem) + 1 === 10) {
            embed = createShopEmbed(message)
          }
        })
        pages.push(embed)
      })

      pages.forEach(page => {
        page.setFooter(`${pages.indexOf(page) + 1}/${pages.length} pages`)
      })

      if (args != null && args.length > 0) {
        // if user requested a specific shop page number
        if (Number(args[0]) !== undefined) { var pageNumber = Number(args[0]) }
      }
      if (pages.length > 1 && pageNumber == null) {
        paginationEmbed(message, pages)
      } else {
        if (pageNumber != null && pageNumber <= pages.length) {
          message.channel.send(pages[pageNumber - 1])
        } else {
          message.channel.send(pages[0])
        }
      }
    })
  }
}

function createShopEmbed (message) {
  return new Discord.MessageEmbed()
    .setColor('#DA70D6')
    .setAuthor(`${message.guild.name} Shop`, message.guild.iconURL())
}
