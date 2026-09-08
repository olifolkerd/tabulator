import Module from '../../core/Module.js';
import extensions from './extensions/extensions.js';

export default class ResponsiveLayout extends Module{

	static moduleName = "responsiveLayout";
	static moduleExtensions = extensions;

	constructor(table){
		super(table);

		this.columns = [];
		this.hiddenColumns = [];
		this.mode = "";
		this.index = 0;
		this.collapseFormatter = [];
		this.collapseStartOpen = true;
		this.collapseHandleColumn = false;
		this.deferredRows = new Set();

		this.registerTableOption("responsiveLayout", false); //responsive layout flags
		this.registerTableOption("responsiveLayoutCollapseStartOpen", true); //start showing collapsed data
		this.registerTableOption("responsiveLayoutCollapseUseFormatters", true); //responsive layout collapse formatter
		this.registerTableOption("responsiveLayoutCollapseFormatter", false); //responsive layout collapse formatter

		this.registerColumnOption("responsive");
	}

	//generate responsive columns list
	initialize(){
		if(this.table.options.responsiveLayout){
			this.subscribe("column-layout", this.initializeColumn.bind(this));
			this.subscribe("column-show", this.updateColumnVisibility.bind(this));
			this.subscribe("column-hide", this.updateColumnVisibility.bind(this));
			this.subscribe("columns-loaded", this.initializeResponsivity.bind(this));
			this.subscribe("column-moved", this.initializeResponsivity.bind(this));
			this.subscribe("column-add", this.initializeResponsivity.bind(this));
			this.subscribe("column-delete", this.initializeResponsivity.bind(this));

			this.subscribe("table-redrawing", this.tableRedraw.bind(this));
			
			//this.mode is not set until initializeResponsivity
			if(this.isCollapseMode(this.table.options.responsiveLayout)){
				this.subscribe("row-data-changed", this.generateCollapsedRowContent.bind(this));
				this.subscribe("row-init", this.initializeRow.bind(this));
				this.subscribe("row-layout", this.layoutRow.bind(this));

				if(this.isEditableMode(this.table.options.responsiveLayout)){
					this.subscribe("row-responsive-toggled", this.rowResponsiveToggled.bind(this));
					this.subscribe("edit-editor-clear", this.editorCleared.bind(this));
				}
			}
		}
	}

	isCollapseMode(mode = this.mode){
		return mode === "collapse" || mode === "collapseEditable";
	}

	isEditableMode(mode = this.mode){
		return mode === "collapseEditable";
	}

	tableRedraw(force){
		if(["fitColumns", "fitDataStretch"].indexOf(this.layoutMode()) === -1){
			if(!force){
				this.update();
			}
		}
	}

	initializeResponsivity(){
		var columns = [];

		this.mode = this.table.options.responsiveLayout;
		this.collapseFormatter = this.table.options.responsiveLayoutCollapseFormatter || this.formatCollapsedData;
		this.collapseStartOpen = this.table.options.responsiveLayoutCollapseStartOpen;
		this.hiddenColumns = [];

		if(this.collapseFormatter){
			this.collapseFormatter = this.collapseFormatter.bind(this.table);
		}

		//determine level of responsivity for each column
		this.table.columnManager.columnsByIndex.forEach((column, i) => {
			if(column.modules.responsive){
				if(column.modules.responsive.order && column.modules.responsive.visible){
					column.modules.responsive.index = i;
					columns.push(column);

					if(!column.visible && this.isCollapseMode()){
						this.hiddenColumns.push(column);
					}
				}
			}
		});

		//sort list by responsivity
		columns = columns.reverse();
		columns = columns.sort((a, b) => {
			var diff = b.modules.responsive.order - a.modules.responsive.order;
			return diff || (b.modules.responsive.index - a.modules.responsive.index);
		});

		this.columns = columns;

		if(this.isCollapseMode()){
			this.generateCollapsedContent();
		}

		//assign collapse column
		for (let col of this.table.columnManager.columnsByIndex){
			if(col.definition.formatter == "responsiveCollapse"){
				this.collapseHandleColumn = col;
				break;
			}
		}

		if(this.collapseHandleColumn){
			if(this.hiddenColumns.length){
				this.collapseHandleColumn.show();
			}else{
				this.collapseHandleColumn.hide();
			}
		}
	}

