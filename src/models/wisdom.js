const mongoose = require('mongoose')

const wisdomSchema = mongoose.Schema({
  quote: String,
  author: String,
  authorId: Number
})

module.exports = mongoose.model('Wisdom', wisdomSchema)
