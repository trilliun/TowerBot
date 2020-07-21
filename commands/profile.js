const Discord = require('discord.js');
const Canvas = require('canvas');
const utility = require('../utility.js');
const Image = require('../models/image.js');
const { registerFont, createCanvas } = require('canvas');
registerFont('./resources/VeniceClassic.ttf', { family: 'VeniceClassic' });
registerFont('./resources/ST01R.ttf', { family: 'ST01R' });

module.exports = {
    name: 'profile',
    description: 'gets a user\'s profile',
    async execute(client, user, message, args) {

        //start by creating the canvas
        const canvas = Canvas.createCanvas(250, 300);
        const context = canvas.getContext('2d');

        //get character profile background iamge
        let bgImg = await Image.findOne({ _id: user.profileBackground });
        if (bgImg == null || bgImg == undefined) {
            //use some default img
        } else {
            const bg = await Canvas.loadImage(bgImg.uri.toString());
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);

            //add a transparent overlay so the character can be seen better
            context.fillStyle = "rgba(0,0,0, 0.6)";
            context.fillRect(0, 0, canvas.width, canvas.height);

            //add a border
            context.strokeStyle = '#c09141';
            context.lineWidth = 4;
            context.strokeRect(0, 0, canvas.width, canvas.height);
        }

        //draw character art
        const characterBase = await Canvas.loadImage('https://i.imgur.com/1nam7wa.png');
        context.drawImage(characterBase, 0, 0, canvas.width, canvas.height);
        //apply hair
        const hair = await Canvas.loadImage('https://i.imgur.com/Z1br4sg.png');
        context.drawImage(hair, 0, 0, canvas.width, canvas.height);
        //apply avatar equipment
        const outfit = await Canvas.loadImage('https://i.imgur.com/6Nq3RF3.png');
        context.drawImage(outfit, 0, 0, canvas.width, canvas.height);

        //add UI elements
        const equipmentSlots = await Canvas.loadImage('https://i.imgur.com/xHt9PlG.png');
        context.drawImage(equipmentSlots, 0, 0, canvas.width, canvas.height);

        //add name and info
        context.fillStyle = "#1f2235";
        context.fillRect(5, 10, canvas.width - 10, 40);
        context.font = '24pt VeniceClassic';
        context.fillStyle = "#c09141";
        context.fillText(message.author.username, 20, 40, canvas.width - 75);

        //create
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png');

        message.channel.send(attachment);
    }
};