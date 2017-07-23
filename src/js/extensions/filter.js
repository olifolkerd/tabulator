var Filter = function(table){

	this.table = table; //hold Tabulator object

	this.filterList = []; //hold filter list
	this.headerFilters = {}; //hold column filters
	this.headerFilterElements = []; //hold header filter elements for manipulation

	this.changed = false; //has filtering changed since last render
};


//initialize column header filter
Filter.prototype.initializeColumn = function(column){
	var self = this,
	field = column.getField(),
	filterElement, editor, editorElement, cellWrapper, typingTimer, tagType, attrType;

	//handle successfull value change
	function success(value){
		var filterType = tagType == "input" && attrType == "text" ? "partial" : "match",
		filterFunc;

		if(value){
			switch(typeof column.definition.headerFilterFunc){
				case "string":
				if(self.filters[column.definition.headerFilterFunc]){
					filterFunc = function(data){
						return self.filters[column.definition.headerFilterFunc](value, column.getFieldValue(data));
					}
				}else{
					console.warn("Header Filter Error - Matching filter function not found: ", column.definition.headerFilterFunc);
				}
				break;

				case "function":
				filterFunc = function(data){
					return column.definition.headerFilterFunc(value, column.getFieldValue(data), data, column.definition.headerFilterFuncParams || {});
				}
				break;
			}

			if(!filterFunc){

				switch(filterType){
					case "partial":
					filterFunc = function(data){
						return String(column.getFieldValue(data)).toLowerCase().indexOf(String(value).toLowerCase()) > -1;
					}
					break;

					default:
					filterFunc = function(data){
						return column.getFieldValue(data) == value;
					}
				}
			}

			self.headerFilters[field] = {value:value, func:filterFunc};

		}else{
			delete self.headerFilters[field];
		}

		self.changed = true;

		self.table.rowManager.filterRefresh();
	};

	//handle aborted edit
	function cancel(){};

	if(field){

		filterElement = $("<div class='tabulator-header-filter'></div>");

		//set column editor
		switch(typeof column.definition.headerFilter){
			case "string":
			if(self.table.extensions.edit.editors[column.definition.headerFilter]){
				editor = self.table.extensions.edit.editors[column.definition.headerFilter];
			}else{
				console.warn("Filter Error - Cannot build header filter, No such editor found: ", column.definition.editor);
			}
			break;

			case "function":
			editor = column.definition.headerFilter;
			break;

			case "boolean":
			if(column.extensions.edit && column.extensions.edit.editor){
				editor = column.extensions.edit.editor;
			}else{
				if(column.definition.formatter && self.table.extensions.edit.editors[column.definition.formatter]){
					editor = self.table.extensions.edit.editors[column.definition.formatter];
				}else{
					editor = self.table.extensions.edit.editors["input"];
				}
			}
			break;
		}

		if(editor){

			cellWrapper = {
				getValue:function(){
					return "";
				},
				getElement:function(){
					return filterElement;
				}
			};

			editorElement = editor.call(self, cellWrapper, function(){}, success, cancel, column.definition.headerFilterParams || {});

			//set Placeholder Text
			if(field){
				self.table.extensions.localize.bind("headerFilters.columns." + column.definition.field, function(value){
					editorElement.attr("placeholder", typeof value !== "undefined" && value ? value : self.table.extensions.localize.getText("headerFilters.default"));
				});
			}else{
				self.table.extensions.localize.bind("headerFilters.default", function(value){
					editorElement.attr("placeholdder", typeof self.column.definition.headerFilterPlaceholder !== "undefined" && self.column.definition.headerFilterPlaceholder ? self.column.definition.headerFilterPlaceholder : value);
				});
			}

			//focus on element on click
			editorElement.on("click", function(e){
				e.stopPropagation();
				$(this).focus();
			});

			//live update filters as user types
			typingTimer = false;

			editorElement.on("keyup search", function(e){
				var element = $(this);

				if(typingTimer){
					clearTimeout(typingTimer);
				}

				typingTimer = setTimeout(function(){
					success(element.val());
				},300);
			});

			//update number filtered columns on change
			attrType = editorElement.attr("type") ? editorElement.attr("type").toLowerCase() : "" ;
			if(attrType == "number"){
				editorElement.on("change", function(e){
					success($(this).val());
				});
			}

			//change text inputs to search inputs to allow for clearing of field
			if(attrType == "text"){
				editorElement.attr("type", "search");
				editorElement.off("change blur"); //prevent blur from triggering filter and preventing selection click
			}

			//prevent input and select elements from propegating click to column sorters etc
			tagType = editorElement.prop("tagName").toLowerCase()
			if(tagType == "input" || tagType == "select"){
				editorElement.on("mousedown",function(e){
					e.stopPropagation();
				});
			}

			filterElement.append(editorElement);

			column.contentElement.append(filterElement);

			self.headerFilterElements.push(editorElement);
		}
	}else{
		console.warn("Filter Error - Cannot add header filter, column has no field set:", column.definition.title);
	}

};

