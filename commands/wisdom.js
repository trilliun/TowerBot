const Discord = require('discord.js');
const mongoose = require('mongoose');
const config = require('../config.json');
const Canvas = require('canvas');
const { registerFont, createCanvas } = require('canvas');
registerFont('HelloMornin.otf', { family: 'HelloMornin' });
registerFont('Bebas-Regular.otf', {family: 'Bebas'});

mongoose.connect(config.mongoUri, { useNewUrlParser: true }, err => {
  if (err) console.error(err);
  console.log(mongoose);
});
const Wisdom = require('../models/wisdom.js');
const Image = require('../models/image.js');

const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
  var words = text.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

module.exports = {
  name: 'wisdom',
  description: 'generates a random bit of wisdom for the user',
  execute(client, message, args) {

    //get one random wisdom
    Wisdom.aggregate([
      {
        '$sample': {
          'size': 1
        }
      },
    ]).exec((err, wisdomResult) => {
      if (err) {
        console.error(err);
        return message.reply('Sorry, an error has occurred!');
      }

      var wisdom = wisdomResult[0];

      //get one random image
      Image.aggregate([
        {
          '$match': {
            'tags': {
              '$eq': 'peaceful'
            }
          }
        }, {
          '$sample': {
            'size': 1
          }
        }
      ]).exec(async (err, imgResult) => {
        if (err) {
          console.error(err);
          return message.reply('Sorry, an error loading the image has occurred!');
        }

        var bg = imgResult[0];

        //begin creating motivational image
        let canvasHeight = Number(wisdom.quote.length) * 5;
        const canvas = Canvas.createCanvas(700, canvasHeight);
        const context = canvas.getContext('2d');
        const img = await Canvas.loadImage(bg.data); //use the image retrieved earlier        

        // get the scale
        var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        // get the top left position of the image
        var x = (canvas.width / 2) - (img.width / 2) * scale;
        var y = (canvas.height / 2) - (img.height / 2) * scale;
        context.drawImage(img, x, y, img.width * scale, img.height * scale);

        context.fillStyle = "rgba(0,0,0, 0.6)"; //add transparent overlay
        context.fillRect(0, 0, canvas.width, canvas.height);

        //add a border
        context.strokeStyle = '#777';  
        context.lineWidth = 10;
        context.strokeRect(0, 0, canvas.width, canvas.height);

        //determine font metrics
        var maxWidth = 500;
        var lineHeight = 32 * 1.5;
        var x = (canvas.width - maxWidth) / 2;
        var y = 60;
        context.font = '32pt Bebas';
        context.fillStyle = '#FFF';
        wrapText(context, `"${wisdom.quote}"`, x, y, maxWidth, lineHeight);
        
        //add a line giving credit to author
        context.font = '26pt HelloMornin';
        context.fillStyle = '#DDD';
        context.fillText(`-${wisdom.author}`, canvas.width / 1.5, canvas.height - 45);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'wisdom.png');

        //get message target
        if (message.mentions.users.size > 0) {
          var target = message.mentions.users.first();
        } else {
          var target = message.author;
        }
        message.channel.send(`LISTEN ${target}`, attachment);
      });
    });
  }
};