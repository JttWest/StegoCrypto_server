var mongoose = require('mongoose');
var gcm = require('node-gcm');
var user = require('./models/user');

var GCMsender = new gcm.Sender( process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key );

exports.register = function(userName, password, registrationTokens, callback) {
  var newuser = new user({ 
    userName               : userName,
    password               : password, 
    registrationTokens     : registrationTokens
    //userID     : userID  should auto generate this...
  });

  user.find({userName: userName}, function(err,users){
    var len = users.length;

    if(len == 0){
      newuser.save(function (err) {
        callback({'response':"Sucessfully registered."});
      });
    } else {
     callback({'response':"User already registered."});
   }});
}

// not complete
exports.getContactsOnline = function(userName,callback) {

  user.find(function(err,users){

    var len = users.length;

    if(len == 0){
      callback({'response':"No contacts online"});
    } else {
      callback(removeUserFromArr(users, userName));
  }});
}


exports.removeUser = function(userName,callback) {

  user.remove({userName:userName},function(err,users){
    if(!err){
      callback({'response':"Removed Sucessfully"});
    } else {
      callback({'response':"Error"});
    }
  });
}

exports.sendMessage = function(fromUserName, toUserName, msg, callback) {
  user.find({userName: toUserName},function(err,users){
    var len = users.length;
    if(len == 0){
      callback({'response':"Failure"});
    } else {
      var to_token = users[0].registrationTokens;
      //var to_userName = users[0].userName;

      var message = new gcm.Message();
      message.addData('message', msg);
      message.addData('from', fromUserName);

      var regTokens = [to_token];

      GCMsender.send(message, { registrationTokens: registrationTokens }, 3, function (err, response){
        if (err) 
          console.error(err);
        else    
          console.log(response);
      });
    }
  });
}

function removeUserFromArr(arr, userName) {
  for(var i=0; i<arr.length; i++) {
    if(arr[i].userName === userName) {
      arr.splice(i, 1);
      return arr;
      break;
    }
  }
}