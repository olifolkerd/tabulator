//sort numbers
export default function(a, b, aRow, bRow, column, dir, params){
	//fast-path: both already finite numbers, no separator/empty handling needed
	if(typeof a === "number" && typeof b === "number" && isFinite(a) && isFinite(b)){
		return a - b;
	}

	var alignEmptyValues = params.alignEmptyValues;
	var decimal = params.decimalSeparator;
	var thousand = params.thousandSeparator;
	var emptyAlign = 0;
	var aEmpty = a === "" || a === null || typeof a === "undefined";
	var bEmpty = b === "" || b === null || typeof b === "undefined";

	if(aEmpty){
		emptyAlign = bEmpty ? 0 : -1;
	}else if(bEmpty){
		emptyAlign = 1;
	}else{
		a = parseValue(a, decimal, thousand);
		b = parseValue(b, decimal, thousand);

		//handle non numeric values
		if(isNaN(a)){
			emptyAlign =  isNaN(b) ? 0 : -1;
		}else if(isNaN(b)){
			emptyAlign =  1;
		}else{
			//compare valid values
			return a - b;
		}
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
}

function parseValue(value, decimal, thousand){
	if(typeof value === "number"){
		return value;
	}

	value = String(value);

	if(thousand){
		value = value.replaceAll(thousand, "");
	}

	if(decimal && decimal !== "." ){
		value = value.replaceAll(decimal, ".");
	}

	return parseFloat(value);
}
