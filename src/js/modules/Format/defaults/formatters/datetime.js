export default function(cell, formatterParams, onRendered){
	var DT = window.DateTime || luxon.DateTime;
	var inputFormat = formatterParams.inputFormat || "yyyy-MM-dd HH:mm:ss";
	var	outputFormat = formatterParams.outputFormat || "dd/MM/yyyy HH:mm:ss";
	var	invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
	var value = cell.getValue();

	if(typeof DT != "undefined"){
		var newDatetime;

		if(DT.isDateTime(value)){
			newDatetime = value;
		}else if(inputFormat === "iso"){
			newDatetime = DT.fromISO(String(value));
		}else{
			newDatetime = DT.fromFormat(String(value), inputFormat);
		}

		if(newDatetime.isValid){
			if(formatterParams.timezone){
				newDatetime = newDatetime.setZone(formatterParams.timezone);
			}

			return newDatetime.toFormat(outputFormat);
		}else{
			if(invalid === true || !value){
				return value;
			}else if(typeof invalid === "function"){
				return invalid(value);
			}else{
				return invalid;
			}
		}
	}else{
		console.error("Format Error - 'datetime' formatter is dependant on luxon.js");
	}
}