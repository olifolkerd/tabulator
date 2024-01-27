export default function(cell, formatterParams, onRendered){
	var content = document.createElement("span");
	var row = cell.getRow();
	var table = cell.getTable();

	row.watchPosition((position) => {
		if (formatterParams.relativeToPage) {
			position += table.modules.page.getPageSize() * (table.modules.page.getPage() - 1);
		}
		content.innerText = position;
	});
	
	return content;
}
