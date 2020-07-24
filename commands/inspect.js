const config = require('../config.json')
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
      const inspectableItems = []
      query.map(i => {
        if (i.rarity === 'common' || i.rarity === 'uncommon' || user.inventory.includes(i.id)) { inspectableItems.push(i) }
      })

      if (inspectableItems.length === 1) {
        sendItemDetails(inspectableItems[0], message, client)
      } else {
        const filterArray = []
        const items = inspectableItems.map(i => {
          const index = inspectableItems.indexOf(i)
          filterArray.push(index)
          return `**${index}** \`${i.name}\``
        })

        await message.channel.send(`Several items matched your query. Did you mean one of these?\n${items.join('\n')}`)
          .then(() => {
            const itemInspectFilter = m => filterArray.includes(Number(m.content))
            message.channel.awaitMessages(itemInspectFilter, { max: 1, time: 30000, errors: ['time'] })
              .then(collected => {
                const selectedItemIndex = Number(collected.first().content)
                const selectedItem = inspectableItems[selectedItemIndex]
                sendItemDetails(selectedItem, message, client)
              })
          })
      }
    } else {
      let reply = 'You didn\'t provide any arguments.'

      if (this.usage) {
        reply += `\nThe proper usage would be: \`${config.prefix} ${this.name} ${this.usage}\``
      }

      return message.reply(reply)
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
