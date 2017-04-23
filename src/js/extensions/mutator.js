var Mutator = function(table){

	var extension = {
		table:table, //hold Tabulator object

		//initialize column mutator
		initializeColumn:function(column){

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
		},

		//apply mutator to row
		transformRow(data){
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
		},

		//default mutators
		mutators:{},
	}

	return extension;
}

Tabulator.registerExtension("mutator", Mutator);