var Accessor = function(table){
	this.table = table; //hold Tabulator object
	this.allowedTypes = ["", "data", "download", "clipboard"] //list of accessor types
};


//initialize column accessor
Accessor.prototype.initializeColumn = function(column){
	var self = this,
	match = false,
	config = {};

	this.allowedTypes.forEach(function(type){
		var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
		accessor;

		if(column.definition[key]){
			accessor = self.lookupAccessor(column.definition[key]);

			if(accessor){
				match = true;

				config[key] = {
					accessor:accessor,
					params: column.definition[key + "Params"] || {},
				}
			}
		}
	});

	if(match){
		column.extensions.accessor = config;
	}
},

Accessor.prototype.lookupAccessor = function(value){
	var accessor = false;

	//set column accessor
	switch(typeof value){
		case "string":
		if(this.accessors[value]){
			accessor = this.accessors[value]
		}else{
			console.warn("Accessor Error - No such accessor found, ignoring: ", value);
		}
		break;

		case "function":
		accessor = value;
		break;
	}

	return accessor;
}


//apply accessor to row
Accessor.prototype.transformRow = function(dataIn, type){
	var self = this,
	key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1));

	//clone data object with deep copy to isolate internal data from returned result
	var data = $.extend(true, {}, dataIn || {});

	self.table.columnManager.traverse(function(column){
		var value, accessor;

		if(column.extensions.accessor){

			accessor = column.extensions.accessor[key] || column.extensions.accessor.accessor || false;

			if(accessor){
				value = column.getFieldValue(data);

				if(value != "undefined"){
					column.setFieldValue(data, accessor.accessor(value, data, type, accessor.params, column.getComponent()));
				}
			}
		}
	});

	return data;
},

//default accessors
Accessor.prototype.accessors = {};



Tabulator.registerExtension("accessor", Accessor);