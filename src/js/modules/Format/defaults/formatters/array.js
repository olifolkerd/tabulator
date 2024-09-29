export default function(cell, formatterParams, onRendered){
	var delimiter = formatterParams.delimiter || ",",
	value = cell.getValue();
	return Array.isArray(value) ? value.join(delimiter) : value;
}