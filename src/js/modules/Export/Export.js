import Module from '../../core/Module.js';

import ExportRow from './ExportRow.js';
import ExportColumn from './ExportColumn.js';

class Export extends Module{
	
	constructor(table){
		super(table);
		
		this.config = {};
		this.cloneTableStyle = true;
		this.colVisProp = "";
		
		this.registerTableOption("htmlOutputConfig", false); //html output config
		
		this.registerColumnOption("htmlOutput");
		this.registerColumnOption("titleHtmlOutput");
	}
	
	initialize(){
		this.registerTableFunction("getHtml", this.getHtml.bind(this));
	}
	
	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////
	
	
	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////
	
	generateExportList(config, style, range, colVisProp){
		this.cloneTableStyle = style;
		this.config = config || {};
		this.colVisProp = colVisProp;
		
		var headers = this.config.columnHeaders !== false ? this.headersToExportRows(this.generateColumnGroupHeaders()) : [];
		var body = this.bodyToExportRows(this.rowLookup(range));
		
		return headers.concat(body);
	}
	
	generateTable(config, style, range, colVisProp){
		var list = this.generateExportList(config, style, range, colVisProp);
		
		return this.generateTableElement(list);
	}
	
	rowLookup(range){
		var rows = [];
		
		if(typeof range == "function"){
			range.call(this.table).forEach((row) =>{
				row = this.table.rowManager.findRow(row);
				
				if(row){
					rows.push(row);
				}
			});
		}else{
			switch(range){
				case true:
				case "visible":
					rows = this.table.rowManager.getVisibleRows(false, true);
					break;
				
				case "all":
					rows = this.table.rowManager.rows;
					break;
				
				case "selected":
					rows = this.table.modules.selectRow.selectedRows;
					break;
				
				case "active":
				default:
					if(this.table.options.pagination){
						rows = this.table.rowManager.getDisplayRows(this.table.rowManager.displayRows.length - 2);
					}else{
						rows = this.table.rowManager.getDisplayRows();
					}
			}
		}
		
		return Object.assign([], rows);
	}
	
	generateColumnGroupHeaders(){
		var output = [];
		
		var columns = this.config.columnGroups !== false ? this.table.columnManager.columns : this.table.columnManager.columnsByIndex;
		
		columns.forEach((column) => {
			var colData = this.processColumnGroup(column);
			
			if(colData){
				output.push(colData);
			}
		});
		
		return output;
	}
	
