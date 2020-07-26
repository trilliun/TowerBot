const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
  name: String,
  description: String,
  details: String,
  cost: Number,
  category: String,
  rarity: String,
  statAffected: String,
  icon: String,
  roll: {
    dieCount: Number,
    dieSides: Number,
    modifier: Number
  }
})

module.exports = mongoose.model('Item', itemSchema)
