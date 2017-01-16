var ws = new WebSocket("ws://" + window.location.host);//new WebSocket("ws://127.0.0.1:8080/WSServer_war_exploded/websocket/nope");

ws.onopen = function(event) {
  console.log("connected");
};

var display = document.querySelector('#display');
var manager = new SensorManager();
var paragraph;
ws.onmessage = function(event) {
	paragraph = document.createElement('p');
	var sensor = SensorFactory.create(JSON.parse(event.data));
	sensor = manager.manage(sensor);
	console.log(sensor);
	paragraph.textContent = JSON.stringify(sensor);
	display.appendChild(paragraph);
};
