var Filter = function(table){

	var extension = {
		table:table, //hold Tabulator object

		filterList:[],
		headerFilters:[],

		changed:false,

		//initialize column header filter
		initializeColumn:function(column){

		},

		//check if the filters has changed since last use
		hasChanged(){
			var changed = this.changed;
			this.changed = false;
			return changed;
		},

		//set the header filters
		setHeaderFilter:function(){

		},

		//set standard filters
		setFilter:function(field, type, value){
			var self = this;

			self.filterList = [];

			if(!Array.isArray(field)){
				field = [{field:field, type:type, value:value}];
			}

			self.addFilter(field);

		},

		//add filter to array
		addFilter:function(field, type, value){
			var self = this;

			if(!Array.isArray(field)){
				field = [{field:field, type:type, value:value}];
			}

			field.forEach(function(filter){

				var filterFunc = false;

				if(typeof filter.field == "function"){
					filterFunc = filter.field;
				}else{
					if(self.filters[filter.type]){
						filterFunc = function(data){
							return self.filters[filter.type](filter.value, data[filter.field]);
						}
					}else{
						console.warn("Filter Error - No such filter type found, ignoring: ", filter.type);
					}
				}

				if(filterFunc){
					filter.func = filterFunc;
					self.filterList.push(filter);

					self.changed = true;
				}
			});

		},

		//get all filters
		getFilter:function(){
			var self = this,
			output = [];

			self.filterList.forEach(function(filter){
				output.push({field:filter.field, type:filter.type, value:filter.value});
			});

			return output;
		},

		//remove filter from array
		removeFilter:function(field, type, value){
			var self = this;

			if(!Array.isArray(field)){
				field = [{field:field, type:type, value:value}];
			}

			field.forEach(function(filter){
				var index = -1;

				if(typeof filter.field == "object"){
					index = self.filterList.findIndex(function(element){
						return filter === element;
					});
				}else{
					index = self.filterList.findIndex(function(element){
						return filter.field === element.field && filter.type === element.type  && filter.value === element.value
					});
				}

				if(index > -1){
					self.filterList.splice(index, 1);
					self.changed = true;
				}else{
					console.warn("Filter Error - No matching filter type found, ignoring: ", filter.type);
				}

			});

		},

		//clear filters
		clearFilter:function(all){
			this.filterList = [];

			if(all){
				this.headerFilters = [];
			}

			this.changed = true;
		},

		//clear header filters
		clearHeaderFilter:function(){
			this.headerFilters = [];
			self.changed = true;
		},

		//filter row array
		filter:function(){
			var self = this,
			activeRows = [];

			if(self.filterList.length){

				self.table.rowManager.rows.forEach(function(row){
					console.log("filter", self.filterRow(row))
					if(self.filterRow(row)){
						activeRows.push(row);
					}
				});

				self.table.rowManager.activeRows = activeRows;

			}else{
				self.table.rowManager.activeRows = self.table.rowManager.rows;
			}
		},

		//filter individual row
		filterRow:function(row){
			var self = this,
			match = true,
			data = row.getData();

			self.filterList.forEach(function(filter){
				if(!filter.func(data)){
					match = false;
				}
			});

			return match;
		},


		//list of available filters
		filters:{
			"=":function(filterVal, rowVal){
				return rowVal == filterVal ? true : false;
			},

			"<":function(filterVal, rowVal){
				return rowVal < filterVal ? true : false;
			},

			"<=":function(filterVal, rowVal){
				return rowVal <= filterVal ? true : false;
			},

			">":function(filterVal, rowVal){
				return rowVal > filterVal ? true : false;
			},

			">=":function(filterVal, rowVal){
				return rowVal >= filterVal ? true : false;
			},

			"!=":function(filterVal, rowVal){
				return rowVal != filterVal ? true : false;
			},

			"like":function(filterVal, rowVal){
				if(filterVal === null){
					return rowVal === filterVal ? true : false;
				}else{
					return rowVal.toLowerCase().indexOf(filterVal.toLowerCase()) > -1 ? true : false;
				}
			},
		},

	}

	return extension;
}

Tabulator.registerExtension("filter", Filter);