//check if the filters has changed since last use
Filter.prototype.hasChanged = function(){
	var changed = this.changed;
	this.changed = false;
	return changed;
};

//set standard filters
Filter.prototype.setFilter = function(field, type, value){
	var self = this;

	self.filterList = [];

	if(!Array.isArray(field)){
		field = [{field:field, type:type, value:value}];
	}

	self.addFilter(field);

};

//add filter to array
Filter.prototype.addFilter = function(field, type, value){
	var self = this,
	column;

	if(!Array.isArray(field)){
		field = [{field:field, type:type, value:value}];
	}

	field.forEach(function(filter){

		var filterFunc = false;

		if(typeof filter.field == "function"){
			filterFunc = function(data){
				return filter.field(data, filter.type || {})// pass params to custom filter function
			}
		}else{
			if(self.filters[filter.type]){

				column = self.table.columnManager.getColumnByField(filter.field);

				if(column){
					filterFunc = function(data){
						return self.filters[filter.type](filter.value, column.getFieldValue(data));
					}
				}else{
					filterFunc = function(data){
						return self.filters[filter.type](filter.value, data[filter.field]);
					}
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

};

//get all filters
Filter.prototype.getFilter = function(){
	var self = this,
	output = [];

	self.filterList.forEach(function(filter){
		output.push({field:filter.field, type:filter.type, value:filter.value});
	});

	return output;
};

//remove filter from array
Filter.prototype.removeFilter = function(field, type, value){
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

};

//clear filters
Filter.prototype.clearFilter = function(all){
	this.filterList = [];

	if(all){
		this.clearHeaderFilter();
	}

	this.changed = true;
};

//clear header filters
Filter.prototype.clearHeaderFilter = function(){
	this.headerFilters = {};

	this.headerFilterElements.forEach(function(element){
		element.val("");
	});

	self.changed = true;
};

//filter row array
Filter.prototype.filter = function(rowList){
	var self = this,
	activeRows = [],
	activeRowComponents = [];

	if(self.table.options.dataFiltering){
		self.table.options.dataFiltering(self.getFilter());
	}

	if(!self.table.options.ajaxFiltering && (self.filterList.length || Object.keys(self.headerFilters).length)){

		rowList.forEach(function(row){
			if(self.filterRow(row)){
				activeRows.push(row);
			}
		});

		activeRows;

	}else{
		activeRows = rowList.slice(0);
	}

	if(self.table.options.dataFiltered){

		activeRows.forEach(function(row){
			activeRowComponents.push(row.getComponent());
		});

		self.table.options.dataFiltered(self.getFilter(), activeRowComponents);
	}

	return activeRows;

};

//filter individual row
Filter.prototype.filterRow = function(row){
	var self = this,
	match = true,
	data = row.getData();

	self.filterList.forEach(function(filter){
		if(!filter.func(data)){
			match = false;
		}
	});

	for(var field in self.headerFilters){
		if(!self.headerFilters[field].func(data)){
			match = false;
		}
	}

	return match;
};


//list of available filters
Filter.prototype.filters ={

	//equal to
	"=":function(filterVal, rowVal){
		return rowVal == filterVal ? true : false;
	},

	//less than
	"<":function(filterVal, rowVal){
		return rowVal < filterVal ? true : false;
	},

	//less than or equal to
	"<=":function(filterVal, rowVal){
		return rowVal <= filterVal ? true : false;
	},

	//greater than
	">":function(filterVal, rowVal){
		return rowVal > filterVal ? true : false;
	},

	//greater than or equal to
	">=":function(filterVal, rowVal){
		return rowVal >= filterVal ? true : false;
	},

	//not equal to
	"!=":function(filterVal, rowVal){
		return rowVal != filterVal ? true : false;
	},

	//contains the string
	"like":function(filterVal, rowVal){
		if(filterVal === null){
			return rowVal === filterVal ? true : false;
		}else{
			return rowVal.toLowerCase().indexOf(filterVal.toLowerCase()) > -1 ? true : false;
		}
	},
};

Tabulator.registerExtension("filter", Filter);