import Helpers from '../../../../core/tools/Helpers.js';

//sort if element contains any data
export default function(a, b, aRow, bRow, column, dir, params){
	var type = params.type || "length",
	alignEmptyValues = params.alignEmptyValues,
	emptyAlign = 0,
	table = this.table,
	valueMap;

	if(params.valueMap){
		if(typeof params.valueMap === "string"){
			valueMap = function(value){
				return value.map((item) => {
					return Helpers.retrieveNestedData(table.options.nestedFieldSeparator, params.valueMap, item);
				});
			};
		}else{
			valueMap = params.valueMap;
		}
	}

	function calc(value){
		var result;
		
		if(valueMap){
			value = valueMap(value);
		}

		switch(type){
			case "length":
				result = value.length;
				break;

			case "sum":
				result = value.reduce(function(c, d){
					return c + d;
				});
				break;

			case "max":
				result = Math.max.apply(null, value) ;
				break;

			case "min":
				result = Math.min.apply(null, value) ;
				break;

			case "avg":
				result = value.reduce(function(c, d){
					return c + d;
				}) / value.length;
				break;

			case "string":
				result = value.join("");
				break;
		}

		return result;
	}

	//handle non array values
	if(!Array.isArray(a)){
		emptyAlign = !Array.isArray(b) ? 0 : -1;
	}else if(!Array.isArray(b)){
		emptyAlign = 1;
	}else{
		if(type === "string"){
			return String(calc(a)).toLowerCase().localeCompare(String(calc(b)).toLowerCase());
		}else{
			return calc(b) - calc(a);
		}
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
}