const config = require('../../config.json')
const User = require('../../models/user.js')
const PlayerLevel = require('../../models/playerLevel.js')
const Discord = require('discord.js')
const cooldowns = new Discord.Collection()
let user = null

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) return

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.toLowerCase().indexOf(client.config.prefix) !== 0) return

  // Our standard argument/command name definition.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g)
  const commandName = args.shift().toLowerCase()

  // Grab the command data from the client.commands Enmap
  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  // If that command doesn't exist, silently exit and do nothing
  if (!command) return

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  // check for cooldown
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
    }
  }

  try {
    if (user == null || user === undefined) {
      // find or create user profile
      let userResult = await User.findOne({ discordId: message.author.id }).catch(err => console.log(err))
      if (userResult == null || userResult === undefined) {
        const levelInfo = await PlayerLevel.findOne({ level: { $eq: '1' } }).catch(err => console.log(err))
        userResult = await User.create({
          discordId: message.author.id,
          inventory: [],
          stats: {
            hp: levelInfo.hp,
            energy: levelInfo.energy,
            stamina: levelInfo.stamina,
            armor: levelInfo.armor
          }
        }).catch(err => console.log(err))
      }
      user = await userResult
    }

    console.log(`running command =${command.name}= for =${message.author.username}=`)
    command.execute(client, user, message, args)
  } catch (error) {
    console.error(error)
    message.reply('there was an error trying to execute your command!')
  }
}
