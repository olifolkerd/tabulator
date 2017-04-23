var Accessor = function(table){

	var extension = {
		table:table, //hold Tabulator object

		//initialize column accessor
		initializeColumn:function(column){

			var config = {accessor:false};

			//set column accessor
			switch(typeof column.definition.accessor){
				case "string":
				if(self.accessors[column.definition.accessor]){
					config.accessor = self.accessors[column.definition.accessor]
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
		transformRow(dataIn){
			var self = this;

			//clone data object with deep copy to isolate internal data from returned result
			var data = $.extend(true, {}, dataIn || {});

			self.table.columnManager.traverse(function(column){
				var field;

				if(column.extensions.accessor){
					field = column.getField();

					if(typeof data[field] != "undefined"){
						data[field] = column.extensions.accessor.accessor(data[field], data);
					}
				}
			});

			return data;
		},

		//default accessors
		accessors:{},
	}

	return extension;
}

Tabulator.registerExtension("accessor", Accessor);