	//define layout information
	initializeColumn(column){
		var def = column.getDefinition();

		column.modules.responsive = {order: typeof def.responsive === "undefined" ? 1 : def.responsive, visible:def.visible === false ? false : true};
	}

	initializeRow(row){
		var el;

		if(row.type !== "calc"){
			el = document.createElement("div");
			el.classList.add("tabulator-responsive-collapse");

			row.modules.responsiveLayout = {
				element:el,
				open:this.collapseStartOpen,
			};

			if(!this.collapseStartOpen){
				el.style.display = 'none';
			}
		}
	}

	layoutRow(row){
		var rowEl = row.getElement();

		if(row.modules.responsiveLayout){
			rowEl.appendChild(row.modules.responsiveLayout.element);
			this.generateCollapsedRowContent(row);
		}
	}

	//update column visibility
	updateColumnVisibility(column, responsiveToggle){
		if(!responsiveToggle && column.modules.responsive){
			column.modules.responsive.visible = column.visible;
			this.initializeResponsivity();
		}
	}

	hideColumn(column){
		var colCount = this.hiddenColumns.length;

		column.hide(false, true);

		if(this.isCollapseMode()){
			this.hiddenColumns.unshift(column);
			this.generateCollapsedContent();

			if(this.collapseHandleColumn && !colCount){
				this.collapseHandleColumn.show();
			}
		}
	}

	showColumn(column){
		var index;

		if(this.isEditableMode()){
			this.restoreColumnCells(column);
		}

		column.show(false, true);
		//set column width to prevent calculation loops on uninitialized columns
		column.setWidth(column.getWidth());

		if(this.isCollapseMode()){
			index = this.hiddenColumns.indexOf(column);

			if(index > -1){
				this.hiddenColumns.splice(index, 1);
			}

			this.generateCollapsedContent();

			if(this.collapseHandleColumn && !this.hiddenColumns.length){
				this.collapseHandleColumn.hide();
			}
		}
	}

	//redraw columns to fit space
	update(){
		var working = true;

		while(working){

			let width = this.table.modules.layout.getMode() == "fitColumns" ? this.table.columnManager.getFlexBaseWidth() : this.table.columnManager.getWidth();

			let diff = (this.table.options.headerVisible ? this.table.columnManager.element.clientWidth : this.table.element.clientWidth) - width;

			if(diff < 0){
				//table is too wide
				let column = this.columns[this.index];

				if(column){
					this.hideColumn(column);
					this.index ++;
				}else{
					working = false;
				}

			}else{

				//table has spare space
				let column = this.columns[this.index -1];

				if(column){
					if(diff > 0){
						if(diff >= column.getWidth()){
							this.showColumn(column);
							this.index --;
						}else{
							working = false;
						}
					}else{
						working = false;
					}
				}else{
					working = false;
				}
			}

			if(!this.table.rowManager.activeRowsCount){
				this.table.rowManager.renderEmptyScroll();
			}
		}
	}

	generateCollapsedContent(){
		var rows = this.table.rowManager.getDisplayRows();

		rows.forEach((row) => {
			this.generateCollapsedRowContent(row);
		});
	}

	generateCollapsedRowContent(row){
		var el, contents;

		if(row.modules.responsiveLayout){
			//a rebuild would tear an open editor out of the DOM, so defer it
			if(this.isEditableMode() && this.rowIsEditing(row)){
				this.deferredRows.add(row);
				return;
			}

			this.deferredRows.delete(row);

			el = row.modules.responsiveLayout.element;

			//restore first, so the teardown below moves cells rather than orphaning them
			if(this.isEditableMode()){
				this.restoreCollapsedCells(row);
			}

			while(el.firstChild) el.removeChild(el.firstChild);

			contents = this.collapseFormatter(this.generateCollapsedRowData(row));
			if(contents){
				el.appendChild(contents);
			}
			row.calcHeight(true);
		}
	}

