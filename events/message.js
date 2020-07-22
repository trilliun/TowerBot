const utility = require('../utility.js');
const User = require('../models/user.js');
const PlayerLevel = require('../models/playerLevel.js');
let user = null;

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) return;

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.toLowerCase().indexOf(client.config.prefix) !== 0) return;

  // Our standard argument/command name definition.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // If that command doesn't exist, silently exit and do nothing
  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }
  try {
    if (user == null || user == undefined) {
      //find or create user profile
      let userResult = await User.findOne({ 'discordId': message.author.id }).catch(err => console.log(err));
      if (userResult == null || userResult == undefined) {
        let levelInfo = await PlayerLevel.findOne({ level: { $eq: '1' } }).catch(err => console.log(err));
        userResult = await User.create({
          discordId: message.author.id,
          inventory: [],
          stats: {
            hp: levelInfo.hp,
            energy: levelInfo.energy,
            stamina: levelInfo.stamina
          }
        }).catch(err => console.log(err));
      }
      user = await userResult;
    }

    console.log(`running command =${command.name}= for =${message.author.username}=`);
    command.execute(client, user, message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute your command!');
  }
};