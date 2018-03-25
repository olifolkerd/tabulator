var Clipboard = function(table){
	this.table = table;
	this.mode = "table";
	this.showHeaders = true;
};

Clipboard.prototype.initialize = function(){
	var self = this;

	this.table.element.on("copy", function(e){
		console.log("copy");
		e.preventDefault();
	 	e.originalEvent.clipboardData.setData('text/plain', self.generateContent()); // REMOVE FIRST CONDITIONAL ONCE DIALOG MIGRATION IS COMEPLETE
	 });
}


Clipboard.prototype.copy = function(mode, showHeaders){
	var range, sel;

	this.mode = mode || "table";
	this.showHeaders = showHeaders === false ? false : true;

	if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
		range = document.createRange();
		range.selectNodeContents(this.table.element[0]);
		sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
		textRange = document.body.createTextRange();
		textRange.moveToElementText(this.table.element[0]);
		textRange.select();
	}

	document.execCommand('copy');

	if(sel){
		sel.removeAllRanges();
	}
}

Clipboard.prototype.generateContent = function(){
	var data = [],
	headers = [],
	columns = this.table.columnManager.columnsByIndex,
	rows;

	if(this.showHeaders){
		columns.forEach(function(column){
			headers.push(column.definition.title);
		});

		data.push(headers);
	}

	switch(this.mode){

		case "table":
		default:

		rows = this.table.rowManager.getRows();


		rows.forEach(function(row){
			var rowArray = [],
			rowData = row.getData();

			columns.forEach(function(column){
				var value = column.getFieldValue(rowData);

				if(typeof value == "undefined"){
					value = ""
				}

				value = typeof value == "undefined" ? "" : value.toString();

				if(value.match(/\r|\n/)){
					value = value.split('"').join('""');
					value = '"' + value + '"';
				}

				rowArray.push(value);
			});

			data.push(rowArray);

		});
	}

	return this.arrayToString(data);
}

Clipboard.prototype.arrayToString = function(data){
	var output = [];

	data.forEach(function(row){
		output.push(row.join("\t"));
	});

	return output.join("\n");
}


Tabulator.registerExtension("clipboard", Clipboard);
