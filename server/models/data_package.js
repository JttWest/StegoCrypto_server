var mongoose = require('mongoose');

// define the schema for our data_package model
var dataPackageSchema = mongoose.Schema({
    from_userName       : String,
    to_userName         : String,
    data                : String,
    date_created        : String,
    delivered           : Boolean,
    package_id          : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('DataPackge', dataPackageSchema, 'datapackages');