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
		
		var newDatetime = inputFormat === "iso" ? DT.fromISO(String(value)) : DT.fromFormat(String(value), inputFormat);

		if (newDatetime.isValid){
			if(humanize){
				// return moment.duration(newDatetime.diff(date)).humanize(suffix);
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