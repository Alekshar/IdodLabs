var http = require('http'),
  WebSocketServer = require('ws').Server,
  express = require('express'),
  bodyParser = require('body-parser'),
  port = 80,
  portmqtt = 32768,
  host = '0.0.0.0';

var app = express();

app.use(express.static('src'));

var server = http.createServer();
server.on('request', app);
server.listen(port, host, function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});


var wss = new WebSocketServer({
  server: server
});
wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
    client.send(message);
  });
};
wss.on('connection', function(client) {
});



var mqttURL = 'mqtt://localhost:'+portmqtt;
var mqtt = require('mqtt').connect(mqttURL);

mqtt.subscribe('value/#');

mqtt.on('message', (topic, message) => {
	var data = JSON.parse(message);
	var name = topic.split('/')[1];
	data.id = name;
	wss.broadcast(JSON.stringify(data));
});

//mongodb connection
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/InternetOfStuff';
var db = null;
MongoClient.connect(url, function (err, database) {
	if (err) {
	  console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
	  console.log('Connection established to mongodb : ', url);
	  db = database;
	}
});

//Web services definitions

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/sensor/informations/:id', function (req, res) {
	var collection = db.collection('sensors');
    collection.find({_id:req.params.id}).toArray(function (err, result) {
    	res.end( JSON.stringify(result[0]));
    });
});

app.post('/sensor/informations/:id', function (req, res) {
	var infos = req.body;
	db.collection('sensors').update(
		{_id:req.params.id},
		{$set:{
			"name": infos.name,
			"location": infos.location
		}});
	res.end("update done");
});

app.get('/sensor/measures/:id/:from/:to', function (req, res) {
	var from = new Date(req.params.from),
		to = req.params.to == "now" ? new Date() : new Date(req.params.to);
	var collection = db.collection('measures');
	collection.find({sensor_id:req.params.id,date:{$gt:from, $lt:to}}).toArray(function (err, result) {
		res.end( JSON.stringify(result));
	});
});
