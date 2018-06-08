var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shortUrlSchema = new Schema ({
    original_url: String,
    short_url: String
})

module.exports = mongoose.model('ShortUrl', shortUrlSchema)