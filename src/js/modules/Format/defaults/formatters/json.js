export default function(cell, formatterParams, onRendered){
	var indent = formatterParams.indent || "\t",
	multiline = typeof formatterParams.multiline === "undefined" ? true : formatterParams.multiline,
	replacer = formatterParams.replacer || null,
	value = cell.getValue();
	
	if(multiline){
		cell.getElement().style.whiteSpace = "pre-wrap";
	}

	return JSON.stringify(value, replacer, indent);
}