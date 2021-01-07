import Module from './module.js';

class FrozenRows extends Module{

	constructor(table){
		super(table);

		this.topElement = document.createElement("div");
		this.rows = [];
		this.displayIndex = 0; //index in display pipeline
	}

	initialize(){
		this.rows = [];

		this.topElement.classList.add("tabulator-frozen-rows-holder");

		// this.table.columnManager.element.append(this.topElement);
		this.table.columnManager.getElement().insertBefore(this.topElement, this.table.columnManager.headersElement.nextSibling);
	}

	setDisplayIndex(index){
		this.displayIndex = index;
	}

	getDisplayIndex(){
		return this.displayIndex;
	}

	isFrozen(){
		return !!this.rows.length;
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

			this.table.rowManager.refreshActiveData("display");

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

			this.table.rowManager.refreshActiveData("display");

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
			rowEl.parentNode.removeChild(rowEl);

			this.rows.splice(index, 1);
		}
	}

	styleRows(row){
		var self = this;

		this.rows.forEach(function(row, i){
			self.table.rowManager.styleRow(row, i);
		});
	}
}

// Tabulator.prototype.registerModule("frozenRows", FrozenRows);
module.exports = FrozenRows;