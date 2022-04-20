export default function (cell, formatterParams, onRendered) {
	var DT = window.DateTime || luxon.DateTime;
	var inputFormat = formatterParams.inputFormat || "yyyy-MM-dd HH:mm:ss";
	var invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
	var suffix = typeof formatterParams.suffix !== "undefined" ? formatterParams.suffix : false;
	var unit = typeof formatterParams.unit !== "undefined" ? formatterParams.unit : "days";
	var humanize = typeof formatterParams.humanize !== "undefined" ? formatterParams.humanize : false;
	var date = typeof formatterParams.date !== "undefined" ? formatterParams.date : DT.now();
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

		if (newDatetime.isValid){
			if(humanize){
				return newDatetime.diff(date, unit).toHuman()  + (suffix ? " " + suffix : "");
			}else{
				return parseInt(newDatetime.diff(date, unit)[unit]) + (suffix ? " " + suffix : "");
			}
		} else {

			if (invalid === true) {
				return value;
			} else if (typeof invalid === "function") {
				return invalid(value);
			} else {
				return invalid;
			}
		}
	}else{
		console.error("Format Error - 'datetimediff' formatter is dependant on luxon.js");
	}
};