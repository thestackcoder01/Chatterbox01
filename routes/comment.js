var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    postid: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    },
    userid : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    commentcntnt : String,
    react:[] ,
    
})


module.exports = mongoose.model('comment',commentSchema);