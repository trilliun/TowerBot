const Item = require('../models/item.js')
const utility = require('../utility.js')
const PlayerLevel = require('../models/playerLevel.js')

module.exports = {
  name: 'use',
  description: 'Uses an item in the player\'s inventory',
  aliases: ['u'],
  usage: '[item name]',
  cooldown: 5,
  async execute (client, user, message, args) {
    if (!args || args[0] === undefined) {
      message.reply('What item would you like to use?')
      return
    }

    const itemMatches = []
    user.inventory.forEach(async inventorySpace => {
      const item = await Item.findOne({ _id: inventorySpace.item }).catch(err => console.log(err))
      if (item.name.includes(args.join(' '))) {
        itemMatches.push(item)
      }

      if (user.inventory.indexOf(inventorySpace) === user.inventory.length - 1) {
        if (itemMatches.length > 1) {
          const filterArray = []
          const itemChoices = itemMatches.map(i => {
            const index = itemMatches.indexOf(i)
            filterArray.push(index)
            return `**${index}** \`${i.name}\``
          })

          await message.channel.send(`Several items matched your query. Did you mean one of these?\n${itemChoices.join('\n')}`)
            .then(() => {
              const itemToUseFilter = m => filterArray.includes(Number(m.content))
              message.channel.awaitMessages(itemToUseFilter, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                  const selectedItemIndex = Number(collected.first().content)
                  const selectedItem = itemMatches[selectedItemIndex]
                  useItem(selectedItem, user, message, client)
                })
            })
        } else if (itemMatches.length === 1) {
          await useItem(itemMatches[0], user, message, client)
        } else {
          message.reply('That item doesn\'t exist in your inventory!')
        }
      }
    })
  }
}

async function useItem (item, user, message, client) {
  const levelInfo = await PlayerLevel.find({ level: user.stats.level }).catch(err => console.log(err))
  let n = 0
  for (let index = 0; index < item.roll.dieCount; index++) {
    n += utility.getRandomInt(item.roll.dieSides) + 1
  }
  n += item.roll.modifier

  switch (item.statAffected) {
    case 'health':
      user.stats.hp += n
      break
    case 'stamina':
      user.stats.stamina += n
      break
  }

  user.inventory.forEach(i => {
    if (i.item._id.toString() === item._id.toString()) {
      i.qty -= 1
      if (i.qty === 0) { user.inventory.pop(i) }
    }
  })

  const response = []
  response.push(`The \`${item.name}\` increased your ${item.statAffected} by **${n}** points.`)
  response.push('It has now been removed from your inventory.')
  response.push(`**Current Stats:**\n ${utility.getEmojiId('tbhealth', client)} \`${user.stats.hp} / ${levelInfo.hp}\` ${utility.getEmojiId('tbstamina', client)} \`${user.stats.stamina} / ${levelInfo.stamina}\` ${utility.getEmojiId('tbexp', client)} \`${user.stats.exp} / ${levelInfo.expToNextLvl}\``)
  await user.save()
  message.reply(response.join('\n'))
}
