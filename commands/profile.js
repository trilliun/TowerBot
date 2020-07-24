const Discord = require('discord.js')
const Canvas = require('canvas')
const utility = require('../utility.js')
const Image = require('../models/image.js')
const config = require('../config.json')
const CharacterComponent = require('../models/characterComponent.js')
const PlayerLevel = require('../models/playerLevel.js')
const { registerFont } = require('canvas')
registerFont('./resources/VeniceClassic.ttf', { family: 'VeniceClassic' })
registerFont('./resources/ST01R.ttf', { family: 'ST01R' })

module.exports = {
  name: 'profile',
  aliases: ['p', 'pf', 'avatar', 'char', 'character'],
  description: 'retrieve or edit a user\'s profile',
  usage: '[optional: set gender|skin|background]',
  cooldown: 10,
  async execute (client, user, message, args) {
    if (args && args[0] === 'set') {
      switch (args[1]) {
        case null:
        case undefined:
          message.reply(`Command format is as follows: \`${config.prefix} profile set [gender|skin|background]\`.`)
          break
        case 'gender':
          handleGenderChangePrompt(message, user)
          break
        case 'skin':
          handleSkintoneChangePrompt(message, user)
          break
        case 'background':
          handleBackgroundChangePrompt(message, user)
          break
        default:
          message.reply('Invalid argument, cancelling command.')
      }
      return
    };

    // start by creating the canvas
    const levelInfo = await PlayerLevel.find({ level: user.stats.level }).catch(err => console.log(err))
    const canvas = await drawProfileCanvas(user, message, levelInfo[0])

    // create
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')

    message.channel.send(attachment)
  }
}

async function drawProfileCanvas (user, message, levelInfo) {
  const canvas = Canvas.createCanvas(250, 300)
  const context = canvas.getContext('2d')

  // get character profile background iamge
  const bgImg = await Image.findOne({ _id: user.avatar.backgroundImg })
  const bg = await Canvas.loadImage(bgImg.uri.toString())
  context.drawImage(bg, 0, 0, canvas.width, canvas.height)

  // add a transparent overlay so the character can be seen better
  context.fillStyle = 'rgba(0,0,0, 0.6)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // add a border
  context.strokeStyle = '#c09141'
  context.lineWidth = 4
  context.strokeRect(0, 0, canvas.width, canvas.height)

  // draw character art
  const characterBaseUri = await utility.getAvatarComponentUri(user.avatar.avatarBase, user.avatar.gender)
  var characterBaseImg = await Canvas.loadImage(characterBaseUri)
  context.drawImage(characterBaseImg, 0, 0, canvas.width, canvas.height)

  // apply hair
  const hairImgUri = await utility.getAvatarComponentUri(user.avatar.hair, user.avatar.gender)
  var hairImg = await Canvas.loadImage(hairImgUri)
  context.drawImage(hairImg, 0, 0, canvas.width, canvas.height)

  // apply undergarments
  const underwearImgUri = await utility.getAvatarComponentUri(user.avatar.underwear, user.avatar.gender)
  var underwearImg = await Canvas.loadImage(underwearImgUri)
  context.drawImage(underwearImg, 0, 0, canvas.width, canvas.height)

  // add UI elements
  const equipmentSlots = await Canvas.loadImage('https://i.imgur.com/xHt9PlG.png')
  context.drawImage(equipmentSlots, 0, 0, canvas.width, canvas.height)

  // add name
  context.fillStyle = '#1f2235'
  context.fillRect(5, 10, canvas.width - 10, 40)
  context.font = '24pt VeniceClassic'
  context.fillStyle = '#c09141'
  context.fillText(message.author.username, 20, 40, canvas.width - 75)

  // stats
  context.fillStyle = '#403e3d'
  context.lineWidth = 1
  context.fillRect(130, 235, 100, 10)
  context.fillRect(130, 255, 100, 10)
  context.fillRect(130, 275, 100, 10)
  context.fillStyle = '#ff3030' // health
  context.fillRect(130, 235, Math.floor((user.stats.hp / levelInfo.hp) * 100), 10)
  context.fillStyle = '#66fb11' // stamina
  context.fillRect(130, 255, Math.floor((user.stats.stamina / levelInfo.stamina) * 100), 10)
  context.fillStyle = '#ff1187' // exp
  context.fillRect(130, 275, Math.floor((user.stats.exp / levelInfo.expToNextLvl) * 100), 10)
  context.fillStyle = 'rgba(0,0,0, 0.75)'
  context.font = '8pt ST01R'
  context.fillText(`${user.stats.hp}/${levelInfo.hp}`, 135, 244, 95)
  context.fillText(`${user.stats.stamina}/${levelInfo.stamina}`, 135, 264, 95)
  context.fillText(`${user.stats.exp}/${levelInfo.expToNextLvl}`, 135, 284, 95)
  context.fillStyle = '#FFF'
  context.font = '10pt ST01R'
  context.fillText(`LVL ${user.stats.level}`, 190, 38)
  context.fillText(`ATK: ${user.stats.atk}`, 20, 245)
  context.fillText(`DEF: ${user.stats.armor}`, 20, 265)
  context.fillText(`LUCK: ${user.stats.luck}`, 20, 285)

  return canvas
}

