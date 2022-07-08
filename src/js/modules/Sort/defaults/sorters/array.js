//sort if element contains any data
export default function(a, b, aRow, bRow, column, dir, params){
	var type = params.type || "length",
	alignEmptyValues = params.alignEmptyValues,
	emptyAlign = 0;

	function calc(value){
		var result;

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
		}

		return result;
	}

	//handle non array values
	if(!Array.isArray(a)){
		emptyAlign = !Array.isArray(b) ? 0 : -1;
	}else if(!Array.isArray(b)){
		emptyAlign = 1;
	}else{
		return calc(b) - calc(a);
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
}