//sort numbers
export default function(a, b, aRow, bRow, column, dir, params){
	var alignEmptyValues = params.alignEmptyValues;
	var decimal = params.decimalSeparator;
	var thousand = params.thousandSeparator;
	var emptyAlign = 0;

	a = String(a);
	b = String(b);

	if(thousand){
		a = a.split(thousand).join("");
		b = b.split(thousand).join("");
	}

	if(decimal){
		a = a.split(decimal).join(".");
		b = b.split(decimal).join(".");
	}

	a = parseFloat(a);
	b = parseFloat(b);

	//handle non numeric values
	if(isNaN(a)){
		emptyAlign =  isNaN(b) ? 0 : -1;
	}else if(isNaN(b)){
		emptyAlign =  1;
	}else{
		//compare valid values
		return a - b;
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
};