var mongoose = require('mongoose');
var gcm = require('node-gcm');
var user = require('./models/user');
var data_package = require('./models/data_package');
var request = require('request');
var data_transfer = require('./data_transfer');

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

exports.login = function(userName, password, instanceIDToken, callback) {

  user.findOne({userName: userName}, function(err,user){
    if (!user) {
      callback({'response':"User does not exist."});
    } else {
      if(password == user.password) {
        // update DB with new instanceIDToken if its not already in there
        if (instanceIDToken && user.instanceIDTokens.indexOf(instanceIDToken) < 0) {
          user.instanceIDTokens.push(instanceIDToken);
          user.save(function (err){
              if (err)
                callback(err);
          });
        }
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

exports.sendMessage = function(fromUserName, toUserName, data, callback) {
  // create the data package
  var dataPackageAttributes = data_transfer.createPackageInDB(fromUserName, toUserName, data);

  user.findOne({userName: toUserName},function(err,user){
    if (!user) {
      callback("Recipient user doesn't exist.");
    } else {
      // get the devices to send data to using instanceIDTokens
      var destinationDevices = user.instanceIDTokens;

      // intented recipient is not currently logged in to any device
      if (!destinationDevices)
        callback("Recipient is offline."); // recipient will request for pending packages when logged in
      else {
        var message = new gcm.Message();
        message.addData('data_package', dataPackageAttributes);

        // testing
        var to_id = ['cipQuQ32y9U:APA91bHBNTrN4dMYmSazJq4LidJfeRHbtf9uq1J6biaouBksVPsLXhHAFbzdYfXIRGRSjiBmm40hG28MRXaFjl6golu8veMJKQ-Kpi-FVoMW0oqsGfTinWcnq3yalz88rmjbYK0H60Dn'];

        // send to user
        GCMsender.send(message, { registrationTokens: to_id }, 3, function (err, response){
          if (err) 
            callback(err);
          else    
            callback(response);
        });  
      }
    }
  });
}


// in progress
exports.sendPendingPackages = function(userName, callback){
   data_package.find({to_userName: userName, delivered: false}, function(err, data_packages){
        if (!data_packages) {
          callback("No pending package for user");
        }
        else {
          for (var package in data_packages){
            //sendMessage
          }
        }
      }
    );
}


/*
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
      );
      
      GCMsender.send(message, { registrationTokens: regTokens }, 3, function (err, response){
        if (err) 
          console.error(err);
        else    
          console.log(response);
      });
      
      
      // Send to a topic, with no retry this time
      GCMsender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
          if(err) console.error("Couldn't send message to GCM server: " + err);
          else    console.log("Response from GCM server: " + response);
      });
      
    }
  });
}*/


// Called when a user logs out from a device: removes the instanceIDToken associated 
// with that device so data won't get send there
exports.removeInstanceIDTokenFromUser = function(userName, instanceIDToken, callback){
  user.findOne({userName: userName},function(err,user){
    if (!user) {
      callback("Can't find user to remove instanceIDToken");
    } else {
      user.instanceIDTokens = removeInstanceIDTokenFromArr(user.instanceIDTokens, instanceIDToken);
      user.save(function (err){
        if (err)
          callback(err);
      });
      callback("instanceIDToken successfully removed");
    }
  });
}

// Helper function to remove a instanceIDToken from instanceIDTokensArray
function removeInstanceIDTokenFromArr(instanceIDTokensArray, instanceIDToken) {
  for(var i=0; i<instanceIDTokensArray.length; i++) {
    if(instanceIDTokensArray[i] === instanceIDToken) {
      instanceIDTokensArray.splice(i, 1);
      break;
    }
  }
  return instanceIDTokensArray;
}

function removeUserFromArr(arr, userName) {
  for(var i=0; i<arr.length; i++) {
    if(arr[i].userName === userName) {
      arr.splice(i, 1);
      break;
    }
  }
  return arr;
}