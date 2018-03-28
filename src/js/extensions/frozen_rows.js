var FrozenRows = function(table){
	this.table = table; //hold Tabulator object
	this.topElement = $("<div class='tabulator-frozen-rows-holder'></div>");
	this.rows = [];
	this.displayIndex = 0; //index in display pipeline
};

FrozenRows.prototype.initialize = function(){
	this.rows = [];
	this.table.columnManager.element.append(this.topElement);
};

FrozenRows.prototype.setDisplayIndex = function(index){
	this.displayIndex = index;
}

FrozenRows.prototype.getDisplayIndex = function(){
	return this.displayIndex;
}

FrozenRows.prototype.isFrozen = function(){
	return !!this.rows.length;
}

//filter frozen rows out of display data
FrozenRows.prototype.getRows = function(rows){
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
};

FrozenRows.prototype.freezeRow = function(row){
	if(!row.extensions.frozen){
		row.extensions.frozen = true;
		this.topElement.append(row.getElement());
		row.initialize();
		row.normalizeHeight();
		this.table.rowManager.adjustTableSize();

		this.rows.push(row);

		this.table.rowManager.refreshActiveData("display");

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

		this.rows.splice(index, 1);

		this.table.rowManager.refreshActiveData("display");

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