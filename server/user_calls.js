var mongoose = require('mongoose');
var gcm = require('node-gcm');
var user = require('./models/user');
var data_package = require('./models/data_package');
var request = require('request');
var data_transfer = require('./data_transfer');

var GCMsender = new gcm.Sender( process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key );
var GCM_SERVER_API_KEY = process.env.GCM_SERVER_API_KEY || require('../config/configs').GCM_server_API_key;


// save new user info into DB if it doesn't already exit
exports.register = function(userName, password, callback) {
  var newuser = new user({ 
    userName               : userName,
    password               : password, 
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

// login user by checking DB and update instanceIDToken for Google Cloud Messeaging Service
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

// removes a user from DB
exports.removeUser = function(userName,callback) {
  user.remove({userName:userName},function(err,users){
    if(!err){
      callback({'response':"Removed Sucessfully"});
    } else {
      callback({'response':"Error"});
    }
  });
}

// send image from a user to another
exports.sendData = function(fromUserName, toUserName, data, callback) {
  // create the data package
  var dataPackageAttributes = data_transfer.createPackageInDB(fromUserName, toUserName, data);

  user.findOne({userName: toUserName},function(err,user){
    if (!user) {
      callback({'response' : "Recipient user doesn't exist."});
    } else {
      // get the devices to send data to using instanceIDTokens
      var destinationDevices = user.instanceIDTokens;
      console.log("Sending data to: ");
      console.log(destinationDevices);
      
      // intented recipient is currently logged in to atleast 1 device
      if(destinationDevices) {
        var message = new gcm.Message();

        var data = { 'fromUserName' : dataPackageAttributes['from_userName'],
                     'toUserName'   : dataPackageAttributes['to_userName'],
                     'date'         : dataPackageAttributes['date_created'],
                     'package_id'   : dataPackageAttributes['package_id']
                    }

        message.addData('data_package', data);

        GCMsender.send(message, { registrationTokens: destinationDevices }, 3, function (err, response){
          if (err) 
            console.log(err);
          else    
            console.log(response);
        });  

        callback({'response' : "Data sent sucessfully."});
      }
    }
  });
}

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