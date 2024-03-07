export default function(cell, formatterParams, onRendered){
	var floatVal = parseFloat(cell.getValue()),
	sign = "",
	number, integer, decimal, rgx, value;

	var decimalSym = formatterParams.decimal || ".";
	var thousandSym = formatterParams.thousand || ",";
	var negativeSign = formatterParams.negativeSign || "-";
	var symbol = formatterParams.symbol || "";
	var after = !!formatterParams.symbolAfter;
	var precision = typeof formatterParams.precision !== "undefined" ? formatterParams.precision : 2;

	if(isNaN(floatVal)){
		return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
	}

	if(floatVal < 0){
		floatVal = Math.abs(floatVal);
		sign = negativeSign;
	}

	number = precision !== false ? floatVal.toFixed(precision) : floatVal;
	number = String(number).split(".");

	integer = number[0];
	decimal = number.length > 1 ? decimalSym + number[1] : "";

	if (formatterParams.thousand !== false) {
		rgx = /(\d+)(\d{3})/;

		while (rgx.test(integer)){
			integer = integer.replace(rgx, "$1" + thousandSym + "$2");
		}
	}

	value = integer + decimal;
	
	if(sign === true){
		value = "(" + value  + ")";
		return after ? value + symbol : symbol + value;
	}else{
		return after ? sign + value + symbol : sign + symbol + value;
	}
}