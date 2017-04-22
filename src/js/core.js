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

	 			columns:[],//store for colum header info

	 			//Callbacks from events
	 			rowClick:function(){},
	 			rowDblClick:function(){},
	 			rowAdded:function(){},
	 			rowDeleted:function(){},
	 			rowContext:function(){},
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


	 		////////////////// Data Loading //////////////////


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
	 			self.rowManager.setData([]);
	 		},


	 		////////////// Extension Management //////////////

	 		//object to hold extensions
	 		extensions:{},

	 		//add extension to tabulator
	 		registerExtension:function(name, extension){
	 			// extension.table = this;

	 			// this.extensions[name] = extension;
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
