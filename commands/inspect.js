const Discord = require('Discord.js')
const Item = require('../models/item.js')
const utility = require('../utility.js')

module.exports = {
  name: 'inspect',
  description: 'displays the details and effects of an item',
  aliases: ['i'],
  usage: ['item'],
  cooldown: 5,
  async execute (client, user, message, args) {
    if (args && args.length > 0) {
      const query = await Item.find({ name: { $regex: args.join(' ') } }).catch(err => console.log(err))

      if (query.length === 1) {
        sendItemDetails(query[0], message, client)
      } else {
        const filterArray = []
        const items = query.map(i => {
          const index = query.indexOf(i)
          filterArray.push(index)
          return `**${index}** \`${i.name}\``
        })

        await message.channel.send(`Several items matched your query. Did you mean one of these?\n${items.join('\n')}`)
          .then(() => {
            const itemInspectFilter = m => filterArray.includes(Number(m.content))
            message.channel.awaitMessages(itemInspectFilter, { max: 1, time: 30000, errors: ['time'] })
              .then(collected => {
                const selectedItemIndex = Number(collected.first().content)
                const selectedItem = query[selectedItemIndex]
                sendItemDetails(selectedItem, message, client)
              })
          })
      }
    }
  }
}

async function sendItemDetails (item, message, client) {
  const embed = new Discord.MessageEmbed()
  const emojiId = utility.getEmojiId(item.icon, client)
  const emojiUri = utility.getEmojiUri(emojiId.id)

  embed
    .setColor('#DA70D6')
    .setThumbnail(emojiUri)
    .setTitle(item.name)
    .setDescription(`*${item.details}*`)
    .addFields([
      { name: 'Use', value: item.description, inline: true },
      { name: 'Value', value: utility.getCurrencyString(item.cost, client), inline: true },
      { name: 'Rarity', value: item.rarity.toUpperCase(), inline: true },
      { name: 'Category', value: item.category.toUpperCase(), inline: true }
    ])
  message.channel.send({ embed })
}
