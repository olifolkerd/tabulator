(function(){

	'use strict';

	/*=include column_manager.js */
	/*=include column.js */
	/*=include row_manager.js */
	/*=include row.js */
	/*=include cell.js */

	window.Tabulator = {

			columnManager:null, // hold Column Manager
			rowManager:null, //hold Row Manager

			config:{ //config object for holding all table setup options

			},

	 		//setup options
	 		options: {

	 			height:false, //height of tabulator

	 			fitColumns:false, //fit colums to width of screen;
	 			colMinWidth:40, //minimum global width for a column
	 			colVertAlign:"top", //vertical alignment of column headers
	 			colResizable:true, //resizable columns

	 			columns:[],//store for colum header info
	 			dateFormat: "dd/mm/yyyy", //date format to be used for sorting

	 			tooltips: false, //Tool tip value
	 			tooltipsHeader: false, //Tool tip for headers

	 			initialSort:false, //initial sorting criteria

	 			index:"id", //filed for row index

	 			//Callbacks from events
	 			rowClick:false,
	 			rowDblClick:false,
	 			rowContext:false,
	 			rowAdded:function(){},
	 			rowDeleted:function(){},
	 			rowMoved:function(){},
	 			rowUpdated:function(){},
	 			rowSelectionChanged:function(){},

	 			cellEdited:function(){},

	 			colMoved:function(){},
	 			colTitleChanged:function(){},

	 			dataLoading:function(){},
	 			dataLoaded:function(){},
	 			dataLoadError:function(){},
	 			dataEdited:function(){},

	 			ajaxResponse:false,

	 			dataFiltering:function(){},
	 			dataFiltered:function(){},

	 			dataSorting:function(){},
	 			dataSorted:function(){},

	 			renderStarted:function(){},
	 			renderComplete:function(){},

	 			pageLoaded:function(){},

	 			localized:function(){},

	 			tableBuilding:function(){},
	 			tableBuilt:function(){},
	 		},

	 		//constructor
	 		_create: function(){
	 			var self = this,
	 			element = this.element;

	 			self.bindExtensions();

	 			self.columnManager = new ColumnManager(self);
	 			self.rowManager = new RowManager(self);

	 			self.columnManager.setRowManager(self.rowManager);
	 			self.rowManager.setColumnManager(self.columnManager);


	 			if(element.is("table")){
	 				self._parseTable();
	 			}else{
	 				self._buildElement();
	 			}
	 		},

	 		//build tabulator element
	 		_buildElement: function(){
	 			var self = this,
	 			element = this.element;

	 			self.options.tableBuilding();

	 			self._configureTable();

	 			element.addClass("tabulator")
	 			.attr("role", "grid")
	 			.empty();

	 			element.append(self.columnManager.getElement());
	 			element.append(self.rowManager.getElement());

	 			self.columnManager.setColumns(self.options.columns);

	 			if(self.options.initialSort && self.extExists("sort", true)){
	 				self.extensions.sort.setSort(self.options.initialSort);
	 			}
	 		},

	 		//configure the table
	 		_configureTable: function(){
	 			var self = this;
	 			var config = this.config;

	 			config.options = this.options;

	 			//setup persistent layout storage if needed
	 			if(config.options.persistentLayout){
	 				//determine persistent layout storage type
	 				config.options.persistentLayout = config.options.persistentLayout !== true ?  config.options.persistentLayout : (typeof window.localStorage !== 'undefined' ? "local" : "cookie");

	 				//set storage tag
	 				config.options.persistentLayoutID = "tabulator-" + (config.options.persistentLayoutID ? config.options.persistentLayoutID : self.element.attr("id") ? self.element.attr("id") : "");
	 			}

	 			//set table height
	 			if(config.options.height){
	 				config.options.height = isNaN(config.options.height) ? config.options.height : config.options.height + "px";
	 				self.element.css({"height": config.options.height});
	 			}
	 		},



	 		//set options
	 		_setOption: function(option, value){
	 			var self = this;
	 		},

	 		////////////////// Data Handling //////////////////


	 		//load data
	 		setData:function(data, params, config){
	 			var self = this;

	 			self.options.dataLoading(data, params);

	 			if(params){
	 				self.options.ajaxParams = params;
	 			}

	 			//show loader if needed
	 			// self._showLoader(this, this.options.loader);

	 			if(typeof(data) === "string"){
	 				if (data.indexOf("{") == 0 || data.indexOf("[") == 0){
	 					//data is a json encoded string
	 					self.rowManager.setData(JSON.parse(data));
	 				}else{

	 					// self.options.ajaxURL = data;

	 					// if(self.options.pagination == "remote"){
	 					// 	self.setPage(1);
	 					// }else{
	 					// 	//assume data is url, make ajax call to url to get data
	 					// 	self._getAjaxData(data, self.options.ajaxParams, config);
	 					// }

	 				}
	 			}else{
	 				if(data){
	 					//asume data is already an object
	 					self.rowManager.setData(data);

	 				}else{
	 					// //no data provided, check if ajaxURL is present;
	 					// if(this.options.ajaxURL){

	 					// 	if(self.options.pagination == "remote"){
	 					// 		self.setPage(1);
	 					// 	}else{
	 					// 		self._getAjaxData(this.options.ajaxURL, self.options.ajaxParams, config);
	 					// 	}

	 					// }else{
	 					// 	//empty data
	 					// 	self._parseData([]);
	 					// }
	 				}
	 			}
	 		},

	 		//clear data
	 		clearData:function(){
	 			this.rowManager.clearData();
	 		},

	 		//get table data array

	 		getData:function(active){
	 			return this.rowManager.getData(active);
	 		},

	 		//////////// General Public Functions ////////////

	 		//redraw list without updating data
	 		redraw:function(force){
	 			this.columnManager.redraw(force);

	 			if(force){
	 				this.rowManager.renderTable();
	 			}else{
	 				this.rowManager.normalizeHeight();
	 			}
	 		},

	 		///////////////////// Sorting ////////////////////

	 		//trigger sort
	 		setSort:function(sortList, dir){
	 			if(this.extExists("sort", true)){
	 				this.extensions.sort.setSort(sortList, dir);
	 			}
	 		},

	 		getSort:function(){
	 			if(this.extExists("sort", true)){
	 				return this.extensions.sort.getSort();
	 			}
	 		},


	 		///////////////////// Filtering ////////////////////

	 		//set standard filters
	 		setFilter:function(field, type, value){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.setFilter(field, type, value);
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		//add filter to array
	 		addFilter:function(field, type, value){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.addFilter(field, type, value);
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		//get all filters
	 		getFilter:function(){
	 			if(this.extExists("filter", true)){
	 				return this.extensions.filter.getFilter();
	 			}
	 		},

	 		//remove filter from array
	 		removeFilter:function(field, type, value){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.removeFilter(field, type, value);
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		//clear filters
	 		clearFilter:function(all){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.clearFilter(all);
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		//clear header filters
	 		clearHeaderFilter:function(){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.clearHeaderFilter();
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		////////////// Extension Management //////////////

	 		//object to hold extensions
	 		extensions:{},
	 		extensionBindings:{},

	 		//add extension to tabulator
	 		registerExtension:function(name, extension){
	 			var self = this;
	 			this.extensionBindings[name] = extension;
	 		},

	 		//ensure that extensions are bound to instantiated function
	 		bindExtensions:function(){
	 			var self = this;

	 			for(var name in self.extensionBindings){
	 				self.extensions[name] = new self.extensionBindings[name](self);
	 			}
	 		},

	 		//Check for plugin
	 		extExists:function(plugin, required){
	 			if(this.extensions[plugin]){
	 				return true;
	 			}else{
	 				if(required){
	 					console.error("Tabulator Plugin Not Installed: " + plugin);
	 				}
	 				return false;
	 			}
	 		},


	 		//deconstructor
	 		_destroy: function(){
	 			var element = this.element;

	 			element.empty();

	 			element.removeClass("tabulator");
	 		},
	 	};


	 	/*=include extensions_enabled.js */

	 })();
