import Module from '../../core/Module.js';

class FrozenRows extends Module{

	constructor(table){
		super(table);

		this.topElement = document.createElement("div");
		this.rows = [];

		//register component functions
		this.registerComponentFunction("row", "freeze", this.freezeRow.bind(this));
		this.registerComponentFunction("row", "unfreeze", this.unfreezeRow.bind(this));
		this.registerComponentFunction("row", "isFrozen", this.isRowFrozen.bind(this));
	}

	initialize(){
		this.rows = [];

		this.topElement.classList.add("tabulator-frozen-rows-holder");

		// this.table.columnManager.element.append(this.topElement);
		this.table.columnManager.getElement().insertBefore(this.topElement, this.table.columnManager.headersElement.nextSibling);

		this.subscribe("row-deleting", this.detachRow.bind(this));
		this.subscribe("rows-visible", this.visibleRows.bind(this));

		this.registerDisplayHandler(this.getRows.bind(this), 10);
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
		var self = this,
		frozen = [],
		output = rows.slice(0);

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
			this.table.rowManager.adjustTableSize();

			this.rows.push(row);

			this.refreshData(false, "display")

			this.styleRows();

		}else{
			console.warn("Freeze Error - Row is already frozen");
		}
	}

	unfreezeRow(row){
		var index = this.rows.indexOf(row);

		if(row.modules.frozen){

			row.modules.frozen = false;

			this.detachRow(row);

			this.table.rowManager.adjustTableSize();

			this.refreshData(false, "display")

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

FrozenRows.moduleName = "frozenRows";

export default FrozenRows;