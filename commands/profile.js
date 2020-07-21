const Discord = require('discord.js');
const Canvas = require('canvas');
const utility = require('../utility.js');
const Image = require('../models/image.js');
const CharacterComponent = require('../models/characterComponent.js');
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
        let bgImg = await Image.findOne({ _id: user.avatar.backgroundImg });
        const bg = await Canvas.loadImage(bgImg.uri.toString());
        context.drawImage(bg, 0, 0, canvas.width, canvas.height);

        //add a transparent overlay so the character can be seen better
        context.fillStyle = "rgba(0,0,0, 0.6)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        //add a border
        context.strokeStyle = '#c09141';
        context.lineWidth = 4;
        context.strokeRect(0, 0, canvas.width, canvas.height);

        //draw character art
        let characterBaseUri = await utility.getAvatarComponentUri(user.avatar.avatarBase, user.avatar.gender);
        var characterBaseImg = await Canvas.loadImage(characterBaseUri);      
        context.drawImage(characterBaseImg, 0, 0, canvas.width, canvas.height);

        //apply hair
        let hairImgUri = await utility.getAvatarComponentUri(user.avatar.hair, user.avatar.gender);
        var hairImg = await Canvas.loadImage(hairImgUri);      
        context.drawImage(hairImg, 0, 0, canvas.width, canvas.height);

        //apply undergarments
        let underwearImgUri = await utility.getAvatarComponentUri(user.avatar.underwear, user.avatar.gender);
        var underwearImg = await Canvas.loadImage(underwearImgUri);      
        context.drawImage(underwearImg, 0, 0, canvas.width, canvas.height);

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