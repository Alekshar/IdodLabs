SensorFactory = {
	create: function(data){
		switch(data.type){
		case "POSITIVE_NUMBER":
			return new Temperature(data);
		case "ON_OFF":
			return new Switch(data);
		case "OPEN_CLOSE":
			return new Door(data);
		case "PERCENT":
			return new Gradient(data);
		default:
			throw "can't define sensor type of "+data.type;
		}
	}
};

function SensorManager(){
	this.sensors = [];
}

SensorManager.prototype = {
	manage:function(newSensor){
		var id = newSensor.id;
		for(var sensor of this.sensors){
			if(sensor.id === id){
				sensor.include(newSensor);
				return sensor;
			}
		}
		this.sensors.push(newSensor);
		return sensor;
	}
};


function Sensor(data){
	this.id = data.id;
	this.values = [data.value];
}

Sensor.prototype.include = function(sensor){
	this.values = this.values.concat(sensor.values);
};


function Temperature(data){
	Sensor.call(this, data);
}
Temperature.prototype = Object.create(Sensor.prototype);

function Door(data){
	Sensor.call(this, data);
}
Door.prototype = Object.create(Sensor.prototype);

function Switch(data){
	Sensor.call(this, data);
}
Switch.prototype = Object.create(Sensor.prototype);

function Gradient(data){
	Sensor.call(this, data);
}
Gradient.prototype = Object.create(Sensor.prototype);