const CharacterComponent = require('./models/characterComponent.js')

module.exports = {
  getEmojiId (term, client) {
    return client.emojis.cache.find(emoji => emoji.name === term)
  },

  getEmojiUri (id) {
    return `https://cdn.discordapp.com/emojis/${id}.png`
  },

  getCurrencyString (cost, client) {
    let amt = Number(cost)
    let remainder = 0
    const currencyString = []

    if (amt >= 1000) {
      const platinum = Math.floor(amt / 1000)
      const platCurrencyIcon = client.emojis.cache.find(emoji => emoji.name === 'tbcurrency4')
      currencyString[3] = `**${platinum}** ${platCurrencyIcon}`
      remainder = amt % 1000
      amt = remainder
    }

    if (amt >= 100) {
      const gold = Math.floor(amt / 100)
      const goldCurrencyIcon = client.emojis.cache.find(emoji => emoji.name === 'tbcurrency3')
      currencyString[2] = `**${gold}** ${goldCurrencyIcon}`
      remainder = amt % 100
      amt = remainder
    }

    if (amt >= 10) {
      const silver = Math.floor(amt / 10)
      const silverCurrencyIcon = client.emojis.cache.find(emoji => emoji.name === 'tbcurrency2')
      currencyString[1] = `**${silver}** ${silverCurrencyIcon}`
      remainder = amt % 10
      amt = remainder
    }

    if (amt >= 1) {
      const copperCurrencyIcon = client.emojis.cache.find(emoji => emoji.name === 'tbcurrency1')
      currencyString[0] = `**${amt}** ${copperCurrencyIcon}`
    }

    return currencyString.join(' ')
  },

  async getAvatarComponentUri (componentId, gender) {
    const component = await CharacterComponent.findOne({ _id: componentId }).catch(err => console.log(err))
    return component.uri[gender].toString()
  },

  getRandomInt (max) {
    return Math.floor(Math.random() * Math.floor(max))
  }
}
