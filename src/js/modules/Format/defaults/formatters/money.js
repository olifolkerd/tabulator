export default function(cell, formatterParams, onRendered){
	var floatVal = parseFloat(cell.getValue()),
	number, integer, decimal, rgx;

	var decimalSym = formatterParams.decimal || ".";
	var thousandSym = formatterParams.thousand || ",";
	var symbol = formatterParams.symbol || "";
	var after = !!formatterParams.symbolAfter;
	var precision = typeof formatterParams.precision !== "undefined" ? formatterParams.precision : 2;

	if(isNaN(floatVal)){
		return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
	}

	number = precision !== false ? floatVal.toFixed(precision) : floatVal;
	number = String(number).split(".");

	integer = number[0];
	decimal = number.length > 1 ? decimalSym + number[1] : "";

	rgx = /(\d+)(\d{3})/;

	while (rgx.test(integer)){
		integer = integer.replace(rgx, "$1" + thousandSym + "$2");
	}

	return after ? integer + decimal + symbol : symbol + integer + decimal;
};