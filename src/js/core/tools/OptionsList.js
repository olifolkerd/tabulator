export default class OptionsList {
	constructor(table, msgType){
		this.table = table;
		this.msgType = msgType;
		this.registeredDefaults = {};
	}

	register(option, value){
		this.registeredDefaults[option] = value;
	}

	generate(defaultOptions, userOptions = {}){
		var output = Object.assign({}, defaultOptions);

		console.log("gen", this.registeredDefaults)

		Object.assign(output, this.registeredDefaults);

		if(userOptions.invalidOptionWarnings !== false || this.table.options.invalidOptionWarnings){
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
				}else{
					output[key] = output[key];
				}
			}
		}

		return output;
	}
}