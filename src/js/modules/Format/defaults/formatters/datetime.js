export default function(cell, formatterParams, onRendered){
	var inputFormat = formatterParams.inputFormat || "yyyy-MM-dd HH:mm:ss";
	var	outputFormat = formatterParams.outputFormat || "dd/MM/yyyy HH:mm:ss";
	var	invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
	var value = cell.getValue();

	var newDatetime = (window.DateTime || luxon.DateTime).fromFormat(value, inputFormat);

	if(newDatetime.isValid){

		if(formatterParams.timezone){
			newDatetime = newDatetime.shiftTimezone(formatterParams.timezone);
		}

		return newDatetime.toFormat(outputFormat);
	}else{

		if(invalid === true){
			return value;
		}else if(typeof invalid === "function"){
			return invalid(value);
		}else{
			return invalid;
		}
	}
};