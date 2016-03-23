var mongoose = require('mongoose');
var gcm = require('node-gcm');
var user = require('./models/user');

var GCMsender = new gcm.Sender( process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key );

exports.register = function(userName, password, instanceIDTokens, callback) {
  var newuser = new user({ 
    userName               : userName,
    password               : password, 
    //instanceIDTokens       : [instanceIDTokens] -- instanceID only updated by login
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

exports.login = function(userName, password, instanceIDTokens, callback) {

  user.findOne({userName: userName}, function(err,user){
    if (!user) {
      callback({'response':"User does not exist."});
    } else {
      if(password == user.password) {
        // update DB with new instanceIDToken
        user.instanceIDTokens.push(instanceIDTokens);
        user.save(function (err){
            if (err)
              callback(err);
        });
        callback({'response':"Sucessfully login."});
      } else {
        callback({'response':"Wrong password."});
      }
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
      var to_token = users[0].instanceIDTokens;
      //var to_userName = users[0].userName;

      var message = new gcm.Message();
      message.addData('message', msg);
      message.addData('from', fromUserName);

      var regTokens = [to_token];

      GCMsender.send(message, { instanceIDTokens: instanceIDTokens }, 3, function (err, response){
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