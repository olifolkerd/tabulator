(function(){

	'use strict';

	/*=include column_manager.js */
	/*=include column.js */
	/*=include row_manager.js */
	/*=include row.js */
	/*=include cell.js */

	/*=include footer_manager.js */

	window.Tabulator = {

			columnManager:null, // hold Column Manager
			rowManager:null, //hold Row Manager
			footerManager:null, //holder Footer Manager

	 		//setup options
	 		options: {

	 			height:false, //height of tabulator

	 			fitColumns:false, //fit colums to width of screen;
	 			columnMinWidth:40, //minimum global width for a column
	 			columnVertAlign:"top", //vertical alignment of column headers

	 			resizableColumns:true, //resizable columns

	 			columns:[],//store for colum header info

	 			data:[], //default starting data

	 			tooltips: false, //Tool tip value
	 			tooltipsHeader: false, //Tool tip for headers

	 			initialSort:false, //initial sorting criteria

	 			index:"id", //filed for row index

	 			addRowPos:"bottom", //position to insert blank rows, top|bottom

	 			selectable:"highlight", //highlight rows on hover
	 			selectableRollingSelection:true, //roll selection once maximum number of selectable rows is reached
	 			selectablePersistence:true, // maintain selection when table view is updated
	 			selectableCheck:function(data, row){return true;}, //check wheather row is selectable

	 			headerFilterPlaceholder: false, //placeholder text to display in header filters

	 			locale:false, //current system language
	 			langs:{},

	 			virtualDom:true, //enable DOM virtualization

	 			persistentLayout:false, //store cookie with column _styles
	 			persistentLayoutID:"", //id for stored cookie

	 			responsiveLayout:false, //responsive layout flags

	 			pagination:false, //set pagination type
	 			paginationSize:false, //set number of rows to a page
	 			paginationElement:false, //element to hold pagination numbers
	 			paginationDataSent:{}, //pagination data sent to the server
	 			paginationDataReceived:{}, //pagination data received from the server
	 			paginator:false, //pagination url string builder

	 			ajaxURL:false, //url for ajax loading
	 			ajaxParams:{}, //params for ajax loading
	 			ajaxConfig:"get", //ajax request type
	 			ajaxLoader:true, //show loader
	 			ajaxLoaderLoading:false, //loader element
	 			ajaxLoaderError:false, //loader element

	 			groupBy:false, //enable table grouping and set field to group by
				groupStartOpen:true, //starting state of group

				groupHeader:false, //header generation function

				movableColumns:false, //enable movable columns
				movableRows:false, //enable movable rows

				rowFormatter:false,

				placeholder:false,

	 			//Callbacks from events
	 			rowClick:false,
	 			rowDblClick:false,
	 			rowContext:false,
	 			rowAdded:function(){},
	 			rowDeleted:function(){},
	 			rowMoved:function(){},
	 			rowUpdated:function(){},


	 			rowSelectionChanged:function(){},
	 			rowSelected:function(){},
	 			rowDeselected:function(){},

	 			cellEditing:function(){},
	 			cellEdited:function(){},
	 			cellEditCancelled:function(){},

	 			columnMoved:function(){},
	 			columnTitleChanged:function(){},
	 			columnVisibilityChanged:function(){},

	 			dataLoading:function(){},
	 			dataLoaded:function(){},

	 			dataEdited:function(){},

	 			ajaxRequesting:function(){},
	 			ajaxResponse:false,
	 			ajaxError:function(){},

	 			dataFiltering:false,
	 			dataFiltered:false,

	 			dataSorting:function(){},
	 			dataSorted:function(){},

	 			dataGrouping:function(){},
	 			dataGrouped:false,
	 			groupVisibilityChanged:function(){},

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

	 			if(element.is("table")){
	 				if(this.extExists("htmlTableImport", true)){
	 					self.extensions.htmlTableImport.parseTable();
	 				}
	 			}else{

	 				self.columnManager = new ColumnManager(self);
	 				self.rowManager = new RowManager(self);
	 				self.footerManager = new FooterManager(self);

	 				self.columnManager.setRowManager(self.rowManager);
	 				self.rowManager.setColumnManager(self.columnManager);

	 				self._buildElement();

	 				self.rowManager.setData(self.options.data);
	 			}

	 		},


	 		//build tabulator element
	 		_buildElement: function(){
	 			var element = this.element,
	 			ext = this.extensions,
	 			options = this.options;

	 			options.tableBuilding();

	 			element.addClass("tabulator")
	 			.attr("role", "grid")
	 			.empty();

	 			//set localization
	 			if(options.headerFilterPlaceholder !== false){
	 				ext.localize.setHeaderFilterPlaceholder(options.headerFilterPlaceholder);
	 			}

	 			for(let locale in options.langs){
	 				ext.localize.installLang(locale, options.langs[locale]);
	 			}

	 			ext.localize.setLocale(options.locale);

	 			//configure placeholder element
	 			if(typeof options.placeholder == "string"){
	 				options.placeholder = $("<div class='tabulator-placeholder'><span>" + options.placeholder + "</span></div>");
	 			}

	 			//set table height
	 			if(options.height){
	 				options.height = isNaN(options.height) ? options.height : options.height + "px";
	 				this.element.css({"height": options.height});
	 			}

	 			//build table elements
	 			element.append(this.columnManager.getElement());
	 			element.append(this.rowManager.getElement());


	 			if(options.pagination && this.extExists("page", true)){
	 				element.append(this.footerManager.getElement());
	 			}


	 			if(options.persistentLayout && this.extExists("persistentLayout", true)){
	 				ext.persistentLayout.initialize(options.persistentLayout, options.persistentLayoutID);
	 				options.columns = ext.persistentLayout.load(options.columns);
	 			}

	 			this.columnManager.setColumns(options.columns);

	 			if(options.initialSort && this.extExists("sort", true)){
	 				ext.sort.setSort(options.initialSort);
	 			}

	 			if(options.pagination && this.extExists("page", true)){
	 				ext.page.initialize();
	 			}

	 			if(options.groupBy && this.extExists("groupRows", true)){
	 				ext.groupRows.initialize();
	 			}

	 			if(this.extExists("ajax")){
	 				ext.ajax.initialize();
	 			}

	 			options.tableBuilt();

	 		},

	 		//set options
	 		_setOption: function(option, value){
	 			console.error("Options Error - Tabulator does not allow options to be set after initialization unless there is a function defined for that purpose");
	 		},

	 		//deconstructor
	 		_destroy: function(){
	 			var element = this.element;

	 			element.empty();

	 			element.removeClass("tabulator");
	 		},

	 		////////////////// Data Handling //////////////////


	 		//load data
	 		setData:function(data, params, config){
	 			var self = this;
	 			var self = this;

	 			if(typeof(data) === "string"){
	 				if (data.indexOf("{") == 0 || data.indexOf("[") == 0){
	 					//data is a json encoded string
	 					self.rowManager.setData(JSON.parse(data));
	 				}else{

	 					if(self.extExists("ajax", true)){
	 						if(params){
	 							self.extensions.ajax.setParams(params);
	 						}

	 						if(config){
	 							self.extensions.ajax.setConfig(config);
	 						}

	 						self.extensions.ajax.setUrl(data);

	 						if(self.options.pagination == "remote" && self.extExists("page", true)){
	 							self.extensions.page.reset(true);
	 							self.extensions.page.setPage(1);
	 						}else{
	 							//assume data is url, make ajax call to url to get data
	 							self.extensions.ajax.sendRequest(function(data){
	 								self.rowManager.setData(data);
	 							});
	 						}
	 					}
	 				}
	 			}else{
	 				if(data){
	 					//asume data is already an object
	 					self.rowManager.setData(data);
	 				}else{

	 					//no data provided, check if ajaxURL is present;
	 					if(self.extExists("ajax") && self.extensions.ajax.getUrl){

	 						if(self.options.pagination == "remote" && self.extExists("page", true)){
	 							self.extensions.page.reset(true);
	 							self.extensions.page.setPage(1);
	 						}else{
	 							self.extensions.ajax.sendRequest(function(data){
	 								self.rowManager.setData(data);
	 							});
	 						}

	 					}else{
	 						//empty data
	 						self.rowManager.setData([]);
	 					}
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

	 		//get table data array count
	 		getDataCount:function(active){
	 			return this.rowManager.getDataCount(active);
	 		},

	 		//update table data
	 		updateData:function(data){
	 			var self = this;

	 			if(data){
	 				data.forEach(function(item){
	 					var row = self.rowManager.findRow(item[self.options.index]);

	 					if(row){
	 						row.updateData(item);
	 					}
	 				})
	 			}else{
	 				console.warn("Update Error - No data provided");
	 			}
	 		},

	 		//update table data
	 		updateOrAddData:function(data){
	 			var self = this;

	 			if(data){
	 				data.forEach(function(item){
	 					var row = self.rowManager.findRow(item[self.options.index]);

	 					if(row){
	 						row.updateData(item);
	 					}else{
	 						self.rowManager.addRow(item);
	 					}
	 				})
	 			}else{
	 				console.warn("Update Error - No data provided");
	 			}
	 		},

	 		//get row object
	 		getRow:function(index){
	 			row = this.rowManager.findRow(index);

	 			if(row){
	 				return row.getComponent();
	 			}else{
	 				console.warn("Find Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//delete row from table
	 		deleteRow:function(index){
	 			row = this.rowManager.findRow(row);

	 			if(row){
	 				row.delete();
	 				return true;
	 			}else{
	 				console.warn("Delete Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//add row to table
	 		addRow:function(data, pos, index){
	 			return this.rowManager.addRow(data, pos, index).getComponent();
	 		},

	 		//update a row if it exitsts otherwise create it
	 		updateOrAddRow:function(index, data){
	 			var row = this.rowManager.findRow(index);

	 			if(row){
	 				row.updateData(data);
	 			}else{
	 				row = this.rowManager.addRow(data);
	 			}

	 			return row.getComponent();
	 		},

	 		//update row data
	 		updateRow:function(index, data){
	 			row = this.rowManager.findRow(index);

	 			if(row){
	 				row.updateData(data);
	 				return row.getComponent();
	 			}else{
	 				console.warn("Update Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//scroll to row in DOM
	 		scrollToRow:function(index){
	 			row = this.rowManager.findRow(index);

	 			if(row){
	 				return this.rowManager.scrollToRow(row);
	 			}else{
	 				console.warn("Scroll Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		/////////////// Column Functions  ///////////////

	 		setColumns:function(definition){
	 			this.columnManager.setColumns(definition);
	 		},

	 		getColumns:function(){
	 			return this.columnManager.getComponents();
	 		},

	 		getColumnDefinitions:function(){
	 			return this.columnManager.getDefinitionTree();
	 		},

	 		showColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				column.show();
	 			}else{
	 				console.warn("Column Show Error - No matching column found:", field);
	 				return false;
	 			}
	 		},

	 		hideColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				column.hide();
	 			}else{
	 				console.warn("Column Hide Error - No matching column found:", field);
	 				return false;
	 			}
	 		},


	 		toggleColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				if(column.visible){
	 					column.hide();
	 				}else{
	 					column.show();
	 				}
	 			}else{
	 				console.warn("Column Visibility Toggle Error - No matching column found:", field);
	 				return false;
	 			}
	 		},

	 		addColumn:function(definition, before, field){
	 			var column = this.columnManager.findColumn(field);

	 			this.columnManager.addColumn(definition, before, column)
	 		},

	 		deleteColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				column.delete();
	 			}else{
	 				console.warn("Column Delete Error - No matching column found:", field);
	 				return false;
	 			}
	 		},


	 		//////////// Localization Functions  ////////////
	 		setLocale:function(locale){
	 			this.extensions.localize.setLocale(locale);
	 		},

	 		getLocale:function(){
	 			return this.extensions.localize.getLocale();
	 		},

	 		getLang:function(locale){
	 			return this.extensions.localize.getLang(locale);
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
	 				this.rowManager.refreshActiveData();
	 			}
	 		},

	 		getSort:function(){
	 			if(this.extExists("sort", true)){
	 				return this.extensions.sort.getSort();
	 			}
	 		},

	 		clearSort:function(){
	 			if(this.extExists("sort", true)){
	 				this.extensions.sort.clear();
	 				this.rowManager.refreshActiveData();
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

	 		///////////////////// Filtering ////////////////////
	 		selectRow:function(rows){
	 			if(this.extExists("selectRow", true)){
	 				this.extensions.selectRow.selectRows(rows);
	 			}
	 		},

	 		deselectRow:function(rows){
	 			if(this.extExists("selectRow", true)){
	 				this.extensions.selectRow.deselectRows(rows);
	 			}
	 		},

	 		getSelectedRows:function(){
	 			if(this.extExists("selectRow", true)){
	 				return this.extensions.selectRow.getSelectedRows();
	 			}
	 		},

	 		getSelectedData:function(){
	 			if(this.extExists("selectRow", true)){
	 				return this.extensions.selectRow.getSelectedData();
	 			}
	 		},

	 		//////////// Pagination Functions  ////////////

	 		setMaxPage:function(max){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.setMaxPage(max);
	 			}else{
	 				return false;
	 			}
	 		},

	 		setPage:function(page){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.setPage(page);
	 			}else{
	 				return false;
	 			}
	 		},

	 		setPageSize:function(size){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.setPageSize(size);
	 				this.extensions.page.setPage(1);
	 			}else{
	 				return false;
	 			}
	 		},

	 		previousPage:function(){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.previousPage();
	 			}else{
	 				return false;
	 			}
	 		},

	 		nextPage:function(){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.nextPage();
	 			}else{
	 				return false;
	 			}
	 		},

	 		getPage:function(){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.getPage();
	 			}else{
	 				return false;
	 			}
	 		},

	 		getPageMax:function(){
	 			if(this.options.pagination && this.extExists("page")){
	 				this.extensions.page.getPageMax();
	 			}else{
	 				return false;
	 			}
	 		},


	 		/////////////// Download Management //////////////

	 		download:function(type, filename, options){
	 			if(this.extExists("download", true)){
	 				this.extensions.download.download(type, filename, options);
	 			}
	 		},

	 		////////////// Extension Management //////////////

	 		//object to hold extensions
	 		extensions:{},
	 		extensionBindings:{},

	 		//extend extension
	 		extendExtension:function(name, property, values){

	 			if(this.extensionBindings[name]){
	 				var source = this.extensionBindings[name].prototype[property];

	 				if(source){
	 					if(typeof values == "object"){
	 						for(let key in values){
	 							source[key] = values[key];
	 						}
	 					}else{
	 						console.warn("Extension Error - Invalid value type, it must be an object");
	 					}
	 				}else{
	 					console.warn("Extension Error - property does not exist:", property);
	 				}
	 			}else{
	 				console.warn("Extension Error - extension does not exist:", name);
	 			}

	 		},

	 		//add extension to tabulator
	 		registerExtension:function(name, extension){
	 			var self = this;
	 			this.extensionBindings[name] = extension;
	 		},

	 		//ensure that extensions are bound to instantiated function
	 		bindExtensions:function(){
	 			var self = this;

	 			this.extensions = {};

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

	 	};

	 	/*=include extensions/localize.js */

	 	/*=include extensions_enabled.js */

	 })();
