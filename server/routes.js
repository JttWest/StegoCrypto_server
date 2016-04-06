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

	/*
	app.post('/sendData', function (req, res) {
		var data = decodeURIComponent(req.body.data);
	    var user_name = message_queue.push(data);
	    res.send("Server received: " + data);
	});*/

	// user calls
	app.post('/register',function(req,res){
		var userName = decodeURIComponent(req.body.userName);
   		var password = decodeURIComponent(req.body.password);
    	//var instanceIDTokens = req.body.instanceIDToken;

		user_calls.register(userName, password, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	app.post('/login',function(req,res){
		var userName = decodeURIComponent(req.body.userName);
   		var password = decodeURIComponent(req.body.password);
    	var instanceIDTokens = decodeURIComponent(req.body.instanceIDToken);

		user_calls.login(userName, password, instanceIDTokens, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	app.post('/sendData',function(req,res){
		var fromUserName = decodeURIComponent(req.body.fromUserName);
        var toUserName = decodeURIComponent(req.body.toUserName);
        var data = decodeURIComponent(req.body.data);

		user_calls.sendData(fromUserName, toUserName, data, function (result) {
			console.log(result);
			res.send(result);
		});		
	});

	// A seperate API call to retrieve data from package since size of data can be
	// bigger than max allow for GCM (4KB)
	app.get('/retrieveDataFromPackage',function(req,res){
		var packageID = decodeURIComponent(req.query.packageID); //decodeURIComponent(req.body.packageID);

		data_transfer.retrieveDataFromPackage(packageID, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	app.get('/getPendingPackages',function(req,res){
		var username = req.param['username'];

		// function that takes username and sends every package intented for
		// the user
		user_calls.sendPendingPackages(username, function (result) {
			console.log(result);
			res.send(result);
		});		

		/*
		user_calls.sendMessage(fromUserName, toUserName, data, function (result) {
			console.log(result);
			res.send(result);
		});		*/
	});


	app.get('/getDataTransferHistory',function(req,res){
		var username = decodeURIComponent(req.query.username);

		// function that takes username and sends every package intented for
		// the user
		data_transfer.getDataTransferHistory(username, function (result) {
			console.log(result);
			res.json(result);
		});		

		/*
		user_calls.sendMessage(fromUserName, toUserName, data, function (result) {
			console.log(result);
			res.send(result);
		});		*/
	});


	//app.post('/acknowledgePackage')
}