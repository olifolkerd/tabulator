var Accessor = function(table){
	this.table = table; //hold Tabulator object
};


//initialize column accessor
Accessor.prototype.initializeColumn = function(column){

	var config = {accessor:false, params:column.definition.accessorParams || {}};

	//set column accessor
	switch(typeof column.definition.accessor){
		case "string":
		if(this.accessors[column.definition.accessor]){
			config.accessor = this.accessors[column.definition.accessor]
		}else{
			console.warn("Accessor Error - No such accessor found, ignoring: ", column.definition.accessor);
		}
		break;

		case "function":
		config.accessor = column.definition.accessor;
		break;
	}

	if(config.accessor){
		column.extensions.accessor = config;
	}
},

//apply accessor to row
Accessor.prototype.transformRow = function(dataIn){
	var self = this;

	//clone data object with deep copy to isolate internal data from returned result
	var data = $.extend(true, {}, dataIn || {});

	self.table.columnManager.traverse(function(column){
		var field;

		if(column.extensions.accessor){
			field = column.getField();

			if(typeof data[field] != "undefined"){
				column.setFieldValue(data, column.extensions.accessor.accessor(column.getFieldValue(data), data, column.extensions.accessor.params));
			}
		}
	});

	return data;
},

//default accessors
Accessor.prototype.accessors = {};



Tabulator.registerExtension("accessor", Accessor);