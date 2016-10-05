/**
 * Created by tom.ben-simhon on 10/5/2016.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var msgSchema   = new Schema({
    msg: String
});

module.exports = mongoose.model('msg', msgSchema);