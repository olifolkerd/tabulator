export default function datetime(cell, formatterParams, onRendered) {
	var inputFormat = formatterParams.inputFormat || "YYYY-MM-DD hh:mm:ss";
	var invalid = typeof formatterParams.invalidPlaceholder !== "undefined" ? formatterParams.invalidPlaceholder : "";
	var suffix = typeof formatterParams.suffix !== "undefined" ? formatterParams.suffix : false;
	var unit = typeof formatterParams.unit !== "undefined" ? formatterParams.unit : undefined;
	var humanize = typeof formatterParams.humanize !== "undefined" ? formatterParams.humanize : false;
	var date = typeof formatterParams.date !== "undefined" ? formatterParams.date : moment();
	var value = cell.getValue();

	var newDatetime = moment(value, inputFormat);

	if (newDatetime.isValid()) {
		if(humanize){
			return moment.duration(newDatetime.diff(date)).humanize(suffix);
		}else{
			return newDatetime.diff(date, unit) + (suffix ? " " + suffix : "");
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
};