var user_calls = require('./user_calls');
var data_transfer = require('./data_transfer');

module.exports = function(app) {
	var message_queue = []

	app.get('/', function(request, response) {
		response.render('pages/index');
	});

	app.get('/retrieveData', function (req, res) {
	if (message_queue)
		res.send(message_queue.pop());
	else
		res.send('No item in queue.');
	});

	app.get('/getDataInQueue', function (req, res) {
		var result = "";

		for (var data in message_queue){
			result += data + ": " + message_queue[data];
			result += '</br>';
		}

		res.send(result);
	});

	// register new user
	app.post('/register',function(req,res){
		var userName = decodeURIComponent(req.body.userName);
   		var password = decodeURIComponent(req.body.password);

		user_calls.register(userName, password, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	// login user
	app.post('/login',function(req,res){
		var userName = decodeURIComponent(req.body.userName);
   		var password = decodeURIComponent(req.body.password);
    	var instanceIDTokens = decodeURIComponent(req.body.instanceIDToken);

		user_calls.login(userName, password, instanceIDTokens, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	// send image to another user
	app.post('/sendData',function(req,res){
		var fromUserName = decodeURIComponent(req.body.fromUserName);
        var toUserName = decodeURIComponent(req.body.toUserName);
        var data = decodeURIComponent(req.body.data);

		user_calls.sendData(fromUserName, toUserName, data, function (result) {
			console.log(result);
			res.send(result);
		});		
	});

	// a seperate API call to retrieve data from package since size of data can be
	// bigger than max allow for GCM (4KB)
	app.get('/retrieveDataFromPackage',function(req,res){
		var packageID = decodeURIComponent(req.query.packageID); //decodeURIComponent(req.body.packageID);

		data_transfer.retrieveDataFromPackage(packageID, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	// images for a user who hasn't been sent due to lack of network connection
	app.get('/getPendingPackages',function(req,res){
		var username = req.param['username'];

		// function that takes username and sends every package intented for
		// the user
		user_calls.sendPendingPackages(username, function (result) {
			console.log(result);
			res.send(result);
		});		
	});


	// retrieve the image transfer history of a user
	app.get('/getDataTransferHistory',function(req,res){
		var username = decodeURIComponent(req.query.username);

		// function that takes username and sends every package intented for
		// the user
		data_transfer.getDataTransferHistory(username, function (result) {
			console.log(result);
			res.json(result);
		});		

	});
}