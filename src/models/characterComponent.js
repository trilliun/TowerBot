const mongoose = require('mongoose')

const characterComponentSchema = mongoose.Schema({
  component: String,
  description: String,
  cost: Number,
  uri: []
})

module.exports = mongoose.model('CharacterComponent', characterComponentSchema)
