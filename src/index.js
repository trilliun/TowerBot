// declare using statements and variables
const Discord = require('discord.js')
const fs = require('fs')
const mongoose = require('mongoose')
const winston = require('winston')
const config = require('./../config.json')

const client = new Discord.Client()
client.config = config
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log' })
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
})

// load up listeners and events
fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err)
  files.forEach(file => {
    const event = require(`./events/${file}`)
    const eventName = file.split('.')[0]
    client.on(eventName, event.bind(null, client))
  })
})

// load up commands
client.commands = new Discord.Collection()
fs.readdir('./commands/', (err, files) => {
  if (err) return console.error(err)
  files.forEach(file => {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
  })
})
console.log('Loaded commands')

// connect to database
mongoose
  .connect(config.mongoUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'))

// begin collecting logs
client.on('ready', () => logger.log('info', 'The bot is online!'))
client.on('debug', m => logger.log('debug', m))
client.on('warn', m => logger.log('warn', m))
client.on('error', m => logger.log('error', m))

process.on('uncaughtException', error => logger.log('error', error))

// log in
client.login(config.token)
