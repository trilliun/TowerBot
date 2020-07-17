//declare using statements and variables
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require('mongoose');
const config = require("./config.json");

const client = new Discord.Client();
client.config = config;

//load up listeners and events
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

//load up commands
client.commands = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
  });
});
console.log(`Loaded commands`);

//connect to database
mongoose
  .connect(config.mongoUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));  

//log in
client.login(config.token);