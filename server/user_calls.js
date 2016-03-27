var mongoose = require('mongoose');
var gcm = require('node-gcm');
var user = require('./models/user');
var request = require('request');

var GCMsender = new gcm.Sender( process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key );
var GCM_SERVER_API_KEY = process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key;


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
      //var to_token = users[0].instanceIDTokens;
      //var to_userName = users[0].userName;

      
      var message = new gcm.Message();
      message.addData('title', "test title");
      message.addData('body', "test body");
      message.addData('icon', "random");

      /*
      console.log(message);
      */
      /*
      var to_id = 'cipQuQ32y9U:APA91bHBNTrN4dMYmSazJq4LidJfeRHbtf9uq1J6biaouBksVPsLXhHAFbzdYfXIRGRSjiBmm40hG28MRXaFjl6golu8veMJKQ-Kpi-FVoMW0oqsGfTinWcnq3yalz88rmjbYK0H60Dn';
      request(
        { method: 'POST',
          uri: 'https://android.googleapis.com/gcm/send',
          headers: {
              'Content-Type': 'application/json',
              'Authorization':'key=' + GCM_SERVER_API_KEY
          },
          body: JSON.stringify({
            "to" : to_id,
            "data" : {
              "msg":'test msg',
              "fromu":'test from u',
              "name":'test name'
            },
            "time_to_live": 108
          })
        }
        , function (error, response, body) {
            if (error)
              callback({'error:':error});
            else
              callback({'response': response});
          }
      );*/
      /*
      GCMsender.send(message, { registrationTokens: regTokens }, 3, function (err, response){
        if (err) 
          console.error(err);
        else    
          console.log(response);
      });
      */
      
      // Send to a topic, with no retry this time
      GCMsender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
          if(err) console.error("Couldn't send message to GCM server: " + err);
          else    console.log("Response from GCM server: " + response);
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