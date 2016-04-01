var user_calls = require('./user_calls');

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

	app.post('/sendData', function (req, res) {
		var data = decodeURIComponent(req.body.data);
	    var user_name = message_queue.push(data);
	    res.send("Server received: " + data);
	});

	// user calls
	app.post('/register',function(req,res){
		var userName = req.body.userName;
   		var password = req.body.password;
    	var instanceIDTokens = req.body.instanceIDTokens;

		user_calls.register(userName, password, instanceIDTokens, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	app.post('/login',function(req,res){
		var userName = req.body.userName;
   		var password = req.body.password;
    	var instanceIDTokens = req.body.instanceIDTokens;

		user_calls.login(userName, password, instanceIDTokens, function (result) {
			console.log(result);
			res.json(result);
		});		
	});

	app.post('/sendMessage',function(req,res){
		var fromUserName = req.body.fromUserName;
        var toUserName = req.body.toUserName;
        var data = req.body.data;

		user_calls.sendMessage(fromUserName, toUserName, data, function (result) {
			console.log(result);
			res.send(result);
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

	//app.post('/acknowledgePackage')
}