function handleGenderChangePrompt (message, user) {
  const genderConfirmationFilter = m => ['y', 'n', 'no', 'yes'].includes(m.content.toLowerCase())
  message.channel.send('Are you sure you want to change genders? **[y/n]**').then(() => {
    message.channel.awaitMessages(genderConfirmationFilter, { max: 1, time: 30000, errors: ['time'] })
      .then(async collected => {
        switch (collected.first().content.toLowerCase()) {
          case 'y':
          case 'yes':
            user.avatar.gender = user.avatar.gender === 0 ? 1 : 0
            await user.save(err => console.log(err))
            message.reply('Profile change saved.')
            return
          case 'n':
          case 'no':
          default:
            message.reply('Cancelling command.')
        }
      })
  })
}

function handleSkintoneChangePrompt (message, user) {
  CharacterComponent.find({ component: { $eq: 'base' } }).exec((err, options) => {
    if (err) { console.log(err) }
    const str = []
    const filterArray = []
    options.forEach(option => {
      const currentIndex = options.indexOf(option)
      filterArray.push(currentIndex)
      str.push(`**${currentIndex}** \`${option.description}\``)
    })
    const skinToneChoiceFilter = m => filterArray.includes(Number(m.content))
    message.channel.send('Below are the options available. Please select the number for the option you\'d prefer.\n' + str.join('\n')).then(() => {
      message.channel.awaitMessages(skinToneChoiceFilter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
          const index = Number(collected.first().content)
          if (index === undefined || index == null || index >= options.length) {
            message.reply('Invalid choice. Cancelling command.')
          } else {
            user.avatar.avatarBase = options[index].id
            await user.save(err => console.log(err))
            message.reply('Profile change saved.')
          }
        })
    })
  })
}

function handleBackgroundChangePrompt (message, user) {
  Image.find({ tags: { $eq: 'backgrounds' } }).exec((err, backgrounds) => {
    if (err) { console.log(err) }
    const str = []
    const filterArray = []
    backgrounds.forEach(option => {
      const currentIndex = backgrounds.indexOf(option)
      filterArray.push(currentIndex)
      str.push(`**${currentIndex}** \`${option.description}\``)
    })
    const backgroundChoiceFilter = m => filterArray.includes(Number(m.content))
    message.channel.send('Below are the options available. Please select the number for the option you\'d prefer.\n' + str.join('\n')).then(() => {
      message.channel.awaitMessages(backgroundChoiceFilter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
          const index = Number(collected.first().content)
          if (index === undefined || index == null || index >= backgrounds.length) {
            message.reply('Invalid choice. Cancelling command.')
          } else {
            user.avatar.backgroundImg = backgrounds[index].id
            await user.save(err => console.log(err))
            message.reply('Profile change saved.')
          }
        })
    })
  })
}
