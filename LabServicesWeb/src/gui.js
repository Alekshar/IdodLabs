
function sensorSelectionReducer(state={selectedid:"",tick:0,paginated:[]}, action) {
	switch(action.type){
	case "pagination":
		return {selectedid:state.selectedid, tick:state.tick, paginated:action.paginated};
	case "select":
		return {selectedid:action.sensorid, tick:state.tick, paginated:state.paginated};
	default:
		return {selectedid:state.selectedid, tick:state.tick+1, paginated:state.paginated};
	}
}

let store = Redux.createStore(sensorSelectionReducer);

var MqttUrl = React.createClass({
	render: function() {
		return (
			React.createElement('div', {style:{width:"250px",paddingLeft:"250px"}}, 
				React.createElement('h1', {}, "URL du broker : "),
				React.createElement('div', {className:"box",style:{backgroundColor:"lightgrey"}}, "ws://localhost")
			)
		)
	},
});


var SensorMenu = React.createClass({
	changeSelectedSensor: function(sensorId){
		store.dispatch({type:"select", sensorid:sensorId});
		getSensorInformations(sensorId, function(data){
			document.querySelector('#sensor-name').value = data.name;
			document.querySelector('#sensor-location').value = data.location;
		});
		paginateHistory();
	},
	render: function() {
		return (
			React.createElement('div', {onClick:this.changeSelectedSensor.bind(this,this.props.name), className:"box",style:{width:"150px", backgroundColor:"whitesmoke"}}, 
				this.props.name 
			)
		)
	},
});


var ListSensors = React.createClass({
	render: function() {
		var sensors = [];
		if(typeof manager != "undefined"){
			sensors = manager.sensors;
		}
		return (
			React.createElement('div', {style:{flexBasis:"250px"}}, 
				sensors.map(function(sensor, i){
					return React.createElement(SensorMenu, {name:sensor.id, key:sensor.id});
				})  
			)
		)
	},
});

ListSensors = ReactRedux.connect(
	(state) => {
		return {tick:state.tick};
	},
	(dispatch)=> {
		return{};
	}
)(ListSensors);

function sensorDetailsChange(){
	var infos = {
			name:document.querySelector('#sensor-name').value,
			location:document.querySelector('#sensor-location').value
		},
		sensorid = store.getState().selectedid;
		
	updateSensorInformations(sensorid, infos);
}

function paginateHistory(){
	var from = new Date(Date.parse($('#datefrom').val())),
		to = new Date(Date.parse($('#dateto').val())),
		sensorid = store.getState().selectedid;
	
	getSensorMeasures(sensorid, from.toISOString(), to.toISOString(), function(data){
		store.dispatch({type:"pagination", paginated:data});
	});
}

var SensorDetails = React.createClass({
	componentDidUpdate: function(prevProps, prevState){
		generateCanvas();
		$(function(){
			$('#datefrom').datetimepicker({
				onChangeDateTime:paginateHistory,
			});
			$('#dateto').datetimepicker({
				onChangeDateTime:paginateHistory
			});
		});
	},
	render: function() {
		var selectedSensor = this.props.selectedSensor;
		if(selectedSensor == null){
			return (React.createElement('h2', {}, "aucune sélection"));
		}
		var pagination = this.props.pagination;
		return (
			React.createElement('div', {style:{margin:"10px", width:"300px"}}, 
				React.createElement('div', {className:"box",style:{backgroundColor:"#cacce6"}}, selectedSensor.id),
				React.createElement('div', {}, 
						React.createElement('label', {}, "Nom : "),
						React.createElement('input', {id:"sensor-name", onChange:sensorDetailsChange }),
						React.createElement('br', {}),
						React.createElement('label', {}, "Localisation : "),
						React.createElement('input', {id:"sensor-location", onChange:sensorDetailsChange})
					),
					React.createElement('div', {}, 
							React.createElement('h3', {}, "Valeur actuelle : "),
							React.createElement('h2', {style:{textAlign:"right"}}, selectedSensor.getLast())
						),
				React.createElement('div', {}, 
					React.createElement('h3', {}, "Historique : "),
					React.createElement('canvas', {id:"canvas",width:"300",height:"200"})
				),
				React.createElement('div', {style:{position:"relative"}}, 
					React.createElement('h3', {}, "Naviguer : "),
					React.createElement('label',{},"de"),
					React.createElement('input', {id:"datefrom",type:"datetime",onChange:paginateHistory}),
					React.createElement('label', {}, "à"),
					React.createElement('input', {id:"dateto",type:"datetime",onChange:paginateHistory}),
					React.createElement('div', {},
						pagination.map(function(value, i){
							return React.createElement('div', {}, new Date(value.date).toLocaleString()+"  = "+value.value);
						})
					)
				)
			)
		)
	},
});


function generateCanvas(){
	var sensor = manager.getSensor(store.getState().selectedid);
	if(sensor == null){
		return;
	}
	var sensorValues = sensor.values;
	sensorValues = sensorValues.length < 15 ? sensorValues : sensorValues.slice(sensorValues.length-15);
	var values = [];
	var binary = false;
	for(value of sensorValues){
		if(values.indexOf(value) < 0){
			values.push(value);
		}
	}
	values = values.sort(sortNumber).reverse();
	if(values[0] === "OFF" || values[0] === "ON"){
		binary = true;
	}
	if(!binary){
		var max = Number(values[0]);
		var min = Number(values[values.length-1]);
		var range = max-min;
	}
	var xStep = 250 / sensorValues.length;
	var step = 0;
	
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//draw x and y arrows
	ctx.beginPath();
	ctx.moveTo(40,200);
	ctx.lineTo(40,0);
	ctx.lineTo(30, 10);
	ctx.moveTo(40,0);
	ctx.lineTo(50, 10);
	ctx.moveTo(0, 180);
	ctx.lineTo(300, 180);
	ctx.lineTo(290, 170);
	ctx.moveTo(300, 180);
	ctx.lineTo(290, 190);
	ctx.stroke();
	
	if(binary){
		ctx.fillText("ON", 0, 50);
		ctx.fillText("OFF", 0, 100);
		for(value of sensorValues){
			var x = xStep*step+50,
				y = (value==="ON") ? 50 : 100;
			ctx.beginPath();
			ctx.arc(x, y, 7, 0, 2*Math.PI);
			ctx.fill();
			step++;
		}
	}
	
	for(value of values){
		var y = 180-(Number(value)-min)/range*160;
		ctx.fillText(value.substring(0,6), 0, y);
	}
	for(value of sensorValues){
		var x = xStep*step+50,
			y = 180-(Number(value)-min)/range*160;
		ctx.beginPath();
		ctx.arc(x, y, 7, 0, 2*Math.PI);
		ctx.fill();
		step++;
	}
}
function sortNumber(a,b) {
    return a - b;
}

SensorDetails = ReactRedux.connect(
	(state) => {
		return {selectedSensor: manager.getSensor(state.selectedid), tick:state.tick, pagination:state.paginated};
	},
	(dispatch)=> {
		return{};
	}
)(SensorDetails);


function render(){
	ReactDOM.render(
		React.createElement(ReactRedux.Provider, {store},
			React.createElement('div', {style:{display:"flex", flexDirection:"column"}}, 
				React.createElement(MqttUrl),
				React.createElement('div', {style:{display:"flex"}}, 
					React.createElement(ListSensors),
					React.createElement(SensorDetails)
				)
			)
		),
		document.getElementById('app')
	);
}

render();