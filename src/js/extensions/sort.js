var Sort = function(table){
 	this.table = table; //hold Tabulator object
 	this.sortList = []; //holder current sort
 	this.changed = false; //has the sort changed since last render
 };

//initialize column header for sorting
Sort.prototype.initializeColumn = function(column, content){
	var self = this,
	sorter = false;


	switch(typeof column.definition.sorter){
		case "string":
		if(self.sorters[column.definition.sorter]){
			sorter = self.sorters[column.definition.sorter];
		}else{
			console.warn("Sort Error - No such sorter found: ", column.definition.sorter);
		}
		break;

		case "function":
		sorter = column.definition.sorter;
		break;
	}


	column.extensions.sort = {sorter:sorter, dir:"none", params:column.definition.sorterParams || {}};

	if(column.definition.headerSort !== false){

		column.element.addClass("tabulator-sortable");

		//create sorter arrow
		content.append($("<div class='tabulator-arrow'></div>"));

		//sort on click
		column.element.on("click", function(){
			if(column.extensions.sort){
				if(column.extensions.sort.dir == "asc"){
					self.setSort(column, "desc");
				}else{
					self.setSort(column, "asc");
				}

				self.table.rowManager.sorterRefresh();
			}
		});
	}
};

//check if the sorters have changed since last use
Sort.prototype.hasChanged = function(){
	var changed = this.changed;
	this.changed = false;
	return changed;
};

//return current sorters
Sort.prototype.getSort = function(){
	var self = this,
	sorters = [];

	self.sortList.forEach(function(item){
		if(item.column){
			sorters.push({column:item.column.getComponent(), field:item.column.getField(), dir:item.dir});
		}
	});

	return sorters;
};

//change sort list and trigger sort
Sort.prototype.setSort = function(sortList, dir){
	var self = this,
	newSortList = [];

	if(!Array.isArray(sortList)){
		sortList = [{column: sortList, dir:dir}];
	}

	sortList.forEach(function(item){
		var column;

		column = self.table.columnManager.findColumn(item.column);

		if(column){
			item.column = column;
			newSortList.push(item);
			self.changed = true;
		}else{
			console.warn("Sort Warning - Sort field does not exist and is being ignored: ", item.column);
		}

	});

	self.sortList = newSortList;
};

//clear sorters
Sort.prototype.clear = function(){
	this.setSort([]);
},

//find appropriate sorter for column
Sort.prototype.findSorter = function(column){
	var row = this.table.rowManager.activeRows[0],
	sorter = "string",
	field, value;

	if(row){
		row = row.getData();
		field = column.getField();

		if(field){

			value = column.getFieldValue(row);

			switch(typeof value){
				case "undefined":
				sorter = "string";
				break;

				case "boolean":
				sorter = "boolean";
				break;

				default:
				if(!isNaN(value) && value !== ""){
					sorter = "number";
				}else{
					if(value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+$/i)){
						sorter = "alphanum";
					}
				}
				break;
			}
		}
	}

	return this.sorters[sorter];
};

//work through sort list sorting data
Sort.prototype.sort = function(){
	var self = this, lastSort;

	if(self.table.options.dataSorting){
		self.table.options.dataSorting(self.getSort());
	}

	self.clearColumnHeaders();

	if(!self.table.options.ajaxSorting){

		self.sortList.forEach(function(item, i){

			if(item.column && item.column.extensions.sort){

				//if no sorter has been defined, take a guess
				if(!item.column.extensions.sort.sorter){
					item.column.extensions.sort.sorter = self.findSorter(item.column);
				}

				self._sortItem(item.column, item.dir, self.sortList, i);
			}
		})
	}

	if(self.sortList.length){
		lastSort = self.sortList[self.sortList.length-1];

		if(lastSort.column){
			self.setColumnHeader(lastSort.column, lastSort.dir);
		}
	}

	if(self.table.options.dataSorted){
		self.table.options.dataSorted(self.getSort());
	}

};

