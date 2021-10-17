export default {
	"avg":function(values, data, calcParams){
		var output = 0,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : 2

		if(values.length){
			output = values.reduce(function(sum, value){
				return Number(sum) + Number(value);
			});

			output = output / values.length;

			output = precision !== false ? output.toFixed(precision) : output;
		}

		return parseFloat(output).toString();
	},
	"max":function(values, data, calcParams){
		var output = null,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		values.forEach(function(value){

			value = Number(value);

			if(value > output || output === null){
				output = value;
			}
		});

		return output !== null ? (precision !== false ? output.toFixed(precision) : output) : "";
	},
	"min":function(values, data, calcParams){
		var output = null,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		values.forEach(function(value){

			value = Number(value);

			if(value < output || output === null){
				output = value;
			}
		});

		return output !== null ? (precision !== false ? output.toFixed(precision) : output) : "";
	},
	"sum":function(values, data, calcParams){
		var output = 0,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		if(values.length){
			values.forEach(function(value){
				value = Number(value);

				output += !isNaN(value) ? Number(value) : 0;
			});
		}

		return precision !== false ? output.toFixed(precision) : output;
	},
	"concat":function(values, data, calcParams){
		var output = 0;

		if(values.length){
			output = values.reduce(function(sum, value){
				return String(sum) + String(value);
			});
		}

		return output;
	},
	"count":function(values, data, calcParams){
		var output = 0;

		if(values.length){
			values.forEach(function(value){
				if(value){
					output ++;
				}
			});
		}

		return output;
	},
};