export default function(cell, formatterParams, onRendered){
	var content = document.createElement("span");
	var row = cell.getRow();

	row.watchPosition((position) => {
		content.innerText = position;
	});
	
	return content;
}