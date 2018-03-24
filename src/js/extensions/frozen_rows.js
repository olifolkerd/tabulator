var FrozenRows = function(table){
	this.table = table; //hold Tabulator object
	this.topElement = $("<div class='tabulator-frozen-rows-holder'></div>");
	this.rows = [];
};

FrozenRows.prototype.initialize = function(){
	this.rows = [];
	this.table.columnManager.element.append(this.topElement);
};

FrozenRows.prototype.filterFrozenRows = function(){
	var self = this,
	frozen = [];

	self.table.rowManager.activeRows.forEach(function(row, i){
		if(row.extensions.frozen == true){
			frozen.unshift(i);
		}
	})

	frozen.forEach(function(index){
		self.table.rowManager.activeRows.splice(index, 1);
	});
};

FrozenRows.prototype.freezeRow = function(row){
	if(!row.extensions.frozen){
		row.extensions.frozen = true;
		this.topElement.append(row.getElement());
		row.initialize();
		row.normalizeHeight();
		this.table.rowManager.adjustTableSize();
		this.table.rowManager.refreshActiveData("display");

		this.rows.push(row);

		this.styleRows();
	}else{
		console.warn("Freeze Error - Row is already frozen");
	}
};

FrozenRows.prototype.unfreezeRow = function(row){
	var index = this.rows.indexOf(row);

	if(row.extensions.frozen){

		row.extensions.frozen = false;
		row.getElement().detach();
		this.table.rowManager.adjustTableSize();
		this.table.rowManager.refreshActiveData("display");

		this.rows.splice(index, 1);

		if(this.rows.length){
			this.styleRows();
		}

	}else{
		console.warn("Freeze Error - Row is already unfrozen");
	}
};

FrozenRows.prototype.styleRows = function(row){
	var self = this;

	this.rows.forEach(function(row, i){
		self.table.rowManager.styleRow(row, i)
	});
}


Tabulator.registerExtension("frozenRows", FrozenRows);