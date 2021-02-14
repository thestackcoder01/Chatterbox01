const mongoose = require('mongoose');

var msgSchema = mongoose.Schema({
    author:String,
    msg:String,
    chatid : String,
    date:{
        type:Date,
        default: Date.now,
    },
    receiver :String,
});

module.exports = mongoose.model('message', msgSchema);