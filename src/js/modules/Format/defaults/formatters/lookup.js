export default function (cell, formatterParams, onRendered) {
	var value = cell.getValue();

	if (typeof formatterParams[value] === "undefined") {
		console.warn('Missing display value for ' + value);
		return value;
	}

	return formatterParams[value];
};