var mongoose = require('mongoose');
var data_package = require('./models/data_package');
var uuid = require('node-uuid');

// Compile data from sendData route into data package and store it in DB
exports.createPackageInDB = function(from_userName, to_userName, data){
    var dataPackageAttributes = { 
        from_userName          : from_userName,
        to_userName            : to_userName, 
        date_created           : Date(),
        delivered              : false,
        package_id             : uuid.v4(),
        data                   : data
    }

    var newDataPackage = new data_package(dataPackageAttributes);

    newDataPackage.save(function (err) {
        if (err)
            console.error(err);
    });

    return dataPackageAttributes;
}


// Retrieves the image from a data package
exports.retrieveDataFromPackage = function(package_id, callback){
  console.log(package_id);
  data_package.findOne({package_id: package_id}, function(err, data_package){
    if (!data_package) {
      callback({'response' : "Package ID doesn't exist."});
    } else {
      callback({'data' : data_package['data']});
    }
  });
}

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

// Contructer function for data transfer item
var dataTransferHistoryItem = function(fromUserName, toUserName, packageID, date){
    this.fromUserName = fromUserName;
    this.toUserName = toUserName;
    this.packageID = packageID;
    this.date = date;
}

// Retrieves the data transfer history of a user
exports.getDataTransferHistory = function(userName, callback){
    console.log(userName);

    data_package.find({ $or: [{from_userName: userName}, {to_userName: userName}] }, function(err, dataPackages) {
        var result = [];

        dataPackages.forEach(function (elem, index, array) {
            var item = new dataTransferHistoryItem( elem.from_userName,
                                                    elem.to_userName,
                                                    elem.package_id,
                                                    elem.date_created);
                                                    

            result.push(item)
        });         
        callback(result);
    });
}


