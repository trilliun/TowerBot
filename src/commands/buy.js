const config = require('../config.json')
const Item = require('../models/item.js')
const utility = require('../utility.js')

module.exports = {
  name: 'buy',
  description: 'Purchase an item from the shop.',
  aliases: ['b', 'purchase'],
  usage: '[item name]',
  cooldown: 5,
  async execute (client, user, message, args) {
    if (args && args.length > 0) {
      const query = await Item.find({
        $and: [
          {
            $or: [
              {
                rarity: 'common'
              }, {
                rarity: 'uncommon'
              }
            ]
          }, {
            name: {
              $regex: args.join(' ')
            }
          }
        ]
      })
        .catch(err => console.log(err))

      if (query.length === 1) {
        await handleItemPurchase(user, query, message, client)
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
              .then(async collected => {
                const selectedItemIndex = Number(collected.first().content)
                const selectedItem = query[selectedItemIndex]
                await handleItemPurchase(user, selectedItem, message, client)
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

async function handleItemPurchase (user, selectedItem, message, client) {
  if (user.currency >= selectedItem.cost) {
    const chosenItemId = selectedItem._id.toString()
    let itemExistsInInventory = false

    user.inventory.map(i => {
      if (i.item._id.toString() === chosenItemId) {
        i.qty += 1
        itemExistsInInventory = true
      }
    })

    if (!itemExistsInInventory) {
      user.inventory.push({ item: selectedItem, qty: 1 })
    }

    user.currency -= selectedItem.cost
    await user.save()
    message.reply(`A \`${selectedItem.name}\` has been placed in your inventory.\nYour new balance is ${utility.getCurrencyString(user.currency, client)}.`)
  } else {
    message.reply('You don\'t have enough money to afford this!')
  }
}
