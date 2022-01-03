export default function(pageSize, currentRow, currentPage, totalRows, totalPages){
	var el = document.createElement("span"),
	showingEl = document.createElement("span"),
	valueEl = document.createElement("span"),
	ofEl = document.createElement("span"),
	totalEl = document.createElement("span"),
	rowsEl = document.createElement("span");
	
	this.table.modules.localize.langBind("pagination|counter|showing", (value) => {
		showingEl.innerHTML = value;
	});
	
	valueEl.innerHTML = " " + currentRow + "-" + Math.min((currentRow + pageSize - 1), totalRows) + " ";
	
	this.table.modules.localize.langBind("pagination|counter|of", (value) => {
		ofEl.innerHTML = value;
	});
	
	totalEl.innerHTML = " " + totalRows + " ";
	
	this.table.modules.localize.langBind("pagination|counter|rows", (value) => {
		rowsEl.innerHTML = value;
	});
	
	el.appendChild(showingEl);
	el.appendChild(valueEl);
	el.appendChild(ofEl);
	el.appendChild(totalEl);
	el.appendChild(rowsEl);
	
	return el;
};