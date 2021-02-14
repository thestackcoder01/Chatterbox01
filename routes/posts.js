var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    userid : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    media :{
        type: String,
        default: null
    },
    cntnt : String,
    react:[] ,
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }]
})


module.exports = mongoose.model('post',postSchema);