const express = require('express');
const router = express.Router();
const passport = require('passport');
const userModel = require('./users');
const postModel = require('./posts');
const commentModel = require('./comment');
const passportLocal = require('passport-local');
const messageModel = require('./message');
const uuid = require('uuid');
const utilfile = require('./util');

passport.use(new passportLocal(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.status(200).json({messages:"success", page:"index"});
});

router.post('/reg', function(req,res){
  var newUser = new userModel({
    name : req.body.name,
    username:req.body.username,
    luckyname : utilfile()
  });
   userModel.register(newUser, req.body.password)  
    .then(function(u){
      passport.authenticate('local')(req,res,function(){
        res.status(200).json({message:"Register succesfully", value:u})
      })
    }).catch(function(err){
       res.status(503).json({message:"something went wrong"});
    })
 })
 
 router.post('/login', passport.authenticate('local',{
   successRedirect:'/profile',
   failureRedirect: '/failurelogin'
 }), function(req,res){});
 
 router.get('/profile',isLoggedIn ,function(req,res){
   userModel.findOne({username:req.session.passport.user})
    .then(function(foundUser){
     res.status(200).json({message:"Suceessfully login " ,value:foundUser});
    })
 });
 
 router.get('/failurelogin', function(req,res){
      res.status(503).json({message:"login failed"});
 })
 
 
 router.get('/logout', function(req,res){
   req.logOut();
   res.status(200).json({message:"logout succesfully"});
 })

 router.post('/createpost', isLoggedIn, function(req,res){
     userModel.findOne({username : req.session.passport.user})
       .then(function(foundUser){
           postModel.create({
             userid : foundUser._id,
             cntnt : req.body.cntnt,
           }).then(function(createdPost){
             foundUser.posts.push(createdPost);
             foundUser.save().then(function(uu){
              res.status(200).json({message:"Post created Successfully", value: uu});
             })
           })
       })
 });

 router.get('/post/:postid/react', isLoggedIn,function(req,res){
    postModel.findOne({_id:req.params.postid})
      .then(function(foundPost){
        if(!foundPost.react.includes(req.session.passport.user)){
            foundPost.react.push(req.session.passport.user);
        }else{
          let index = foundPost.react.indexOf(req.session.passport.user);
          foundPost.react.splice(index, 1);
        } 
        foundPost.save().then(function(uu){
          res.status(200).json(uu);
        })
      })
 });

 router.get('/allpost',function(req,res){
    postModel.find()
      .then(function(allpost){
        res.status(200).json(allpost);
      })
 });

 router.post('/post/:postid/comment', isLoggedIn,function(req,res){
   userModel.findOne({username:req.session.passport.user})
     .then(function(foundUser){
      postModel.findOne({_id:req.params.postid})
      .then(function(foundPost){
         commentModel.create({
           commentcntnt : req.body.commentcntnt,
           userid:foundUser._id,
           postid: foundPost._id,
         }).then(function(uu){
           foundPost.comment.push(uu);
           foundPost.save();
           res.status(200).json(uu);
         })
      }).catch(function(){
        res.status(503).json({message:"something went wrong"});
      })
     })
  
 });

 // --->  This routes is less optimize 
//  router.post('/msg/:receiver',function(req,res){
//    userModel.findOne({username:req.session.passport.user})
//     .then(function(foundUser){
//       var chatids = '';
//         foundUser.msg.forEach(function(msgobj){
//           if(msgobj.Users[0]==req.params.receiver){
//               chatids = msgobj.chatid;
//           }
//         });
//         if(chatids === ''){
//             chatids = uuid.v4();
//           } 
//          messageModel.create({
//            author:req.session.passport.user,
//            receiver:req.params.receiver,
//            msg: req.body.msg,
//            chatid: chatids
//          }).then(function(createdMsg){
//            msgset = {chatid: createdMsg.chatid, Users:[req.params.receiver, foundUser.username]}
//            foundUser.msg.push(msgset);
//            foundUser.save().then(function(savedUser){
//              userModel.findOne({username:req.params.receiver})
//                .then(function(foundReceiver){
//                 msgsetreceiver = {chatid:createdMsg.chatid, Users:[req.session.passport.user, foundReceiver.username]};
//                 foundReceiver.msg.push(msgsetreceiver);
//                 foundReceiver.save().then(function(savedReceiver){
//                   res.status(200).json(foundReceiver);
//                 })
                
//               })               
//            })
//          })
//     })
//  });

router.post('/msg/:receiver', function(req,res){
  userModel.findOne({username:req.session.passport.user})
    .then(function(foundUser){
      const returnedvalue = foundUser.msg.find(value => value.another === req.params.receiver);
      if(returnedvalue === undefined){
        var chatid = uuid.v4();
        messageModel.create({
          author: foundUser.username,
          msg:req.body.msg,
          chatid: chatid,
          receiver: req.params.receiver
        }).then(function(createdMsg){
            foundUser.msg.push({chatid:createdMsg.chatid, another:req.params.receiver});
            foundUser.save();
            userModel.findOne({username:req.params.receiver})
            .then(function(foundReceiver){
              foundReceiver.msg.push({chatid:createdMsg.chatid, another:foundUser.username});
              foundReceiver.save();
              res.status(200).json({msg:createdMsg});
            })
        })
      }else{
        messageModel.create({
          author: foundUser.username,
          msg:req.body.msg,
          chatid: returnedvalue.chatid,
          receiver: req.params.receiver
        }).then(function(createdMsg){
           res.status(200).json({msg:createdMsg});
        }
      )}     
    })
});

// issue
router.get('/showmsg/:receiver',function(req,res){
  userModel.find({username:req.session.passport.user})
  .then(function(foundUser){
    console.log(foundUser.msg); 
    const returnedvalue = foundUser.msg.find(value => value.another === req.params.receiver);
    console.log(foundUser.msg);
    if(returnedvalue != undefined){
      console.log(returnedvalue);
    }
  }).catch(function(){
    res.json({msg:'No msg available'});
  })
})
 

//Not so optimize

//  router.get('/showmsg/:username', function(req,res){
//   userModel.findOne({username:req.session.passport.user})
//     .then(function(foundUser){
//         var chatid = '';
//         foundUser.msg.forEach(function(msgobj){
//         if(msgobj.Users[0]==req.params.username){
//             chatid = msgobj.chatid;          
//           }
//         });
//         allmsg = [];
//         if(chatid != ''){
//          messageModel.find({chatid:chatid})
//           .then(function(usermsgs){
//               usermsgs.forEach(function(particularmsg){
//                   allmsg.push(particularmsg.msg);
//                 })
//                 res.status(200).json({message:allmsg});
//           })
//       }else res.json({message: "You haven't chat yet with this person."});     
//    }) .catch(function(){  
//      res.json({message: "Something went wrong."})
//    })     
//  });

 function isLoggedIn(req,res,next){
     if(req.isAuthenticated()){
       return next();
     }
     res.redirect('/');
 }

module.exports = router;
