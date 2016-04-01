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



/*
// Perform callback any packages where userName match to_userName in data_package collection
exports.getPendingPackagesForUser = function(userName, callback){
    data_package.find({to_userName: userName}, function(err, data_packages){
        if(data_packages) 
            callback(data_packages);
        }
    });
}
*/

// Sets the delivered flag to 'status' for the package with matching package_id
exports.setDeliveredFlagForPackage = function(package_id, status, callback){
    data_package.findOne({package_id: package_id}, function(err, data_package){
        if(!data_package){
            callback("setDeliveredFlagForPackage: PackageID " + package_id + " doesn't exist.");
        } else {
            data_package.delivered = status;
            data_package.save(function (err){
                if (err)
                    callback("setDeliveredFlagForPackage: false to set delivered flag");
          });
        }
        callback("setDeliveredFlagForPackage: success");
    });
}


