/* Tabulator v4.2.5 (c) Oliver Folkerd */

var HtmlTableExport = function HtmlTableExport(table) {
	this.table = table; //hold Tabulator object
};

HtmlTableExport.prototype.getHtml = function (active) {
	var data = this.table.rowManager.getData(active),
	    columns = [],
	    header = "",
	    body = "",
	    table = "";

	//build header row
	this.table.columnManager.getColumns().forEach(function (column) {
		var def = column.getDefinition();

		if (column.visible && !def.hideInHtml) {
			header += "<th>" + (def.title || "") + "</th>";
			columns.push(column);
		}
	});

	//build body rows
	data.forEach(function (rowData) {
		var row = "";

		columns.forEach(function (column) {
			var value = column.getFieldValue(rowData);

			if (typeof value === "undefined" || value === null) {
				value = ":";
			}

			row += "<td>" + value + "</td>";
		});

		body += "<tr>" + row + "</tr>";
	});

	//build table
	table = "<table>\n\t<thead>\n\t<tr>" + header + "</tr>\n\t</thead>\n\t<tbody>" + body + "</tbody>\n\t</table>";

	return table;
};

Tabulator.prototype.registerModule("htmlTableExport", HtmlTableExport);