//clear sort arrows on columns
Sort.prototype.clearColumnHeaders = function(){
	this.table.columnManager.getRealColumns().forEach(function(column){
		if(column.extensions.sort){
			column.extensions.sort.dir = "none";
			column.element.attr("aria-sort", "none");
		}
	});
};

//set the column header sort direction
Sort.prototype.setColumnHeader = function(column, dir){
	this.clearColumnHeaders();

	column.extensions.sort.dir = dir;
	column.element.attr("aria-sort", dir);
};

//sort each item in sort list
Sort.prototype._sortItem = function(column, dir, sortList, i){
	var self = this;

	var activeRows = self.table.rowManager.activeRows;

	activeRows.sort(function(a, b){

		var result = self._sortRow(a, b, column, dir);

		//if results match recurse through previous searchs to be sure
		if(result == 0 && i){
			for(var j = i-1; j>= 0; j--){
				result = self._sortRow(a, b, sortList[j].column, sortList[j].dir);

				if(result != 0){
					break;
				}
			}
		}

		return result;
	});
};

//process individual rows for a sort function on active data
Sort.prototype._sortRow = function(a, b, column, dir){
	var self = this;

	//switch elements depending on search direction
	var el1 = dir == "asc" ? a : b;
	var el2 = dir == "asc" ? b : a;

	a = column.getFieldValue(el1.getData());
	b = column.getFieldValue(el2.getData());

	a = typeof a !== "undefined" ? a : "";
	b = typeof b !== "undefined" ? b : "";

	return column.extensions.sort.sorter.call(self, a, b, el1, el2, column.getComponent(), dir, column.extensions.sort.params);
};


//default data sorters
Sort.prototype.sorters = {

	//sort numbers
	number:function(a, b, aData, bData, column, dir, params){
		return parseFloat(String(a).replace(",","")) - parseFloat(String(b).replace(",",""));
	},

	//sort strings
	string:function(a, b, aData, bData, column, dir, params){
		return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
	},

	//sort date
	date:function(a, b, aData, bData, column, dir, params){
		var self = this;
		var format = params.format || "DD/MM/YYYY";

		if(typeof moment != "undefined"){
			a = moment(a, format);
			b = moment(b, format);
		}else{
			console.error("Sort Error - 'date' sorter is dependant on moment.js");
		}

		return a - b;
	},

	//sort booleans
	boolean:function(a, b, aData, bData, column, dir, params){
		var el1 = a === true || a === "true" || a === "True" || a === 1 ? 1 : 0;
		var el2 = b === true || b === "true" || b === "True" || b === 1 ? 1 : 0;

		return el1 - el2;
	},

	//sort alpha numeric strings
	alphanum:function(as, bs, aData, bData, column, dir, params){
		var a, b, a1, b1, i= 0, L, rx = /(\d+)|(\D+)/g, rd = /\d/;

		if(isFinite(as) && isFinite(bs)) return as - bs;
		a = String(as).toLowerCase();
		b = String(bs).toLowerCase();
		if(a === b) return 0;
		if(!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
		a = a.match(rx);
		b = b.match(rx);
		L = a.length > b.length ? b.length : a.length;
		while(i < L){
			a1= a[i];
			b1= b[i++];
			if(a1 !== b1){
				if(isFinite(a1) && isFinite(b1)){
					if(a1.charAt(0) === "0") a1 = "." + a1;
					if(b1.charAt(0) === "0") b1 = "." + b1;
					return a1 - b1;
				}
				else return a1 > b1 ? 1 : -1;
			}
		}
		return a.length > b.length;
	},

	//sort hh:mm formatted times
	time:function(a, b, aData, bData, column, dir, params){
		var self = this;
		var format = params.format || "hh:mm";

		if(typeof moment != "undefined"){
			a = moment(a, format);
			b = moment(b, format);
		}else{
			console.error("Sort Error - 'date' sorter is dependant on moment.js");
		}

		return a - b;
	},
};

Tabulator.registerExtension("sort", Sort);