var Mutator = function(table){
	this.table = table; //hold Tabulator object
};

//initialize column mutator
Mutator.prototype.initializeColumn = function(column){

	var config = {mutator:false, type:column.definition.mutateType};

	//set column mutator
	switch(typeof column.definition.mutator){
		case "string":
		if(self.mutators[column.definition.mutator]){
			config.mutator = self.mutators[column.definition.mutator]
		}else{
			console.warn("Mutator Error - No such mutator found, ignoring: ", column.definition.mutator);
		}
		break;

		case "function":
		config.mutator = column.definition.mutator;
		break;
	}

	if(config.mutator){
		column.extensions.mutate = config;
	}
};

//apply mutator to row
Mutator.prototype.transformRow = function(data){
	var self = this;

	self.table.columnManager.traverse(function(column){
		var field;

		if(column.extensions.mutate){

			field = column.getField();

			if(typeof data[field] != "undefined" && column.extensions.mutate.type != "edit"){
				data[field] = column.extensions.mutate.mutator(data[field], data, "data");
			}
		}
	});

	return data;
};

//apply mutator to new cell value
Mutator.prototype.transformCell = function(cell, value){
	return cell.column.extensions.mutate.mutator(value, cell.roww.getData(), "edit")
};

//default mutators
Mutator.prototype.mutators = {};

Tabulator.registerExtension("mutator", Mutator);