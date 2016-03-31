var mongoose = require('mongoose');
var data_package = require('./models/data_package');
var uuid = require('node-uuid');


exports.createPackageInDB = function(from_userName, to_userName, data){
    var dataPackageAttributes = { 
        from_userName          : from_userName,
        to_userName            : to_userName, 
        data                   : data,
        date_created           : new Date(),
        delivered              : false,
        package_id             : uuid.v4()
    }

    var newDataPackage = new data_package(dataPackageAttributes);

    newDataPackage.save(function (err) {
        if (err)
            console.error(err);
    });

    return dataPackageAttributes;
}

// returns any packages where userName match to_userName in data_package collection
exports.getPendingPackagesForUser = function(userName){
    data_package.find({to_userName: userName}, function(err, data_packages){
        if(!data_packages){
            return [];
        } else {
            return data_packages;
        }
    });
}


