//sort datetime
module.exports = function(a, b, aRow, bRow, column, dir, params){
	var format = params.format || "DD/MM/YYYY HH:mm:ss",
	alignEmptyValues = params.alignEmptyValues,
	emptyAlign = 0;

	if(typeof moment != "undefined"){
		a = moment(a, format);
		b = moment(b, format);

		if(!a.isValid()){
			emptyAlign = !b.isValid() ? 0 : -1;
		}else if(!b.isValid()){
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
		console.error("Sort Error - 'datetime' sorter is dependant on moment.js");
	}
};