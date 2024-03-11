import Module from '../../core/Module.js';

import defaultFilters from './defaults/filters.js';

export default class Filter extends Module{

	static moduleName = "filter";

	//load defaults
	static filters = defaultFilters;

	constructor(table){
		super(table);

		this.filterList = []; //hold filter list
		this.headerFilters = {}; //hold column filters
		this.headerFilterColumns = []; //hold columns that use header filters

		this.prevHeaderFilterChangeCheck = "";
		this.prevHeaderFilterChangeCheck = "{}";

		this.changed = false; //has filtering changed since last render
		this.tableInitialized = false;

		this.registerTableOption("filterMode", "local"); //local or remote filtering

		this.registerTableOption("initialFilter", false); //initial filtering criteria
		this.registerTableOption("initialHeaderFilter", false); //initial header filtering criteria
		this.registerTableOption("headerFilterLiveFilterDelay", 300); //delay before updating column after user types in header filter
		this.registerTableOption("placeholderHeaderFilter", false); //placeholder when header filter is empty

		this.registerColumnOption("headerFilter");
		this.registerColumnOption("headerFilterPlaceholder");
		this.registerColumnOption("headerFilterParams");
		this.registerColumnOption("headerFilterEmptyCheck");
		this.registerColumnOption("headerFilterFunc");
		this.registerColumnOption("headerFilterFuncParams");
		this.registerColumnOption("headerFilterLiveFilter");

		this.registerTableFunction("searchRows", this.searchRows.bind(this));
		this.registerTableFunction("searchData", this.searchData.bind(this));

		this.registerTableFunction("setFilter", this.userSetFilter.bind(this));
		this.registerTableFunction("refreshFilter", this.userRefreshFilter.bind(this));
		this.registerTableFunction("addFilter", this.userAddFilter.bind(this));
		this.registerTableFunction("getFilters", this.getFilters.bind(this));
		this.registerTableFunction("setHeaderFilterFocus", this.userSetHeaderFilterFocus.bind(this));
		this.registerTableFunction("getHeaderFilterValue", this.userGetHeaderFilterValue.bind(this));
		this.registerTableFunction("setHeaderFilterValue", this.userSetHeaderFilterValue.bind(this));
		this.registerTableFunction("getHeaderFilters", this.getHeaderFilters.bind(this));
		this.registerTableFunction("removeFilter", this.userRemoveFilter.bind(this));
		this.registerTableFunction("clearFilter", this.userClearFilter.bind(this));
		this.registerTableFunction("clearHeaderFilter", this.userClearHeaderFilter.bind(this));

		this.registerComponentFunction("column", "headerFilterFocus", this.setHeaderFilterFocus.bind(this));
		this.registerComponentFunction("column", "reloadHeaderFilter", this.reloadHeaderFilter.bind(this));
		this.registerComponentFunction("column", "getHeaderFilterValue", this.getHeaderFilterValue.bind(this));
		this.registerComponentFunction("column", "setHeaderFilterValue", this.setHeaderFilterValue.bind(this));
	}

	initialize(){
		this.subscribe("column-init", this.initializeColumnHeaderFilter.bind(this));
		this.subscribe("column-width-fit-before", this.hideHeaderFilterElements.bind(this));
		this.subscribe("column-width-fit-after", this.showHeaderFilterElements.bind(this));
		this.subscribe("table-built", this.tableBuilt.bind(this));
		this.subscribe("placeholder", this.generatePlaceholder.bind(this));

		if(this.table.options.filterMode === "remote"){
			this.subscribe("data-params", this.remoteFilterParams.bind(this));
		}

		this.registerDataHandler(this.filter.bind(this), 10);
	}

	tableBuilt(){
		if(this.table.options.initialFilter){
			this.setFilter(this.table.options.initialFilter);
		}

		if(this.table.options.initialHeaderFilter){
			this.table.options.initialHeaderFilter.forEach((item) => {

				var column = this.table.columnManager.findColumn(item.field);

				if(column){
					this.setHeaderFilterValue(column, item.value);
				}else{
					console.warn("Column Filter Error - No matching column found:", item.field);
					return false;
				}
			});
		}

		this.tableInitialized = true;
	}

	remoteFilterParams(data, config, silent, params){
		params.filter = this.getFilters(true, true);
		return params;
	}

	generatePlaceholder(text){
		if(this.table.options.placeholderHeaderFilter && Object.keys(this.headerFilters).length){
			return this.table.options.placeholderHeaderFilter;
		}
	}

	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	//set standard filters
	userSetFilter(field, type, value, params){
		this.setFilter(field, type, value, params);
		this.refreshFilter();
	}

