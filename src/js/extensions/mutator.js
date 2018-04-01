var Mutator = function(table){
	this.table = table; //hold Tabulator object
	this.allowedTypes = ["", "data", "edit", "clipboard"] //list of muatation types
};

//initialize column mutator
Mutator.prototype.initializeColumn = function(column){
	var self = this,
	match = false,
	config = {};

	this.mapDepricatedFunctionality(column);

	this.allowedTypes.forEach(function(type){
		var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
		mutator;

		if(column.definition[key]){
			mutator = self.lookupMutator(column.definition[key]);

			if(mutator){
				match = true;

				config[key] = {
					mutator:mutator,
					params: column.definition[key + "Params"] || {},
				}
			}
		}
	});

	if(match){
		column.extensions.mutate = config;
	}
};

Mutator.prototype.mapDepricatedFunctionality = function(column){
	var key = "";

	if(column.definition.mutateType){

		if(column.definition.mutateType != "all"){
			key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1));

			column.defintion[key] = column.definition.mutator;
			delete column.definition.mutator;

			console.warn("The %cmutateType='" + column.definition.mutateType + "'' %coption has been depricated and will be removed in version 4.0, use the %c " + key + "%c option instead", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;")

		}else{
			console.warn("The %cmutateType='all'' %coption has been depricated and will be removed in version 4.0, it is no longer needed", "font-weight:bold;", "font-weight:regular;")
		}
	}
}

Mutator.prototype.lookupMutator = function(value){
	var mutator = false;

	//set column mutator
	switch(typeof value){
		case "string":
		if(this.mutators[value]){
			mutator = this.mutators[value]
		}else{
			console.warn("Mutator Error - No such mutator found, ignoring: ", value);
		}
		break;

		case "function":
		mutator = value;
		break;
	}

	return mutator;
}

//apply mutator to row
Mutator.prototype.transformRow = function(data, type){
	var self = this,
	key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1));

	self.table.columnManager.traverse(function(column){
		var mutator;

		if(column.extensions.mutate){

			mutator = column.extensions.mutate[key] || column.extensions.mutate.mutator || false;

			if(mutator){
				column.setFieldValue(data, mutator.mutator(column.getFieldValue(data), data, type, mutator.params, column.getComponent()));
			}
		}
	});

	return data;
};

//apply mutator to new cell value
Mutator.prototype.transformCell = function(cell, value){
	var mutator = cell.column.extensions.mutate.mutatorEdit || cell.column.extensions.mutate.mutator || false;

	if(mutator){
		return mutator.mutator(value, cell.row.getData(), "edit", mutator.params, cell.getComponent())
	}else{
		return value;
	}
};

//default mutators
Mutator.prototype.mutators = {};

Tabulator.registerExtension("mutator", Mutator);