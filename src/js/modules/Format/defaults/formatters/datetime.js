module.exports = function(cell, formatterParams, onRendered){
	var inputFormat = formatterParams.inputFormat || "YYYY-MM-DD hh:mm:ss";
	var	outputFormat = formatterParams.outputFormat || "DD/MM/YYYY hh:mm:ss";
	var	invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
	var value = cell.getValue();

	var newDatetime = moment(value, inputFormat);

	if(newDatetime.isValid()){
		return formatterParams.timezone ? newDatetime.tz(formatterParams.timezone).format(outputFormat) : newDatetime.format(outputFormat);
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