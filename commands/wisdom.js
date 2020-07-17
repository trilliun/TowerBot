const Discord = require('discord.js');
const mongoose = require('mongoose');
const config = require('../config.json');
const Canvas = require('canvas');
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
      }
    ]).exec((err, wisdomResult) => {
      if (err) {
        console.error(err);
        return message.reply('Sorry, an error has occurred!');
      }

      var wisdom = wisdomResult[0];

      //get one random image
      Image.aggregate([
        {
          '$sample': {
            'size': 1
          }
        }
      ]).exec(async (err, imgResult) => {
        if (err) {
          console.error(err);
          return message.reply('Sorry, an error loading the image has occurred!');
        }

        var img = imgResult[0];

        //begin creating motivational image
        let canvasHeight = Number(wisdom.quote.length) * 5;
        const canvas = Canvas.createCanvas(700, canvasHeight);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage(img.data); //use the image retrieved earlier
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.fillStyle = "rgba(0,0,0, 0.6)"; //add transparent overlay
        context.fillRect(0, 0, canvas.width, canvas.height);

        //determine font metrics
        var maxWidth = 500;
        var lineHeight = 28 * 1.5;
        var x = (canvas.width - maxWidth) / 2;
        var y = 60;
        context.font = 'italic 28pt century gothic';
        context.fillStyle = '#FFF';
        wrapText(context, `"${wisdom.quote}"`, x, y, maxWidth, lineHeight);
        //add a line giving credit to author
        context.fillText(`-${wisdom.author}`, canvas.width / 2, canvas.height - 40);

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