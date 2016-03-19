var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

var message_queue = [];

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

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
	var data = decodeURI(req.body.data);
    var user_name = message_queue.push(data);
    res.send("Server received: " + data);
});

app.get('/', function(request, response) {
	response.render('pages/index');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


