var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/majorn6');

var userSchema = mongoose.Schema({
  name: String,
  luckyname: {
    type: String,
    default: '' 
  },
  username: String,
  password: String,
  prflimg :{
    type: String,
    default: '' 
  },
  posts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'post' 
  }],
  msg: []
});
userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);
