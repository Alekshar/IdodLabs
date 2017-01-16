var http = require('http'),
  WebSocketServer = require('ws').Server,
  express = require('express'),
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
	console.log(data);
	wss.broadcast(JSON.stringify(data));
});
