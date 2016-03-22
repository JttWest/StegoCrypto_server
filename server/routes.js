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

		user_calls.register(userName, password, instanceIDTokens, function (found) {
			console.log(found);
			res.json(found);
		});		
	});

	app.post('/login',function(req,res){
		var userName = req.body.userName;
   		var password = req.body.password;
    	var instanceIDTokens = req.body.instanceIDTokens;

		user_calls.login(userName, password, instanceIDTokens, function (found) {
			console.log(found);
			res.json(found);
		});		
	});


	app.post('/sendMessage',function(req,res){
		var fromUserName = req.body.fromUserName;
        var toUserName = req.body.toUserName;
        var msg = req.body.message;
		
		requests.sendMessage(fromUserName, toUserName, msg, function (found) {
			console.log(found);
			res.json(found);
		});		
	});
}