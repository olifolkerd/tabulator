var HtmlTableExport = function(table){
	this.table = table; //hold Tabulator object
	this.config = {};
};

HtmlTableExport.prototype.genereateTable = function(config){
	var columns = this.generateHeaderElements();

	var table = document.createElement("table");
	table.appendChild(columns);
	table.border = 1;
	document.body.appendChild(table);

	console.log("cols", columns.innerHTML)
}


HtmlTableExport.prototype.generateColumnGroupHeaders = function(){
	var output = [];

	this.table.columnManager.columns.forEach((column) => {
		var colData = this.processColumnGroup(column);

		if(colData){
			output.push(colData);
		}
	});

	return output;
};

HtmlTableExport.prototype.processColumnGroup = function(column){
	var subGroups = column.columns,
	maxDepth = 0;

	var groupData = {
		title:column.definition.title,
		column:column,
		depth:1,
	};

	if(subGroups.length){
		groupData.subGroups = [];
		groupData.width = 0;

		subGroups.forEach((subGroup) => {
			var subGroupData = this.processColumnGroup(subGroup);

			if(subGroupData){
				groupData.width += subGroupData.width;
				groupData.subGroups.push(subGroupData);

				if(subGroupData.depth > maxDepth){
					maxDepth = subGroupData.depth;
				}
			}
		});

		groupData.depth += maxDepth;

		if(!groupData.width){
			return false;
		}
	}else{
		if(column.field && column.visible){
			groupData.width = 1;
		}else{
			return false;
		}
	}

	return groupData;
};


HtmlTableExport.prototype.groupHeadersToRows = function(columns){

	var headers = [], headerDepth = 0;

	function parseColumnGroup(column, level){

		var depth = headerDepth - level;

		if(typeof headers[level] === "undefined"){
			headers[level] = [];
		}

		column.height = column.subGroups ? 1 : (depth - column.depth) + 1;

		headers[level].push(column);

		if(column.subGroups){
			column.subGroups.forEach(function(subGroup){
				parseColumnGroup(subGroup, level+1);
			});
		}
	}

	//calculate maximum header debth
	columns.forEach(function(column){
		if(column.depth > headerDepth){
			headerDepth = column.depth;
		}
	});

	columns.forEach(function(column){
		parseColumnGroup(column,0);
	});

	return headers;
};


HtmlTableExport.prototype.generateHeaderElements = function(){

	var headerEl = document.createElement("thead");

	var rows = this.groupHeadersToRows(this.generateColumnGroupHeaders());


	console.log("headers", rows)

	rows.forEach(function(row){
		var rowEl = document.createElement("tr");

		row.forEach(function(column){
			var cellEl = document.createElement("th");

			cellEl.colSpan = column.width;
			cellEl.rowSpan = column.height;

			cellEl.innerHTML = column.column.definition.title;

			rowEl.appendChild(cellEl);
		});

		headerEl.appendChild(rowEl);
	});

	return headerEl;
}

HtmlTableExport.prototype.getHtml = function(active){
	this.genereateTable();
	// var data = this.table.rowManager.getData(active),
	// columns = [],
	// header = "",
	// body = "",
	// table = "";

	// //build header row
	// this.table.columnManager.getColumns().forEach(function(column){
	// 	var def = column.getDefinition();

	// 	if(column.visible && !def.hideInHtml){
	// 		header += `<th>${(def.title || "")}</th>`;
	// 		columns.push(column);
	// 	}
	// });

	// //build body rows
	// data.forEach(function(rowData){
	// 	var row = "";

	// 	columns.forEach(function(column){
	// 		var value = column.getFieldValue(rowData);

	// 		if(typeof value === "undefined" || value === null){
	// 			value = ":";
	// 		}

	// 		row += `<td>${value}</td>`;
	// 	});

	// 	body += `<tr>${row}</tr>`;
	// });

	// //build table
	// table = `<table>
	// <thead>
	// <tr>${header}</tr>
	// </thead>
	// <tbody>${body}</tbody>
	// </table>`;

	// return table;
}


Tabulator.prototype.registerModule("htmlTableExport", HtmlTableExport);