	//set standard filters
	userRefreshFilter(){
		this.refreshFilter();
	}

	//add filter to array
	userAddFilter(field, type, value, params){
		this.addFilter(field, type, value, params);
		this.refreshFilter();
	}

	userSetHeaderFilterFocus(field){
		var column = this.table.columnManager.findColumn(field);

		if(column){
			this.setHeaderFilterFocus(column);
		}else{
			console.warn("Column Filter Focus Error - No matching column found:", field);
			return false;
		}
	}

	userGetHeaderFilterValue(field) {
		var column = this.table.columnManager.findColumn(field);

		if(column){
			return this.getHeaderFilterValue(column);
		}else{
			console.warn("Column Filter Error - No matching column found:", field);
		}
	}

	userSetHeaderFilterValue(field, value){
		var column = this.table.columnManager.findColumn(field);

		if(column){
			this.setHeaderFilterValue(column, value);
		}else{
			console.warn("Column Filter Error - No matching column found:", field);
			return false;
		}
	}

	//remove filter from array
	userRemoveFilter(field, type, value){
		this.removeFilter(field, type, value);
		this.refreshFilter();
	}

	//clear filters
	userClearFilter(all){
		this.clearFilter(all);
		this.refreshFilter();
	}

	//clear header filters
	userClearHeaderFilter(){
		this.clearHeaderFilter();
		this.refreshFilter();
	}


	//search for specific row components
	searchRows(field, type, value){
		return this.search("rows", field, type, value);
	}

	//search for specific data
	searchData(field, type, value){
		return this.search("data", field, type, value);
	}

	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	initializeColumnHeaderFilter(column){
		var def = column.definition;

		if(def.headerFilter){
			this.initializeColumn(column);
		}
	}

	//initialize column header filter
	initializeColumn(column, value){
		var self = this,
		field = column.getField();

		//handle successfully value change
		function success(value){
			var filterType = (column.modules.filter.tagType == "input" && column.modules.filter.attrType == "text") || column.modules.filter.tagType == "textarea" ? "partial" : "match",
			type = "",
			filterChangeCheck = "",
			filterFunc;

			if(typeof column.modules.filter.prevSuccess === "undefined" || column.modules.filter.prevSuccess !== value){

				column.modules.filter.prevSuccess = value;

				if(!column.modules.filter.emptyFunc(value)){
					column.modules.filter.value = value;

					switch(typeof column.definition.headerFilterFunc){
						case "string":
							if(Filter.filters[column.definition.headerFilterFunc]){
								type = column.definition.headerFilterFunc;
								filterFunc = function(data){
									var params = column.definition.headerFilterFuncParams || {};
									var fieldVal = column.getFieldValue(data);

									params = typeof params === "function" ? params(value, fieldVal, data) : params;

									return Filter.filters[column.definition.headerFilterFunc](value, fieldVal, data, params);
								};
							}else{
								console.warn("Header Filter Error - Matching filter function not found: ", column.definition.headerFilterFunc);
							}
							break;

						case "function":
							filterFunc = function(data){
								var params = column.definition.headerFilterFuncParams || {};
								var fieldVal = column.getFieldValue(data);

								params = typeof params === "function" ? params(value, fieldVal, data) : params;

								return column.definition.headerFilterFunc(value, fieldVal, data, params);
							};

							type = filterFunc;
							break;
					}

					if(!filterFunc){
						switch(filterType){
							case "partial":
								filterFunc = function(data){
									var colVal = column.getFieldValue(data);

									if(typeof colVal !== 'undefined' && colVal !== null){
										return String(colVal).toLowerCase().indexOf(String(value).toLowerCase()) > -1;
									}else{
										return false;
									}
								};
								type = "like";
								break;

							default:
								filterFunc = function(data){
									return column.getFieldValue(data) == value;
								};
								type = "=";
						}
					}

					self.headerFilters[field] = {value:value, func:filterFunc, type:type};
				}else{
					delete self.headerFilters[field];
				}

				column.modules.filter.value = value;

				filterChangeCheck = JSON.stringify(self.headerFilters);

				if(self.prevHeaderFilterChangeCheck !== filterChangeCheck){
					self.prevHeaderFilterChangeCheck = filterChangeCheck;

					self.trackChanges();
					self.refreshFilter();
				}
			}

			return true;
		}

		column.modules.filter = {
			success:success,
			attrType:false,
			tagType:false,
			emptyFunc:false,
		};

		this.generateHeaderFilterElement(column);
	}

