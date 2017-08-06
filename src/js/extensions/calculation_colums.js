var ColumnCalcs = function(table){
	this.table = table; //hold Tabulator object
	this.topCalcs = [];
	this.botCalcs = [];
	this.genColumn = false;
	this.topElement = $("<div class='tabulator-calcs-holder'></div>");
	this.botElement = $("<div class='tabulator-calcs-holder'></div>");
	this.topRow = false;
	this.botRow = false;
	this.topInitialized = false;
	this.botInitialized = false;

	this.initialize();
};

ColumnCalcs.prototype.initialize = function(){
	this.genColumn = new Column({field:"value"}, this);
};

//dummy functions to handle being mock column manager
ColumnCalcs.prototype.registerColumnField = function(){};

//initialize column calcs
ColumnCalcs.prototype.initializeColumn = function(column){
	var def = column.definition

	var config = {
		topCalcParams:def.topCalcParams || {},
		botCalcParams:def.bottomCalcParams || {},
	};

	if(def.topCalc){

		switch(typeof def.topCalc){
			case "string":
			if(this.calculations[def.topCalc]){
				config.topCalc = this.calculations[def.topCalc]
			}else{
				console.warn("Column Calc Error - No such calculation found, ignoring: ", def.topCalc);
			}
			break;

			case "function":
			config.topCalc = def.topCalc;
			break

		}

		if(config.topCalc){
			column.extensions.columnCalcs = config;
			this.topCalcs.push(column);

			if(!this.table.options.groupBy){
				this.initializeTopRow();
			}
		}

	}

	if(def.bottomCalc){
		switch(typeof def.bottomCalc){
			case "string":
			if(this.calculations[def.bottomCalc]){
				config.botCalc = this.calculations[def.bottomCalc]
			}else{
				console.warn("Column Calc Error - No such calculation found, ignoring: ", def.bottomCalc);
			}
			break;

			case "function":
			config.botCalc = def.bottomCalc;
			break

		}

		if(config.botCalc){
			column.extensions.columnCalcs = config;
			this.botCalcs.push(column);

			if(!this.table.options.groupBy){
				this.initializeBottomRow();
			}
		}
	}

};

ColumnCalcs.prototype.initializeTopRow = function(){
	if(!this.topInitialized){
		this.table.columnManager.element.append(this.topElement);
		this.topInitialized = true;
	}
};

ColumnCalcs.prototype.initializeBottomRow = function(){
	if(!this.botInitialized){
		this.table.footerManager.prepend(this.botElement);
		this.botInitialized = true;
	}
};


ColumnCalcs.prototype.scrollHorizontal = function(left){
	var hozAdjust = 0,
	scrollWidth = this.table.columnManager.element[0].scrollWidth - this.table.element.innerWidth();

	if(this.botInitialized){
		this.botRow.getElement().css("margin-left", -left);
	}
};


ColumnCalcs.prototype.recalc = function(rows){
	var data, row;

	if(this.topInitialized || this.botInitialized){
		data = this.rowsToData(rows);

		if(this.topInitialized){
			row = this.generateRow("top", this.rowsToData(rows))
			this.topRow = row;
			this.topElement.empty();
			this.topElement.append(row.getElement());
			row.initialize(true);
		}

		if(this.botInitialized){
			row = this.generateRow("bottom", this.rowsToData(rows))
			this.botRow = row;
			this.botElement.empty();
			this.botElement.append(row.getElement());
			row.initialize(true);
		}

		this.table.rowManager.adjustTableSize();

		//set resizable handles
		if(this.table.extExists("frozenColumns")){
			this.table.extensions.frozenColumns.layout();
		}
	}
};


//generate top stats row
ColumnCalcs.prototype.generateTopRow = function(rows){
	return this.generateRow("top", this.rowsToData(rows));
};
//generate bottom stats row
ColumnCalcs.prototype.generateBottomRow = function(rows){
	return this.generateRow("bottom", this.rowsToData(rows));
};

ColumnCalcs.prototype.rowsToData = function(rows){
	var data = [];

	rows.forEach(function(row){
		data.push(row.getData());
	});

	return data;
};

//generate stats row
ColumnCalcs.prototype.generateRow = function(pos, data){
	var self = this,
	rowData = this.generateRowData(pos, data),
	row = new Row(rowData, this);

	row.getElement().addClass("tabulator-calcs").addClass("tabulator-calcs-" + pos);
	row.type = "calc";

	row.generateCells = function(){

		var cells = [];

		self.table.columnManager.columnsByIndex.forEach(function(column){

			if(column.visible){
				//set field name of mock column
				self.genColumn.setField(column.getField());
				self.genColumn.hozAlign = column.hozAlign;

				//generate cell and assign to correct column
				var cell = new Cell(self.genColumn, row);
				cell.column = column;

				cell.setWidth(column.getWidth());

				column.cells.push(cell);
				cells.push(cell);
			}
		});

		this.cells = cells;
	}

	return row;
};

//generate stats row
ColumnCalcs.prototype.generateRowData = function(pos, data){
	var rowData = {},
	calcs = pos == "top" ? this.topCalcs : this.botCalcs,
	type = pos == "top" ? "topCalc" : "botCalc";

	calcs.forEach(function(column){
		var values = [];

		if(column.extensions.columnCalcs && column.extensions.columnCalcs[type]){
			data.forEach(function(item){
				values.push(column.getFieldValue(item));
			});

			column.setFieldValue(rowData, column.extensions.columnCalcs[type](values, data, column.extensions.columnCalcs[type + "Params"]));
		}
	});

	return rowData;
};

ColumnCalcs.prototype.hasTopCalcs = function(){
	return	!!(this.topCalcs.length);
},

ColumnCalcs.prototype.hasBottomCalcs = function(){
	return	!!(this.botCalcs.length);
},

//handle table redraw
ColumnCalcs.prototype.redraw = function(){
	if(this.topRow){
		this.topRow.normalizeHeight(true);
	}
	if(this.botRow){
		this.botRow.normalizeHeight(true);
	}
};

//default calculations
ColumnCalcs.prototype.calculations = {
	"avg":function(values, data, calcParams){
		var output = 0,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : 2

		if(values.length){
			output = values.reduce(function(sum, value){
				return sum + value;
			});

			output = output / values.length;

			output = precision !== false ? output.toFixed(precision) : output;
		}

		return parseFloat(output).toString();
	},
	"max":function(values, data, calcParams){
		var output = null;

		values.forEach(function(value){
			if(value > output || output === null){
				output = value;
			}
		});

		return output !== null ? output : "";
	},
	"min":function(values, data, calcParams){
		var output = null;

		values.forEach(function(value){
			if(value < output || output === null){
				output = value;
			}
		});

		return output !== null ? output : "";
	},
	"sum":function(values, data, calcParams){
		var output = 0;

		if(values.length){
			values.forEach(function(value){
				output += !isNaN(value) ? Number(value) : 0;
			});
		}

		return output;
	},
	"concat":function(values, data, calcParams){
		var output = 0;

		if(values.length){
			output = values.reduce(function(sum, value){
				return String(sum) + String(value);
			});
		}

		return output;
	},
	"count":function(values, data, calcParams){
		var output = 0;

		if(values.length){
			values.forEach(function(value){
				if(value){
					output ++;
				}
			});
		}

		return output;
	},
};



Tabulator.registerExtension("columnCalcs", ColumnCalcs);