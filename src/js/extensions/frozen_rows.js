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

	self.table.rowManager.displayRows.forEach(function(row, i){
		if(row.extensions.frozen == true){
			frozen.unshift(i);
		}
	})

	frozen.forEach(function(index){
		self.table.rowManager.displayRows.splice(index, 1);
	});
};

FrozenRows.prototype.freezeRow = function(row){
	row.extensions.frozen = true;
	this.topElement.append(row.getElement());
	this.table.rowManager.adjustTableSize();
	this.table.rowManager.refreshActiveData();

	this.rows.push(row);

	this.styleRows();
};

FrozenRows.prototype.unfreezeRow = function(row){
	var index = this.rows.indexOf(row);

	row.extensions.frozen = false;
	row.getElement().detach();
	this.table.rowManager.adjustTableSize();
	this.table.rowManager.refreshActiveData();

	this.rows.splice(index, 1);

	if(this.rows.length){
		this.styleRows();
	}
};

FrozenRows.prototype.styleRows = function(row){
	var self = this;
	console.log("r", this.rows.length);
	this.rows.forEach(function(row, i){
		console.log("sr", i)
		self.table.rowManager.styleRow(row, i)
	});
}


Tabulator.registerExtension("frozenRows", FrozenRows);