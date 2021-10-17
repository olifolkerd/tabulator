//sort if element contains any data
export default function(a, b, aRow, bRow, column, dir, params){
	var el1 = 0;
	var el2 = 0;
	var type = params.type || "length";
	var alignEmptyValues = params.alignEmptyValues;
	var emptyAlign = 0;

	function calc(value){

		switch(type){
			case "length":
			return value.length;
			break;

			case "sum":
			return value.reduce(function(c, d){
				return c + d;
			});
			break;

			case "max":
			return Math.max.apply(null, value) ;
			break;

			case "min":
			return Math.min.apply(null, value) ;
			break;

			case "avg":
			return value.reduce(function(c, d){
				return c + d;
			}) / value.length;
			break;
		}
	}

	//handle non array values
	if(!Array.isArray(a)){
		alignEmptyValues = !Array.isArray(b) ? 0 : -1;
	}else if(!Array.isArray(b)){
		alignEmptyValues = 1;
	}else{

		//compare valid values
		el1 = a ? calc(a) : 0;
		el2 = b ? calc(b) : 0;

		return el1 - el2;
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
};