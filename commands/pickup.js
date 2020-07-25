const Discord = require('discord.js')

module.exports = {
  name: 'pickup',
  aliases: ['pu', 'pul'],
  description: 'generates a random pickup line for a user',
  usage: '[mentioned user | optional]',
  cooldown: 5,
  execute (client, user, message, args) {
    const pickupLines = [
      'Well, here I am. What are your other two wishes?',
      "Hey, my name's Microsoft. Can I crash at your place tonight?",
      'Are you a Tower? Because Eiffel for you.',
      'Do you like raisins? How do you feel about a date?',
      "There is something wrong with my cell phone. It doesn't have your number in it.",
      'If I could rearrange the alphabet, I’d put ‘U’ and ‘I’ together.',
      'Aside from being sexy, what do you do for a living?',
      "Are you from Tennessee? Because you're the only 10 I see!",
      'If you were a Transformer… you’d be Optimus Fine.',
      'Are you a parking ticket? Because you’ve got FINE written all over you.',
      'I wish I were cross-eyed so I could see you twice.',
      'I must be in a museum, because you truly are a work of art.',
      'Do you believe in love at first sight—or should I walk by again?',
      "I'm no photographer, but I can picture us together.",
      'Feel my shirt. Know what it’s made of? Boyfriend material.',
      'If you were a chicken, you’d be impeccable.',
      'Did your license get suspended for driving all these folks crazy?',
      'I’m learning about important dates in history. Wanna be one of them?',
      'Baby, if you were words on a page, you’d be fine print.',
      'Did you just come out of the oven? Because you’re hot.',
      'It’s a good thing I have my library card because I am totally checking you out.',
      'I was blinded by your beauty; I’m going to need your name and phone number for insurance purposes.',
      'I was wondering if you had an extra heart. Because mine was just stolen.',
      'Is your name Google? Because you have everything I’ve been searching for.',
      "Are you a bank loan? Because you've got my interest.",
      'Are you a time traveler? Cause I see you in my future!',
      'Can I follow you where you’re going right now? Because my parents always told me to follow my dreams.',
      'Is this the Hogwarts Express? Because it feels like you and I are headed somewhere magical.',
      'Life without you is like a broken pencil…pointless.',
      "My love for you is like diarrhea, I just can't hold it in.",
      'Somebody better call God, because he’s missing an angel.',
      'We’re not socks, but I think we’d make a great pair.',
      "You must be tired because you've been running through my mind all night.",
      'Do you have a map? I keep getting lost in your eyes.',
      'Do you have a BandAid? I just scraped my knee falling for you.',
      'Did the sun come out or did you just smile at me?',
      'Do you know CPR? Because you are taking my breath away!',
      'You’re so beautiful that you made me forget my pickup line.',
      'I didn’t know what I wanted in a person until I saw you.',
      'I never believed in love at first sight, but that was before I saw you.',
      'Your eyes are like the ocean; I could swim in them all day.',
      'If you were a vegetable, you’d be a ‘cute-cumber.’',
      'I ought to complain to Spotify for you not being named this week’s hottest single.',
      'No wonder the sky is gray — all the color is in your eyes.',
      'You’re like a fine wine. The more of you I drink in, the better I feel.',
      'You’ve got a lot of beautiful curves, but your smile is absolutely my favorite.',
      'If being sexy was a crime, you’d be guilty as charged.',
      'I was wondering if you’re an artist because you were so good at drawing me in.',
      'I’d like to take you to the movies, but they don’t let you bring in your own snacks.',
      'You know what you would look really beautiful in? My arms.',
      'I would never play hide and seek with you because someone like you is impossible to find.',
      'Are you a magician? It’s the strangest thing, but every time I look at you, everyone else disappears.',
      'I think there’s something wrong with my phone. Could you try calling it to see if it works?',
      'Hi, I just wanted to thank you for the gift.... I’ve been wearing this smile ever since you gave it to me.',
      'I’ve heard it said that kissing is the ‘language of love.’ Would you care to have a conversation with me about it sometime?',
      'I always thought happiness started with an ‘h,’ but it turns out mine starts with ‘u.’',
      'On a scale of 1 to America, how free are you tonight?',
      'Your hand looks heavy—can I hold it for you?',
      'Are you a time traveler? Because I absolutely see you in my future.',
      'How does it feel to be the most gorgeous person in the chat room?',
      'I can’t tell if that was an earthquake, or if you just seriously rocked my world.',
      'I just had to tell you, your beauty made me truly appreciate being able to see.',
      'If you were a fruit, you’d be a ‘fine-apple.’',
      'You are astoundingly gorgeous, but I can tell that’s the least interesting thing about you. I’d love to know more.',
      'If beauty were time, you’d be eternity.',
      'I think the only way you could possibly be more beautiful is if I got to know you.',
      'I don’t know which is prettier today—the weather, or your eyes.',
      'I swear someone stole the stars from the sky and put them in your eyes.',
      'Kiss me if I’m wrong but, dinosaurs still exist, right?',
      'If I were a cat, I’d spend all nine of my lives with you.',
      'When I text you goodnight later, what phone number should I use?',
      'I’m not currently an organ donor, but I’d be happy to give you my heart.',
      'I’d say, ‘God bless you,’ but it looks like he already did.',
      'You must be a hell of a thief, because you managed to steal my heart from across the room.',
      'If you let me borrow a kiss, I promise I’ll give it right back.',
      'I seem to have lost my number—can I have yours?',
      'I was going to call you beautiful, but then I realized I don’t have your number yet.',
      'Are you any good at boxing? Because you look like a knockout.',
      'I wish I’d paid more attention to science in high school, because you and I’ve got chemistry and I want to know all about it.',
      'If I were to ask you out on a date, would your answer be the same as the answer to this question?',
      'You know, I’m actually terrible at flirting. How about you try to pick me up instead?',
      'Hi, how was heaven when you left it?',
      'I may not be a genie, but I can make your dreams come true.',
      'Are you my phone charger? Because without you, I’d die.',
      'You don’t need keys to drive me crazy.',
      'Are you a dictionary? Cause you’re adding meaning to my life.',
      'I’m no mathematician, but I’m pretty good with numbers. Tell you what, give me yours and watch what I can do with it.',
      'You must be a broom, ‘cause you just swept me off my feet.',
      "I don't know if you play Quidditch, but if I had to guess what position you played, I'd say you're probably a keeper.",
      'Are you Siri? Because you autocomplete me!',
      "I'm in the mood for pizza. A pizza you, that is!",
      "You're so sweet, you'd put Hershey's out of business!",
      "There must be something wrong with my eyes. I can't take them off you.",
      'You must be a high test score. Because I want to take you home and show you to my mother.',
      'I want our love to be like the number Pi: irrational and never-ending.',
      'Where have I seen you before? Oh yeah, I remember now. It was in the dictionary next to the word GORGEOUS!',
      "I wasn't always religious. But I am now, because you're the answer to all my prayers.",
      "If I could rearrange the alphabet, I'd put 'U' and 'I' together.",
      'They say your body is a garden, so can I plow yours?',
      'Are you my pancreas cause you give me a feeling in my chest that makes me want to take you out.'
    ]

    var index = (Math.floor(Math.random() * Math.floor(pickupLines.length)))

    if (message.mentions.users.size > 0) {
      var target = message.mentions.users.first()
    } else {
      var target = message.author
    }

    const lineEmbed = new Discord.MessageEmbed()
    lineEmbed
      .setColor('#DA70D6')
      .setAuthor(`Random pick-up line from ${message.author.username}`, message.author.displayAvatarURL())
      .setDescription(`${target} *${pickupLines[index]}* :hearts:`)
    message.channel.send(lineEmbed).catch(console.error)
  }
}
