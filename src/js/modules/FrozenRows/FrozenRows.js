import Module from '../../core/Module.js';

export default class FrozenRows extends Module{

	static moduleName = "frozenRows";

	constructor(table){
		super(table);

		this.topElement = document.createElement("div");
		this.rows = [];

		//register component functions
		this.registerComponentFunction("row", "freeze", this.freezeRow.bind(this));
		this.registerComponentFunction("row", "unfreeze", this.unfreezeRow.bind(this));
		this.registerComponentFunction("row", "isFrozen", this.isRowFrozen.bind(this));

		//register table options
		this.registerTableOption("frozenRowsField", "id"); //field to choose frozen rows by
		this.registerTableOption("frozenRows", false); //holder for frozen row identifiers
	}

	initialize(){
		var	fragment = document.createDocumentFragment();
		
		this.rows = [];

		this.topElement.classList.add("tabulator-frozen-rows-holder");
		
		fragment.appendChild(document.createElement("br"));
		fragment.appendChild(this.topElement);

		// this.table.columnManager.element.append(this.topElement);
		this.table.columnManager.getContentsElement().insertBefore(fragment, this.table.columnManager.headersElement.nextSibling);

		this.subscribe("row-deleting", this.detachRow.bind(this));
		this.subscribe("rows-visible", this.visibleRows.bind(this));

		this.registerDisplayHandler(this.getRows.bind(this), 10);

		if(this.table.options.frozenRows){
			this.subscribe("data-processed", this.initializeRows.bind(this));
			this.subscribe("row-added", this.initializeRow.bind(this));
			this.subscribe("table-redrawing", this.resizeHolderWidth.bind(this));
			this.subscribe("column-resized", this.resizeHolderWidth.bind(this));
			this.subscribe("column-show", this.resizeHolderWidth.bind(this));
			this.subscribe("column-hide", this.resizeHolderWidth.bind(this));
		}

		this.resizeHolderWidth();
	}

	resizeHolderWidth(){
		this.topElement.style.minWidth = this.table.columnManager.headersElement.offsetWidth + "px";
	}

	initializeRows(){
		this.table.rowManager.getRows().forEach((row) => {
			this.initializeRow(row);
		});
	}

	initializeRow(row){
		var frozenRows = this.table.options.frozenRows,
		rowType = typeof frozenRows;

		if(rowType === "number"){
			if(row.getPosition() && (row.getPosition() + this.rows.length) <= frozenRows){
				this.freezeRow(row);
			}
		}else if(rowType === "function"){
			if(frozenRows.call(this.table, row.getComponent())){
				this.freezeRow(row);
			}
		}else if(Array.isArray(frozenRows)){
			if(frozenRows.includes(row.data[this.options("frozenRowsField")])){
				this.freezeRow(row);
			}
		}
	}

	isRowFrozen(row){
		var index = this.rows.indexOf(row);
		return index > -1;
	}

	isFrozen(){
		return !!this.rows.length;
	}

	visibleRows(viewable, rows){
		this.rows.forEach((row) => {
			rows.push(row);
		});

		return rows;
	}

	//filter frozen rows out of display data
	getRows(rows){
		var output = rows.slice(0);

		this.rows.forEach(function(row){
			var index = output.indexOf(row);

			if(index > -1){
				output.splice(index, 1);
			}
		});

		return output;
	}

	freezeRow(row){
		if(!row.modules.frozen){
			row.modules.frozen = true;
			this.topElement.appendChild(row.getElement());
			row.initialize();
			row.normalizeHeight();
		
			this.rows.push(row);

			this.refreshData(false, "display");

			this.table.rowManager.adjustTableSize();

			this.styleRows();

		}else{
			console.warn("Freeze Error - Row is already frozen");
		}
	}

	unfreezeRow(row){
		if(row.modules.frozen){

			row.modules.frozen = false;

			this.detachRow(row);

			this.table.rowManager.adjustTableSize();

			this.refreshData(false, "display");

			if(this.rows.length){
				this.styleRows();
			}

		}else{
			console.warn("Freeze Error - Row is already unfrozen");
		}
	}

	detachRow(row){
		var index = this.rows.indexOf(row);

		if(index > -1){
			var rowEl = row.getElement();

			if(rowEl.parentNode){
				rowEl.parentNode.removeChild(rowEl);
			}

			this.rows.splice(index, 1);
		}
	}

	styleRows(row){
		this.rows.forEach((row, i) => {
			this.table.rowManager.styleRow(row, i);
		});
	}
}