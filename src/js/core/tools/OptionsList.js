export default class OptionsList {
	constructor(table, msgType, defaults = {}){
		this.table = table;
		this.msgType = msgType;
		this.registeredDefaults = Object.assign({}, defaults)
	}

	register(option, value){
		this.registeredDefaults[option] = value;
	}

	generate(defaultOptions, userOptions = {}){
		var output = Object.assign({}, this.registeredDefaults);

		Object.assign(output, defaultOptions);

		if(userOptions.debugInvalidOptions !== false || this.table.options.debugInvalidOptions){
			for (var key in userOptions){
				if(!output.hasOwnProperty(key)){
					console.warn("Invalid " + this.msgType + " option:", key)
				}
			}
		}

		for (var key in output){
			if(key in userOptions){
				output[key] = userOptions[key];
			}else{
				if(Array.isArray(output[key])){
					output[key] = Object.assign([], output[key]);
				}else if(typeof output[key] === "object" && output[key] !== null){
					output[key] = Object.assign({}, output[key]);
				}else if (typeof output[key] === "undefined"){
					delete output[key];
				}
			}
		}

		return output;
	}
}