	processColumnGroup(column){
		var subGroups = column.columns,
		maxDepth = 0,
		title = column.definition["title" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))] || column.definition.title;
		
		var groupData = {
			title:title,
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
	}
	
	columnVisCheck(column){
		var visProp = column.definition[this.colVisProp];
		
		if(typeof visProp === "function"){
			visProp = visProp.call(this.table, column.getComponent());
		}
		
		return visProp !== false && (column.visible || (!column.visible && visProp));
	}
	
	headersToExportRows(columns){
		var headers = [],
		headerDepth = 0,
		exportRows = [];
		
		function parseColumnGroup(column, level){
			
			var depth = headerDepth - level;
			
			if(typeof headers[level] === "undefined"){
				headers[level] = [];
			}
			
			column.height = column.subGroups ? 1 : (depth - column.depth) + 1;
			
			headers[level].push(column);
			
			if(column.height > 1){
				for(let i = 1; i < column.height; i ++){
					
					if(typeof headers[level + i] === "undefined"){
						headers[level + i] = [];
					}
					
					headers[level + i].push(false);
				}
			}
			
			if(column.width > 1){
				for(let i = 1; i < column.width; i ++){
					headers[level].push(false);
				}
			}
			
			if(column.subGroups){
				column.subGroups.forEach(function(subGroup){
					parseColumnGroup(subGroup, level+1);
				});
			}
		}
		
		//calculate maximum header depth
		columns.forEach(function(column){
			if(column.depth > headerDepth){
				headerDepth = column.depth;
			}
		});
		
		columns.forEach(function(column){
			parseColumnGroup(column,0);
		});
		
		headers.forEach((header) => {
			var columns = [];
			
			header.forEach((col) => {
				if(col){
					let title = typeof col.title === "undefined" ? "" : col.title;
					columns.push(new ExportColumn(title, col.column.getComponent(), col.width, col.height, col.depth));
				}else{
					columns.push(null);
				}
			});
			
			exportRows.push(new ExportRow("header", columns));
		});
		
		return exportRows;
	}
	
	bodyToExportRows(rows){
		
		var columns = [];
		var exportRows = [];
		
		this.table.columnManager.columnsByIndex.forEach((column) => {
			if (this.columnVisCheck(column)) {
				columns.push(column.getComponent());
			}
		});
		
		if(this.config.columnCalcs !== false && this.table.modExists("columnCalcs")){
			if(this.table.modules.columnCalcs.topInitialized){
				rows.unshift(this.table.modules.columnCalcs.topRow);
			}
			
			if(this.table.modules.columnCalcs.botInitialized){
				rows.push(this.table.modules.columnCalcs.botRow);
			}
		}
		
		rows = rows.filter((row) => {
			switch(row.type){
				case "group":
					return this.config.rowGroups !== false;
				
				case "calc":
					return this.config.columnCalcs !== false;
				
				case "row":
					return !(this.table.options.dataTree && this.config.dataTree === false && row.modules.dataTree.parent);
			}
			
			return true;
		});
		
		rows.forEach((row, i) => {
			var rowData = row.getData(this.colVisProp);
			var exportCols = [];
			var indent = 0;
			
			switch(row.type){
				case "group":
					indent = row.level;
					exportCols.push(new ExportColumn(row.key, row.getComponent(), columns.length, 1));
					break;
				
				case "calc" :
				case "row" :
					columns.forEach((col) => {
						exportCols.push(new ExportColumn(col._column.getFieldValue(rowData), col, 1, 1));
					});
				
					if(this.table.options.dataTree && this.config.dataTree !== false){
						indent = row.modules.dataTree.index;
					}
					break;
			}
			
			exportRows.push(new ExportRow(row.type, exportCols, row.getComponent(), indent));
		});
		
		return exportRows;
	}
	
	generateTableElement(list){
		var table = document.createElement("table"),
		headerEl = document.createElement("thead"),
		bodyEl = document.createElement("tbody"),
		styles = this.lookupTableStyles(),
		rowFormatter = this.table.options["rowFormatter" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))],
		setup = {};
		
		setup.rowFormatter = rowFormatter !== null ? rowFormatter : this.table.options.rowFormatter;
		
		if(this.table.options.dataTree &&this.config.dataTree !== false && this.table.modExists("columnCalcs")){
			setup.treeElementField = this.table.modules.dataTree.elementField;
		}
		
		//assign group header formatter
		setup.groupHeader = this.table.options["groupHeader" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))];
		
		if(setup.groupHeader && !Array.isArray(setup.groupHeader)){
			setup.groupHeader = [setup.groupHeader];
		}
		
		table.classList.add("tabulator-print-table");
		
		this.mapElementStyles(this.table.columnManager.getHeadersElement(), headerEl, ["border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);
		
		
		if(list.length > 1000){
			console.warn("It may take a long time to render an HTML table with more than 1000 rows");
		}
		
		list.forEach((row, i) => {
			let rowEl;
			
			switch(row.type){
				case "header":
					headerEl.appendChild(this.generateHeaderElement(row, setup, styles));
					break;
				
				case "group":
					bodyEl.appendChild(this.generateGroupElement(row, setup, styles));
					break;
				
				case "calc":
					bodyEl.appendChild(this.generateCalcElement(row, setup, styles));
					break;
				
				case "row":
					rowEl = this.generateRowElement(row, setup, styles);
				
					this.mapElementStyles(((i % 2) && styles.evenRow) ? styles.evenRow : styles.oddRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
					bodyEl.appendChild(rowEl);
					break;
			}
		});
		
		if(headerEl.innerHTML){
			table.appendChild(headerEl);
		}
		
		table.appendChild(bodyEl);
		
		
		this.mapElementStyles(this.table.element, table, ["border-top", "border-left", "border-right", "border-bottom"]);
		return table;
	}
	
	lookupTableStyles(){
		var styles = {};
		
		//lookup row styles
		if(this.cloneTableStyle && window.getComputedStyle){
			styles.oddRow = this.table.element.querySelector(".tabulator-row-odd:not(.tabulator-group):not(.tabulator-calcs)");
			styles.evenRow = this.table.element.querySelector(".tabulator-row-even:not(.tabulator-group):not(.tabulator-calcs)");
			styles.calcRow = this.table.element.querySelector(".tabulator-row.tabulator-calcs");
			styles.firstRow = this.table.element.querySelector(".tabulator-row:not(.tabulator-group):not(.tabulator-calcs)");
			styles.firstGroup = this.table.element.getElementsByClassName("tabulator-group")[0];
			
			if(styles.firstRow){
				styles.styleCells = styles.firstRow.getElementsByClassName("tabulator-cell");
				styles.firstCell = styles.styleCells[0];
				styles.lastCell = styles.styleCells[styles.styleCells.length - 1];
			}
		}
		
		return styles;
	}
	
	generateHeaderElement(row, setup, styles){
		var rowEl = document.createElement("tr");
		
		row.columns.forEach((column) => {
			if(column){
				var cellEl = document.createElement("th");
				var classNames = column.component._column.definition.cssClass ? column.component._column.definition.cssClass.split(" ") : [];
				
				cellEl.colSpan = column.width;
				cellEl.rowSpan = column.height;
				
				cellEl.innerHTML = column.value;
				
				if(this.cloneTableStyle){
					cellEl.style.boxSizing = "border-box";
				}
				
				classNames.forEach(function(className) {
					cellEl.classList.add(className);
				});
				
				this.mapElementStyles(column.component.getElement(), cellEl, ["text-align", "border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);
				this.mapElementStyles(column.component._column.contentElement, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);
				
				if(column.component._column.visible){
					this.mapElementStyles(column.component.getElement(), cellEl, ["width"]);
				}else{
					if(column.component._column.definition.width){
						cellEl.style.width = column.component._column.definition.width + "px";
					}
				}
				
				if(column.component._column.parent){
					this.mapElementStyles(column.component._column.parent.groupElement, cellEl, ["border-top"]);
				}
				
				rowEl.appendChild(cellEl);
			}
		});
		
		return rowEl;
	}
	
	generateGroupElement(row, setup, styles){
		
		var rowEl = document.createElement("tr"),
		cellEl = document.createElement("td"),
		group = row.columns[0];
		
		rowEl.classList.add("tabulator-print-table-row");
		
		if(setup.groupHeader && setup.groupHeader[row.indent]){
			group.value = setup.groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
		}else{
			if(setup.groupHeader !== false){
				group.value = row.component._group.generator(group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
			}
		}
		
		cellEl.colSpan = group.width;
		cellEl.innerHTML = group.value;
		
		rowEl.classList.add("tabulator-print-table-group");
		rowEl.classList.add("tabulator-group-level-" + row.indent);
		
		if(group.component.isVisible()){
			rowEl.classList.add("tabulator-group-visible");
		}
		
		this.mapElementStyles(styles.firstGroup, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
		this.mapElementStyles(styles.firstGroup, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);
		
		rowEl.appendChild(cellEl);
		
		return rowEl;
	}
	
	generateCalcElement(row, setup, styles){
		var rowEl = this.generateRowElement(row, setup, styles);
		
		rowEl.classList.add("tabulator-print-table-calcs");
		this.mapElementStyles(styles.calcRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
		
		return rowEl;
	}
	
	generateRowElement(row, setup, styles){
		var rowEl = document.createElement("tr");
		
		rowEl.classList.add("tabulator-print-table-row");
		
		row.columns.forEach((col, i) => {
			if(col){
				var cellEl = document.createElement("td"),
				column = col.component._column,
				index = this.table.columnManager.findColumnIndex(column),
				value = col.value,
				cellStyle;
				
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
					getType:function(){
						return "cell";
					},
					getColumn:function(){
						return column.getComponent();
					},
					getData:function(){
						return row.component.getData();
					},
					getRow:function(){
						return row.component;
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
				
				if(this.table.modExists("format") && this.config.formatCells !== false){
					value = this.table.modules.format.formatExportValue(cellWrapper, this.colVisProp);
				}else{
					switch(typeof value){
						case "object":
							value = value !== null ? JSON.stringify(value) : "";
							break;
						
						case "undefined":
							value = "";
							break;
					}
				}
				
				if(value instanceof Node){
					cellEl.appendChild(value);
				}else{
					cellEl.innerHTML = value;
				}
				
				cellStyle = styles.styleCells && styles.styleCells[index] ? styles.styleCells[index] : styles.firstCell;
				
				if(cellStyle){
					this.mapElementStyles(cellStyle, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom", "border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "text-align"]);
					
					if(column.definition.align){
						cellEl.style.textAlign = column.definition.align;
					}
				}
				
				if(this.table.options.dataTree && this.config.dataTree !== false){
					if((setup.treeElementField && setup.treeElementField == column.field) || (!setup.treeElementField && i == 0)){
						if(row.component._row.modules.dataTree.controlEl){
							cellEl.insertBefore(row.component._row.modules.dataTree.controlEl.cloneNode(true), cellEl.firstChild);
						}
						if(row.component._row.modules.dataTree.branchEl){
							cellEl.insertBefore(row.component._row.modules.dataTree.branchEl.cloneNode(true), cellEl.firstChild);
						}
					}
				}
				
				rowEl.appendChild(cellEl);
				
				if(cellWrapper.modules.format && cellWrapper.modules.format.renderedCallback){
					cellWrapper.modules.format.renderedCallback();
				}
			}
		});
		
		if(setup.rowFormatter && row.type === "row" && this.config.formatCells !== false){
			let formatComponent = Object.assign(row.component);

			formatComponent.getElement = function(){return rowEl;};

			setup.rowFormatter(row.component);
		}
		
		return rowEl;
	}
	
	generateHTMLTable(list){
		var holder = document.createElement("div");
		
		holder.appendChild(this.generateTableElement(list));
		
		return holder.innerHTML;
	}
	
	getHtml(visible, style, config, colVisProp){
		var list = this.generateExportList(config || this.table.options.htmlOutputConfig, style, visible, colVisProp || "htmlOutput");
		
		return this.generateHTMLTable(list);
	}
	
	mapElementStyles(from, to, props){
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
					if(!to.style[lookup[prop]]){
						to.style[lookup[prop]] = fromStyle.getPropertyValue(prop);
					}
				});
			}
		}
	}
}

Export.moduleName = "export";

export default Export;
