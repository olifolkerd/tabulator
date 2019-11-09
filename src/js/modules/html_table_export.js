var HtmlTableExport = function(table){
	this.table = table; //hold Tabulator object
	this.config = {};
	this.cloneTableStyle = true;
	this.colVisProp = "";
};

HtmlTableExport.prototype.genereateTable = function(config, style, visible, colVisProp){
	this.cloneTableStyle = style;
	this.config = config || {};
	this.colVisProp = colVisProp;

	var headers = this.generateHeaderElements();
	var body = this.generateBodyElements(visible);

	var table = document.createElement("table");
	table.classList.add("tabulator-print-table");
	table.appendChild(headers);
	table.appendChild(body);

	this.mapElementStyles(this.table.element, table, ["border-top", "border-left", "border-right", "border-bottom"]);

	return table;
};


HtmlTableExport.prototype.generateColumnGroupHeaders = function(){
	var output = [];

	var columns = this.config.columnGroups !== false ? this.table.columnManager.columns : this.table.columnManager.columnsByIndex;

	columns.forEach((column) => {
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
		if(this.columnVisCheck(column)){
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

	rows.forEach((row) => {
		var rowEl = document.createElement("tr");

		this.mapElementStyles(this.table.columnManager.getHeadersElement(), headerEl, ["border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);

		row.forEach((column) => {
			var cellEl = document.createElement("th");
			var classNames = column.column.definition.cssClass ? column.column.definition.cssClass.split(" ") : [];

			cellEl.colSpan = column.width;
			cellEl.rowSpan = column.height;

			cellEl.innerHTML = column.column.definition.title;

			if(this.cloneTableStyle){
				cellEl.style.boxSizing = "border-box";
			}

			classNames.forEach(function(className) {
				cellEl.classList.add(className);
			});

			this.mapElementStyles(column.column.getElement(), cellEl, ["text-align", "border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);
			this.mapElementStyles(column.column.contentElement, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);

			if(column.column.visible){
				this.mapElementStyles(column.column.getElement(), cellEl, ["width"]);
			}else{
				if(column.column.definition.width){
					cellEl.style.width = column.column.definition.width + "px";
				}
			}

			if(column.column.parent){
				this.mapElementStyles(column.column.parent.groupElement, cellEl, ["border-top"]);
			}

			rowEl.appendChild(cellEl);
		});

		headerEl.appendChild(rowEl);
	});

	return headerEl;
};

HtmlTableExport.prototype.generateBodyElements = function(visible){
	var oddRow, evenRow, calcRow, firstRow, firstCell, firstGroup, lastCell, styleCells, styleRow;

	//lookup row styles
	if(this.cloneTableStyle && window.getComputedStyle){
		oddRow = this.table.element.querySelector(".tabulator-row-odd:not(.tabulator-group):not(.tabulator-calcs)");
		evenRow = this.table.element.querySelector(".tabulator-row-even:not(.tabulator-group):not(.tabulator-calcs)");
		calcRow = this.table.element.querySelector(".tabulator-row.tabulator-calcs");
		firstRow = this.table.element.querySelector(".tabulator-row:not(.tabulator-group):not(.tabulator-calcs)");
		firstGroup = this.table.element.getElementsByClassName("tabulator-group")[0];

		if(firstRow){
			styleCells = firstRow.getElementsByClassName("tabulator-cell");
			firstCell = styleCells[0];
			lastCell = styleCells[styleCells.length - 1];
		}
	}

	var bodyEl = document.createElement("tbody");

	var rows = visible ? this.table.rowManager.getVisibleRows(true) : this.table.rowManager.getDisplayRows();
	var columns = [];

	if(this.config.columnCalcs !== false && this.table.modExists("columnCalcs")){
		if(this.table.modules.columnCalcs.topInitialized){
			rows.unshift(this.table.modules.columnCalcs.topRow);
		}

		if(this.table.modules.columnCalcs.botInitialized){
			rows.push(this.table.modules.columnCalcs.botRow);
		}
	}

	this.table.columnManager.columnsByIndex.forEach((column) => {
		if (this.columnVisCheck(column)) {
			columns.push(column);
		}
	});

	rows = rows.filter((row) => {
		switch(row.type){
			case "group":
			return this.config.rowGroups !== false;
			break;

			case "calc":
			return this.config.columnCalcs !== false;
			break;
		}

		return true;
	});

	if(rows.length > 1000){
		console.warn("It may take a long time to render an HTML table with more than 1000 rows");
	}

	rows.forEach((row, i) => {
		var rowData = row.getData();

		var rowEl = document.createElement("tr");
		rowEl.classList.add("tabulator-print-table-row");

		switch(row.type){
			case "group":
			var cellEl = document.createElement("td");
			cellEl.colSpan = columns.length;
			cellEl.innerHTML = row.key;

			rowEl.classList.add("tabulator-print-table-group");

			this.mapElementStyles(firstGroup, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
			this.mapElementStyles(firstGroup, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);
			rowEl.appendChild(cellEl);
			break;

			case "calc" :
			rowEl.classList.add("tabulator-print-table-calcs");

			case "row" :
			columns.forEach((column) =>{
				var cellEl = document.createElement("td");

				var value = column.getFieldValue(rowData);

				var cellWrapper = {
					modules:{},
					getValue:function(){
						return value;
					},
					getField:function(){
						return column.definition.field;
					},
					getElement:function(){
						return cellEl;
					},
					getColumn:function(){
						return column.getComponent();
					},
					getData:function(){
						return rowData;
					},
					getRow:function(){
						return row.getComponent();
					},
					getComponent:function(){
						return cellWrapper;
					},
					column:column,
				};

				var classNames = column.definition.cssClass ? column.definition.cssClass.split(" ") : [];

				classNames.forEach(function(className) {
					cellEl.classList.add(className);
				});

				if(this.table.modExists("format")){
					value = this.table.modules.format.formatValue(cellWrapper);
				}else{
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
				}

				if(value instanceof Node){
					cellEl.appendChild(value);
				}else{
					cellEl.innerHTML = value;
				}

				if(firstCell){
					this.mapElementStyles(firstCell, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom", "border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "text-align"]);
				}

				rowEl.appendChild(cellEl);
			});


			styleRow = row.type == "calc" ? calcRow : (((i % 2) && evenRow) ? evenRow : oddRow);

			this.mapElementStyles(styleRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
			break;
		}

		bodyEl.appendChild(rowEl);
	});

	return bodyEl;
};

HtmlTableExport.prototype.columnVisCheck = function(column){
	return column.definition[this.colVisProp] !== false && (column.visible || (!column.visible && column.definition[this.colVisProp]));
};


HtmlTableExport.prototype.getHtml = function(visible, style, config){
	var holder = document.createElement("div");

	holder.appendChild(this.genereateTable(config || this.table.options.htmlOutputConfig, style, visible, "htmlOutput"));

	return holder.innerHTML;
};


HtmlTableExport.prototype.mapElementStyles = function(from, to, props){
	if(this.cloneTableStyle && from && to){

		var lookup = {
			"background-color" : "backgroundColor",
			"color" : "fontColor",
			"width" : "width",
			"font-weight" : "fontWeight",
			"font-family" : "fontFamily",
			"font-size" : "fontSize",
			"text-align" : "textAlign",
			"border-top" : "borderTop",
			"border-left" : "borderLeft",
			"border-right" : "borderRight",
			"border-bottom" : "borderBottom",
			"padding-top" : "paddingTop",
			"padding-left" : "paddingLeft",
			"padding-right" : "paddingRight",
			"padding-bottom" : "paddingBottom",
		};

		if(window.getComputedStyle){
			var fromStyle = window.getComputedStyle(from);

			props.forEach(function(prop){
				to.style[lookup[prop]] = fromStyle.getPropertyValue(prop);
			});
		}
	}
};


Tabulator.prototype.registerModule("htmlTableExport", HtmlTableExport);
