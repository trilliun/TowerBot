const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    description: String,
    uri: String,
    tags: []
});

module.exports = mongoose.model('Image', imageSchema);