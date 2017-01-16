
function sensorSelectionReducer(state, action) {
	switch(action.type){
	case "select":
		return action.sensorid;
	}
	return state;
}

let store = Redux.createStore(sensorSelectionReducer);

store.subscribe(() =>{
	render();
});


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

var SensorDetails = React.createClass({
	render: function() {
		var selectedSensor = manager.getSensor(store.getState());
		if(selectedSensor == null){
			return (React.createElement('h2', {}, "aucune sélection"));
		}
		var sensorValues = selectedSensor.values.slice(0).reverse();
		return (
			React.createElement('div', {style:{margin:"10px", width:"300px"}}, 
				React.createElement('div', {className:"box",style:{backgroundColor:"#cacce6"}}, selectedSensor.id),
				React.createElement('div', {style:{}}, 
					React.createElement('h3', {style:{}}, "Valeur actuelle : "),
					React.createElement('h2', {style:{textAlign:"right"}}, selectedSensor.getLast())
				),
				React.createElement('div', {style:{}}, 
					React.createElement('h3', {style:{}}, "Historique : "),
					React.createElement('div', {style:{textAlign:"right"}},
							sensorValues.map(function(value, i){
							var className = i%2 == 0 ? "tabElement odd" : "tabElement even";
							if(i > 5){
								return;
							}
							return React.createElement('div', {className:className,style:{}}, value);
						})  
					)
				)
			)
		)
	},
});

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