	generateCollapsedRowData(row){
		var data = row.getData(),
		output = [],
		mockCellComponent;

		this.hiddenColumns.forEach((column) => {
			var value = column.getFieldValue(data);

			if(column.definition.title && column.field){
				if(this.isEditableMode()){
					let cell = row.getCell(column.field);

					if(cell){
						output.push({
							field: column.field,
							title: column.definition.title,
							value: this.collapseCell(cell)
						});
					}

					return;
				}

				if(column.modules.format && this.table.options.responsiveLayoutCollapseUseFormatters){

					mockCellComponent = {
						value:false,
						data:{},
						getValue:function(){
							return value;
						},
						getData:function(){
							return data;
						},
						getType:function(){
							return "cell";
						},
						getElement:function(){
							return document.createElement("div");
						},
						getRow:function(){
							return row.getComponent();
						},
						getColumn:function(){
							return column.getComponent();
						},
						getTable:() => {
							return this.table;
						},
					};

					function onRendered(callback){
						callback();
					}

					output.push({
						field: column.field,
						title: column.definition.title,
						value: column.modules.format.formatter.call(this.table.modules.format, mockCellComponent, column.modules.format.params, onRendered)
					});
				}else{
					output.push({
						field: column.field,
						title: column.definition.title,
						value: value
					});
				}
			}
		});

		return output;
	}

	editorCleared(){
		var rows = this.deferredRows;

		if(rows.size){
			this.deferredRows = new Set();
			rows.forEach((row) => {
				this.generateCollapsedRowContent(row);
			});
		}
	}

	rowIsEditing(row){
		var currentCell = this.table.modExists("edit") ? this.table.modules.edit.currentCell : false;

		return !!currentCell && currentCell.row === row;
	}

	//an editor left open in a closed container would hold the redraw block
	rowResponsiveToggled(row, open){
		if(!open && this.rowIsEditing(row)){
			this.table.modules.edit.cancelEdit();
		}
	}

	//only visibility is touched here; sizing is left to the stylesheet
	collapseCell(cell){
		var element = cell.getElement();

		cell.show();

		return element;
	}

	restoreColumnCells(column){
		column.cells.forEach((cell) => {
			this.restoreCell(cell);
		});
	}

	restoreCollapsedCells(row){
		row.cells.forEach((cell) => {
			this.restoreCell(cell);
		});
	}

	restoreCell(cell){
		var config = cell.row.modules.responsiveLayout,
		cells = cell.row.cells,
		anchor = null,
		rowEl;

		//cell.element, not getElement(), which would force a lazy render
		if(!config || !config.element || !cell.element || !config.element.contains(cell.element)){
			return;
		}

		rowEl = cell.row.getElement();

		for(let i = cells.indexOf(cell) + 1; i < cells.length; i++){
			if(cells[i].element && cells[i].element.parentNode === rowEl){
				anchor = cells[i].element;
				break;
			}
		}

		//the collapse container is always the row's last child
		if(!anchor && config.element.parentNode === rowEl){
			anchor = config.element;
		}

		if(anchor){
			rowEl.insertBefore(cell.element, anchor);
		}else{
			rowEl.appendChild(cell.element);
		}

		//the column may have been shown while the cell was away
		if(cell.column.visible){
			cell.show();
		}else{
			cell.hide();
		}
	}

	formatCollapsedData(data){
		var list = document.createElement("table");

		data.forEach((item) => {
			var row = document.createElement("tr");
			var titleData = document.createElement("td");
			var valueData = document.createElement("td");
			var node_content;

			var titleHighlight = document.createElement("strong");
			titleData.appendChild(titleHighlight);
			
			this.modules.localize.bind("columns|" + item.field, function(text){
				titleHighlight.innerHTML = text || item.title;
			});

			if(item.value instanceof Node){
				node_content = document.createElement("div");
				node_content.appendChild(item.value);
				valueData.appendChild(node_content);
			}else{
				valueData.innerHTML = item.value;
			}

			row.appendChild(titleData);
			row.appendChild(valueData);
			list.appendChild(row);
		});

		return Object.keys(data).length ? list : "";
	}
}