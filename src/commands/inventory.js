const utility = require('../utility.js')
const Item = require('../models/item.js')
const inv = ['your inventory has:\n']

module.exports = {
  name: 'inventory',
  description: 'displays the money and items in the user\'s inventory',
  aliases: ['i', 'inv'],
  cooldown: 5,
  execute (client, user, message, args) {
    user.inventory.forEach(async inventorySpace => {
      const item = await Item.findOne({ _id: inventorySpace.item }).catch(err => console.log(err))
      inv.push(`${utility.getEmojiId(item.icon, client)}\`${inventorySpace.qty}\``)

      if (user.inventory.indexOf(inventorySpace) === user.inventory.length - 1) {
        message.reply(inv.join(' '))
      }
    })
  }
}
