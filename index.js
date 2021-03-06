var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

mongoose.connect(process.env.MONGODB_URL || require('./config/configs').mongoDB_url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB!");
});


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


require('./server/routes.js')(app); // load routes

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