	generateHeaderFilterElement(column, initialValue, reinitialize){
		var self = this,
		success = column.modules.filter.success,
		field = column.getField(),
		filterElement, editor, editorElement, cellWrapper, typingTimer, searchTrigger, params, onRenderedCallback;

		column.modules.filter.value = initialValue;

		//handle aborted edit
		function cancel(){}

		function onRendered(callback){
			onRenderedCallback = callback;
		}

		if(column.modules.filter.headerElement && column.modules.filter.headerElement.parentNode){
			column.contentElement.removeChild(column.modules.filter.headerElement.parentNode);
		}

		if(field){

			//set empty value function
			column.modules.filter.emptyFunc = column.definition.headerFilterEmptyCheck || function(value){
				return !value && value !== 0;
			};

			filterElement = document.createElement("div");
			filterElement.classList.add("tabulator-header-filter");

			//set column editor
			switch(typeof column.definition.headerFilter){
				case "string":
					if(self.table.modules.edit.editors[column.definition.headerFilter]){
						editor = self.table.modules.edit.editors[column.definition.headerFilter];

						if((column.definition.headerFilter === "tick" || column.definition.headerFilter === "tickCross") && !column.definition.headerFilterEmptyCheck){
							column.modules.filter.emptyFunc = function(value){
								return value !== true && value !== false;
							};
						}
					}else{
						console.warn("Filter Error - Cannot build header filter, No such editor found: ", column.definition.editor);
					}
					break;

				case "function":
					editor = column.definition.headerFilter;
					break;

				case "boolean":
					if(column.modules.edit && column.modules.edit.editor){
						editor = column.modules.edit.editor;
					}else{
						if(column.definition.formatter && self.table.modules.edit.editors[column.definition.formatter]){
							editor = self.table.modules.edit.editors[column.definition.formatter];

							if((column.definition.formatter === "tick" || column.definition.formatter === "tickCross") && !column.definition.headerFilterEmptyCheck){
								column.modules.filter.emptyFunc = function(value){
									return value !== true && value !== false;
								};
							}
						}else{
							editor = self.table.modules.edit.editors["input"];
						}
					}
					break;
			}

			if(editor){

				cellWrapper = {
					getValue:function(){
						return typeof initialValue !== "undefined" ? initialValue : "";
					},
					getField:function(){
						return column.definition.field;
					},
					getElement:function(){
						return filterElement;
					},
					getColumn:function(){
						return column.getComponent();
					},
					getTable:() => {
						return this.table;
					},
					getType:() => {
						return "header";
					},
					getRow:function(){
						return {
							normalizeHeight:function(){

							}
						};
					}
				};

				params = column.definition.headerFilterParams || {};

				params = typeof params === "function" ? params.call(self.table, cellWrapper) : params;

				editorElement = editor.call(this.table.modules.edit, cellWrapper, onRendered, success, cancel, params);

				if(!editorElement){
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor returned a value of false");
					return;
				}

				if(!(editorElement instanceof Node)){
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor should return an instance of Node, the editor returned:", editorElement);
					return;
				}

				//set Placeholder Text
				self.langBind("headerFilters|columns|" + column.definition.field, function(value){
					editorElement.setAttribute("placeholder", typeof value !== "undefined" && value ? value : (column.definition.headerFilterPlaceholder || self.langText("headerFilters|default")));
				});

				//focus on element on click
				editorElement.addEventListener("click", function(e){
					e.stopPropagation();
					editorElement.focus();
				});

				editorElement.addEventListener("focus", (e) => {
					var left = this.table.columnManager.contentsElement.scrollLeft;

					var headerPos = this.table.rowManager.element.scrollLeft;

					if(left !== headerPos){
						this.table.rowManager.scrollHorizontal(left);
						this.table.columnManager.scrollHorizontal(left);
					}
				});

				//live update filters as user types
				typingTimer = false;

				searchTrigger = function(e){
					if(typingTimer){
						clearTimeout(typingTimer);
					}

					typingTimer = setTimeout(function(){
						success(editorElement.value);
					},self.table.options.headerFilterLiveFilterDelay);
				};

				column.modules.filter.headerElement = editorElement;
				column.modules.filter.attrType = editorElement.hasAttribute("type") ? editorElement.getAttribute("type").toLowerCase() : "" ;
				column.modules.filter.tagType = editorElement.tagName.toLowerCase();

				if(column.definition.headerFilterLiveFilter !== false){

					if (
						!(
							column.definition.headerFilter === 'autocomplete' ||
							column.definition.headerFilter === 'tickCross' ||
							((column.definition.editor === 'autocomplete' ||
								column.definition.editor === 'tickCross') &&
							column.definition.headerFilter === true)
						)
					) {
						editorElement.addEventListener("keyup", searchTrigger);
						editorElement.addEventListener("search", searchTrigger);


						//update number filtered columns on change
						if(column.modules.filter.attrType == "number"){
							editorElement.addEventListener("change", function(e){
								success(editorElement.value);
							});
						}

						//change text inputs to search inputs to allow for clearing of field
						if(column.modules.filter.attrType == "text" && this.table.browser !== "ie"){
							editorElement.setAttribute("type", "search");
						// editorElement.off("change blur"); //prevent blur from triggering filter and preventing selection click
						}

					}

					//prevent input and select elements from propagating click to column sorters etc
					if(column.modules.filter.tagType == "input" || column.modules.filter.tagType == "select" || column.modules.filter.tagType == "textarea"){
						editorElement.addEventListener("mousedown",function(e){
							e.stopPropagation();
						});
					}
				}

				filterElement.appendChild(editorElement);

				column.contentElement.appendChild(filterElement);

				if(!reinitialize){
					self.headerFilterColumns.push(column);
				}

				if(onRenderedCallback){
					onRenderedCallback();
				}
			}
		}else{
			console.warn("Filter Error - Cannot add header filter, column has no field set:", column.definition.title);
		}
	}

