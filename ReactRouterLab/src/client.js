var ws = new WebSocket("ws://" + window.location.host);//new WebSocket("ws://127.0.0.1:8080/WSServer_war_exploded/websocket/nope");

ws.onopen = function(event) {
  console.log("connected");
};

selectedSensor = null;

var display = document.querySelector('#display');
var manager = new SensorManager();
ws.onmessage = function(event) {
	var sensor = SensorFactory.create(JSON.parse(event.data));
	manager.manage(sensor);
	render();
};
