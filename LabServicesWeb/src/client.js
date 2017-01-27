var ws = new WebSocket("ws://" + window.location.host);//new WebSocket("ws://127.0.0.1:8080/WSServer_war_exploded/websocket/nope");

ws.onopen = function(event) {
  console.log("connected");
};

var display = document.querySelector('#display');
var manager = new SensorManager();
ws.onmessage = function(event) {
	var sensor = SensorFactory.create(JSON.parse(event.data));
	manager.manage(sensor);
	store.dispatch({type:"newdata"});
};


function getSensorInformations(sensorid, callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://'+window.location.host+'/sensor/informations/'+sensorid, true);
	xhr.onreadystatechange = function (aEvt) {
	  if (xhr.readyState == 4 && xhr.status == 200) {
	      callback(JSON.parse(xhr.responseText));
	  }
	};
	xhr.send(null);
}

function updateSensorInformations(sensorid, infos){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://'+window.location.host+'/sensor/informations/'+sensorid, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify(infos));
}

function getSensorMeasures(sensorid, from, to, callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://'+window.location.host+'/sensor/measures/'+sensorid+'/'+from+'/'+to, true);
	xhr.onreadystatechange = function (aEvt) {
	  if (xhr.readyState == 4 && xhr.status == 200) {
	      callback(JSON.parse(xhr.responseText));
	  }
	};
	xhr.send(null);
}