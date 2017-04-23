var Filter = function(table){

	var extension = {
		table:table, //hold Tabulator object

		filters:[],
		headerFilters:[],

		//initialize column header filter
		initializeColumn:function(column){

		},

		//set the header filters
		setHeaderFilter:function(){

		},

		//set standard filters
		setFilter:function(field, type, value){

		},

		//add filter to array
		addFilter:function(field, type, value){

		},

		//get all filters
		getFilter:function(){

		},

		//remove filter from array
		removeFilter:function(field, type, value){

		},

		//clear filters
		clearFilter:function(all){

		},

		//clear header filters
		clearHeaderFilter:function(all){

		},

		//filter row array
		filterData:function(rows){

		},

		//filter individual row
		filterRow:function(row){

		},

	}

	return extension;
}

Tabulator.registerExtension("filter", Filter);