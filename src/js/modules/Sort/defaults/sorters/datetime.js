//sort datetime
export default function(a, b, aRow, bRow, column, dir, params){
	var DT = window.DateTime || luxon.DateTime;
	var format = params.format || "dd/MM/yyyy HH:mm:ss",
	alignEmptyValues = params.alignEmptyValues,
	emptyAlign = 0;

	if(typeof DT != "undefined"){
		a = format === "iso" ? DT.fromISO(String(a)) : DT.fromFormat(String(a), format);
		b = format === "iso" ? DT.fromISO(String(b)) : DT.fromFormat(String(b), format);

		if(!a.isValid){
			emptyAlign = !b.isValid ? 0 : -1;
		}else if(!b.isValid){
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

	}else{
		console.error("Sort Error - 'datetime' sorter is dependant on luxon.js");
	}
};