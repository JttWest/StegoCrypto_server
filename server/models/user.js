var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    userName 	        : String,
    password	        : String,
    instanceIDTokens    : [String]
});


// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return password === this.password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema, 'users');