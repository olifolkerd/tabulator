var Filter = function(table){

	var extension = {
		table:table, //hold Tabulator object

		filterList:[], //hold filter list
		headerFilters:{}, //hold column filters
		headerFilterElements:[], //hold header filter elements for manipulation

		changed:false,

		//initialize column header filter
		initializeColumn:function(column){
			var self = this,
			field = column.getField(),
			filterElement, editor, editorElement, typingTimer, tagType, attrType;

			//handle successfull value change
			function success(value){
				var filterType = tagType == "input" && attrType == "text" ? "partial" : "match",
				filterFunc;

				if(value){

					switch(filterType){
						case "partial":
						filterFunc = function(data){
							return String(data[field]).toLowerCase().indexOf(String(value).toLowerCase()) > -1
						}
						break;

						default:
						filterFunc = function(data){
							return data[field] == value;
						}
					}

					self.headerFilters[field] = {value:value, func:filterFunc};

				}else{
					delete self.headerFilters[field];
				}

				self.changed = true;

				self.table.rowManager.refreshActiveData();
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
						console.warn("Filter Error - Build header filter, No such editor found: ", column.definition.editor);
					}
					break;

					case "function":
					editor = column.definition.editor;
					break;
				}

				if(editor){

					editorElement = editor.call(self, filterElement, null, null, function(){}, success, cancel);
					//set Placeholder Text
					//editorElement.children().attr("placeholder", self.lang.headerFilters.columns[column.field] || self.lang.headerFilters.default);

					//focus on element on click
					editorElement.on("click", function(e){
						e.stopPropagation();
						$(this).focus();
					});

					//live update filters as user types
					typingTimer = false;

					editorElement.on("keyup", function(e){
						var element = $(this);

						if(typingTimer){
							clearTimeout(typingTimer);
						}

						typingTimer = setTimeout(function(){
							success(element.val());
						},300);
					});

					//update number filtered columns on change
					attrType = editorElement.attr("type").toLowerCase() ;
					if(attrType == "number"){
						editorElement.on("change", function(e){
							success($(this).val());
						});
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
				this.clearHeaderFilter();
			}

			this.changed = true;
		},

		//clear header filters
		clearHeaderFilter:function(){
			this.headerFilters = {};

			this.headerFilterElements.forEach(function(element){
				element.val("");
			});

			self.changed = true;
		},

		//filter row array
		filter:function(){
			var self = this,
			activeRows = [];

			if(self.filterList.length || Object.keys(self.headerFilters).length){

				self.table.rowManager.rows.forEach(function(row){
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

			for(var field in self.headerFilters){
				if(!self.headerFilters[field].func(data)){
					match = false;
				}
			}

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