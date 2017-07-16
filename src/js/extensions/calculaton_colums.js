var ColumnCalcs = function(table){
	this.table = table; //hold Tabulator object
	this.topCalcs = [];
	this.botCalcs = [];
	this.genColumn = false;

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
		}
	}

},

//generate top stats row
ColumnCalcs.prototype.generateTopRow = function(data){
	return this.generateRow("top", data);
},

//generate bottom stats row
ColumnCalcs.prototype.generateBottomRow = function(data){
	return this.generateRow("bottom", data);
},

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

			//set field name of mock column
			self.genColumn.setField(column.getField());

			//generate cell and assign to correct column
			var cell = new Cell(self.genColumn, row);
			cell.column = column;

			cell.setWidth(column.getWidth());

			column.cells.push(cell);
			cells.push(cell);
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

			rowData[column.getField()] = column.extensions.columnCalcs[type](values, data, column.extensions.columnCalcs[type + "Params"]);
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

//default calculations
ColumnCalcs.prototype.calculations = {
	"avg":function(values, data, calcData){
		var output = 0;

		if(values.length){
			output = values.reduce(function(sum, value){
				return sum + value;
			});

			output = output / value.length;
		}

		return output;
	},
	"max":function(values, data, calcData){
		var output = null;

		values.forEach(function(value){
			if(value > output || output === null){
				output = value;
			}
		});

		return output !== null ? output : "";
	},
	"min":function(values, data, calcData){
		var output = null;

		values.forEach(function(value){
			if(value < output || output === null){
				output = value;
			}
		});

		return output !== null ? output : "";
	},
	"sum":function(values, data, calcData){
		var output = 0;

		if(values.length){
			output = values.reduce(function(sum, value){
				return sum + value;
			});
		}

		return output;
	},
	"count":function(values, data, calcData){
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