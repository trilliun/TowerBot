module.exports = {
    getEmoji(id, client) {
        return client.emojis.cache.find(emoji => emoji.name === id);
    }
}