	//hide all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	hideHeaderFilterElements(){
		this.headerFilterColumns.forEach(function(column){
			if(column.modules.filter && column.modules.filter.headerElement){
				column.modules.filter.headerElement.style.display = 'none';
			}
		});
	}

	//show all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	showHeaderFilterElements(){
		this.headerFilterColumns.forEach(function(column){
			if(column.modules.filter && column.modules.filter.headerElement){
				column.modules.filter.headerElement.style.display = '';
			}
		});
	}

	//programmatically set focus of header filter
	setHeaderFilterFocus(column){
		if(column.modules.filter && column.modules.filter.headerElement){
			column.modules.filter.headerElement.focus();
		}else{
			console.warn("Column Filter Focus Error - No header filter set on column:", column.getField());
		}
	}

	//programmatically get value of header filter
	getHeaderFilterValue(column){
		if(column.modules.filter && column.modules.filter.headerElement){
			return column.modules.filter.value;
		} else {
			console.warn("Column Filter Error - No header filter set on column:", column.getField());
		}
	}

	//programmatically set value of header filter
	setHeaderFilterValue(column, value){
		if (column){
			if(column.modules.filter && column.modules.filter.headerElement){
				this.generateHeaderFilterElement(column, value, true);
				column.modules.filter.success(value);
			}else{
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	}

	reloadHeaderFilter(column){
		if (column){
			if(column.modules.filter && column.modules.filter.headerElement){
				this.generateHeaderFilterElement(column, column.modules.filter.value, true);
			}else{
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	}

	refreshFilter(){
		if(this.tableInitialized){
			if(this.table.options.filterMode === "remote"){
				this.reloadData(null, false, false);
			}else{
				this.refreshData(true);
			}
		}

		//TODO - Persist left position of row manager
		// left = this.scrollLeft;
		// this.scrollHorizontal(left);
	}

	//check if the filters has changed since last use
	trackChanges(){
		this.changed = true;
		this.dispatch("filter-changed");
	}

	//check if the filters has changed since last use
	hasChanged(){
		var changed = this.changed;
		this.changed = false;
		return changed;
	}

	//set standard filters
	setFilter(field, type, value, params){
		this.filterList = [];

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value, params:params}];
		}

		this.addFilter(field);
	}

	//add filter to array
	addFilter(field, type, value, params){
		var changed = false;

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value, params:params}];
		}

		field.forEach((filter) => {
			filter = this.findFilter(filter);

			if(filter){
				this.filterList.push(filter);
				changed = true;
			}
		});

		if(changed){
			this.trackChanges();
		}
	}

	findFilter(filter){
		var column;

		if(Array.isArray(filter)){
			return this.findSubFilters(filter);
		}

		var filterFunc = false;

		if(typeof filter.field == "function"){
			filterFunc = function(data){
				return filter.field(data, filter.type || {});// pass params to custom filter function
			};
		}else{

			if(Filter.filters[filter.type]){

				column = this.table.columnManager.getColumnByField(filter.field);

				if(column){
					filterFunc = function(data){
						return Filter.filters[filter.type](filter.value, column.getFieldValue(data), data, filter.params || {});
					};
				}else{
					filterFunc = function(data){
						return Filter.filters[filter.type](filter.value, data[filter.field], data, filter.params || {});
					};
				}


			}else{
				console.warn("Filter Error - No such filter type found, ignoring: ", filter.type);
			}
		}

		filter.func = filterFunc;

		return filter.func ? filter : false;
	}

	findSubFilters(filters){
		var output = [];

		filters.forEach((filter) => {
			filter = this.findFilter(filter);

			if(filter){
				output.push(filter);
			}
		});

		return output.length ? output : false;
	}

	//get all filters
	getFilters(all, ajax){
		var output = [];

		if(all){
			output = this.getHeaderFilters();
		}

		if(ajax){
			output.forEach(function(item){
				if(typeof item.type == "function"){
					item.type = "function";
				}
			});
		}

		output = output.concat(this.filtersToArray(this.filterList, ajax));

		return output;
	}

	//filter to Object
	filtersToArray(filterList, ajax){
		var output = [];

		filterList.forEach((filter) => {
			var item;

			if(Array.isArray(filter)){
				output.push(this.filtersToArray(filter, ajax));
			}else{
				item = {field:filter.field, type:filter.type, value:filter.value};

				if(ajax){
					if(typeof item.type == "function"){
						item.type = "function";
					}
				}

				output.push(item);
			}
		});

		return output;
	}

	//get all filters
	getHeaderFilters(){
		var output = [];

		for(var key in this.headerFilters){
			output.push({field:key, type:this.headerFilters[key].type, value:this.headerFilters[key].value});
		}

		return output;
	}

	//remove filter from array
	removeFilter(field, type, value){
		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value}];
		}

		field.forEach((filter) => {
			var index = -1;

			if(typeof filter.field == "object"){
				index = this.filterList.findIndex((element) => {
					return filter === element;
				});
			}else{
				index = this.filterList.findIndex((element) => {
					return filter.field === element.field && filter.type === element.type  && filter.value === element.value;
				});
			}

			if(index > -1){
				this.filterList.splice(index, 1);
			}else{
				console.warn("Filter Error - No matching filter type found, ignoring: ", filter.type);
			}
		});

		this.trackChanges();
	}

	//clear filters
	clearFilter(all){
		this.filterList = [];

		if(all){
			this.clearHeaderFilter();
		}

		this.trackChanges();
	}

	//clear header filters
	clearHeaderFilter(){
		this.headerFilters = {};
		this.prevHeaderFilterChangeCheck = "{}";

		this.headerFilterColumns.forEach((column) => {
			if(typeof column.modules.filter.value !== "undefined"){
				delete column.modules.filter.value;
			}
			column.modules.filter.prevSuccess = undefined;
			this.reloadHeaderFilter(column);
		});

		this.trackChanges();
	}

	//search data and return matching rows
	search (searchType, field, type, value){
		var activeRows = [],
		filterList = [];

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value}];
		}

		field.forEach((filter) => {
			filter = this.findFilter(filter);

			if(filter){
				filterList.push(filter);
			}
		});

		this.table.rowManager.rows.forEach((row) => {
			var match = true;

			filterList.forEach((filter) => {
				if(!this.filterRecurse(filter, row.getData())){
					match = false;
				}
			});

			if(match){
				activeRows.push(searchType === "data" ? row.getData("data") : row.getComponent());
			}

		});

		return activeRows;
	}

	//filter row array
	filter(rowList, filters){
		var activeRows = [],
		activeRowComponents = [];

		if(this.subscribedExternal("dataFiltering")){
			this.dispatchExternal("dataFiltering", this.getFilters(true));
		}

		if(this.table.options.filterMode !== "remote" && (this.filterList.length || Object.keys(this.headerFilters).length)){

			rowList.forEach((row) => {
				if(this.filterRow(row)){
					activeRows.push(row);
				}
			});

		}else{
			activeRows = rowList.slice(0);
		}

		if(this.subscribedExternal("dataFiltered")){

			activeRows.forEach((row) => {
				activeRowComponents.push(row.getComponent());
			});

			this.dispatchExternal("dataFiltered", this.getFilters(true), activeRowComponents);
		}

		return activeRows;
	}

	//filter individual row
	filterRow(row, filters){
		var match = true,
		data = row.getData();

		this.filterList.forEach((filter) => {
			if(!this.filterRecurse(filter, data)){
				match = false;
			}
		});


		for(var field in this.headerFilters){
			if(!this.headerFilters[field].func(data)){
				match = false;
			}
		}

		return match;
	}

	filterRecurse(filter, data){
		var match = false;

		if(Array.isArray(filter)){
			filter.forEach((subFilter) => {
				if(this.filterRecurse(subFilter, data)){
					match = true;
				}
			});
		}else{
			match = filter.func(data);
		}

		return match;
	}
}