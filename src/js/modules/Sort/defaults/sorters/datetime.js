//sort datetime
export default function(a, b, aRow, bRow, column, dir, params){
	var DT = window.DateTime || luxon.DateTime;
	var format = params.format || "dd/MM/yyyy HH:mm:ss",
	alignEmptyValues = params.alignEmptyValues,
	emptyAlign = 0;

	if(typeof DT != "undefined"){
		if(DT.isDateTime(a)){
			 a = a;
		}else if(format === "iso"){
			 a = DT.fromISO(String(a));
		}else{
			 a = DT.fromFormat(String(a), format);
		}

		if(DT.isDateTime(b)){
			 b = b;
		}else if(format === "iso"){
			 b = DT.fromISO(String(b));
		}else{
			 b = DT.fromFormat(String(b), format);
		}

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