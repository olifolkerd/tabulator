var HtmlTableExport = function(table){
	this.table = table; //hold Tabulator object
	this.config = {};
};

HtmlTableExport.prototype.genereateTable = function(config){
	var headers = this.generateHeaderElements();
	var body = this.generateBodyElements();

	var table = document.createElement("table");
	table.appendChild(headers);
	table.appendChild(body);

	return table;
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


HtmlTableExport.prototype.generateBodyElements = function(){

	var bodyEl = document.createElement("tbody");

	var rows = this.table.rowManager.getDisplayRows();
	var columns = this.table.columnManager.columnsByIndex;

	rows.forEach(function(row){
		var rowEl = document.createElement("tr");
		var rowData = row.getData();

		switch(row.type){
			case "group":
			var cellEl = document.createElement("td");
			cellEl.colSpan = columns.length;
			cellEl.innerHTML = row.key;

			rowEl.appendChild(cellEl);
			break;

			case "row" :
			columns.forEach(function(column){
				var cellEl = document.createElement("td");

				var value = column.getFieldValue(rowData);

				switch(typeof value){
					case "object":
					value = JSON.stringify(value);
					break;

					case "undefined":
					case "null":
					value = "";
					break;

					default:
					value = value;
				}

				cellEl.innerHTML = value;

				rowEl.appendChild(cellEl);
			});
			break;
		}

		bodyEl.appendChild(rowEl);
	});

	return bodyEl;
}


HtmlTableExport.prototype.getHtml = function(active){
	var holder = document.createElement("div");

	holder.appendChild(this.genereateTable());

	return holder.innerHTML;
}


Tabulator.prototype.registerModule("htmlTableExport", HtmlTableExport);