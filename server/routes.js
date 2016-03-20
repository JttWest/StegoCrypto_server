

module.exports = function(app) {
	var message_queue = []

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

	app.get('/', function(request, response) {
		response.render('pages/index');
	});

}