(function(){

	'use strict';

	/*=include polyfills.js */

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
			browser:"", //hold current browser type
			browserSlow:false, //handle reduced functionality for slower browsers

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

	 			footerElement:false, //hold footer element

	 			index:"id", //filed for row index

	 			keybindings:[], //array for keybindings

	 			downloadDataMutator:false, //function to manipulate table data before it is downloaded

	 			addRowPos:"bottom", //position to insert blank rows, top|bottom

	 			selectable:"highlight", //highlight rows on hover
	 			selectableRollingSelection:true, //roll selection once maximum number of selectable rows is reached
	 			selectablePersistence:true, // maintain selection when table view is updated
	 			selectableCheck:function(data, row){return true;}, //check wheather row is selectable

	 			headerFilterPlaceholder: false, //placeholder text to display in header filters

	 			history:false, //enable edit history

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
	 			ajaxFiltering:false,
	 			ajaxSorting:false,

	 			groupBy:false, //enable table grouping and set field to group by
				groupStartOpen:true, //starting state of group

				groupHeader:false, //header generation function

				movableColumns:false, //enable movable columns
				movableRows:false, //enable movable rows

				rowFormatter:false,

				placeholder:false,

				//table building callbacks
				tableBuilding:function(){},
				tableBuilt:function(){},

				//render callbacks
				renderStarted:function(){},
				renderComplete:function(){},

	 			//row callbacks
	 			rowClick:false,
	 			rowDblClick:false,
	 			rowContext:false,
	 			rowContext:false,
	 			rowTap:false,
	 			rowDblTap:false,
	 			rowTapHold:false,
	 			rowAdded:function(){},
	 			rowDeleted:function(){},
	 			rowMoved:function(){},
	 			rowUpdated:function(){},
	 			rowSelectionChanged:function(){},
	 			rowSelected:function(){},
	 			rowDeselected:function(){},

	 			//cell callbacks
	 			cellEditing:function(){},
	 			cellEdited:function(){},
	 			cellEditCancelled:function(){},

	 			//column callbacks
	 			columnMoved:function(){},
	 			columnResized:function(){},
	 			columnTitleChanged:function(){},
	 			columnVisibilityChanged:function(){},

	 			//HTML iport callbacks
	 			htmlImporting:function(){},
	 			htmlImported:function(){},

	 			//data callbacks
	 			dataLoading:function(){},
	 			dataLoaded:function(){},
	 			dataEdited:function(){},

	 			//ajax callbacks
	 			ajaxRequesting:function(){},
	 			ajaxResponse:false,
	 			ajaxError:function(){},

	 			//filtering callbacks
	 			dataFiltering:false,
	 			dataFiltered:false,

	 			//sorting callbacks
	 			dataSorting:function(){},
	 			dataSorted:function(){},

	 			//grouping callbacks
	 			dataGrouping:function(){},
	 			dataGrouped:false,
	 			groupVisibilityChanged:function(){},

	 			//pagination callbacks
	 			pageLoaded:function(){},

	 			//localization callbacks
	 			localized:function(){},

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

	 				//give the browser a chance to fully render the table then load first data set if present
	 				// setTimeout(function(){

	 					//load initial data set
	 					this._loadInitialData();

	 				// },20)
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

	 			this._detectBrowser();

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


	 			if(options.footerElement){
	 				this.footerManager.activate();
	 			}


	 			if(options.persistentLayout && this.extExists("persistentLayout", true)){
	 				ext.persistentLayout.initialize(options.persistentLayout, options.persistentLayoutID);
	 				options.columns = ext.persistentLayout.load(options.columns);
	 			}

	 			if(this.extExists("columnCalcs")){
	 				ext.columnCalcs.initialize();
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

	 			if(this.extExists("keybindings")){
	 				ext.keybindings.initialize();
	 			}

	 			if(this.extExists("selectRow")){
	 				ext.selectRow.clearSelectionData();
	 			}

	 			options.tableBuilt();
	 		},

	 		_loadInitialData: function(){
	 			var self = this;

	 			if(self.options.pagination && self.extExists("page")){
	 				self.extensions.page.reset(true);
	 				self.extensions.page.setPage(1);

	 				if(self.options.pagination == "local"){
	 					self.rowManager.setData(self.options.data);
	 				}
	 			}else{
	 				if(self.options.data.length){
	 					self.rowManager.setData(self.options.data);
	 				}else{
	 					if(self.options.ajaxURL && self.extExists("ajax")){
	 						self.extensions.ajax.sendRequest(function(data){
	 							self.rowManager.setData(data);
	 						});
	 					}else{
	 						self.rowManager.setData(self.options.data);
	 					}
	 				}
	 			}
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

	 		_detectBrowser(){
	 			var ua = navigator.userAgent;

	 			if(ua.indexOf("Trident") > -1){
	 				this.brower = "ie";
	 				this.browserSlow = true;
	 			}else if(ua.indexOf("Edge") > -1){
	 				this.brower = "edge";
	 				this.browserSlow = true;
	 			}else{
	 				this.brower = "other";
	 				this.browserSlow = false;
	 			}
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
	 			var row = this.rowManager.findRow(index);

	 			if(row){
	 				return row.getComponent();
	 			}else{
	 				console.warn("Find Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//delete row from table
	 		deleteRow:function(index){
	 			var row = this.rowManager.findRow(index);

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
	 			var row = this.rowManager.findRow(index);

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
	 			var row = this.rowManager.findRow(index);

	 			if(row){
	 				return this.rowManager.scrollToRow(row);
	 			}else{
	 				console.warn("Scroll Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		getRows:function(active){
	 			return this.rowManager.getComponents(active);
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

	 		getColumnLayout:function(){
	 			if(this.extExists("persistentLayout", true)){
	 				return this.extensions.persistentLayout.parseColumns(this.columnManager.getColumns());
	 			}
	 		},

	 		setColumnLayout:function(layout){
	 			if(this.extExists("persistentLayout", true)){
	 				this.columnManager.setColumns(this.extensions.persistentLayout.mergeDefinition(this.options.columns, layout))
	 				return true;
	 			}
	 			return false;
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
	 			this.rowManager.redraw(force);
	 		},

	 		setHeight:function(height){
	 			this.options.height = isNaN(height) ? height : height + "px";
	 			this.element.css({"height": this.options.height});
	 			this.rowManager.redraw();
	 		},

	 		///////////////////// Sorting ////////////////////

	 		//trigger sort
	 		setSort:function(sortList, dir){
	 			if(this.extExists("sort", true)){
	 				this.extensions.sort.setSort(sortList, dir);
	 				this.rowManager.sorterRefresh();
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
	 				this.rowManager.sorterRefresh();
	 			}
	 		},


	 		///////////////////// Filtering ////////////////////

	 		//set standard filters
	 		setFilter:function(field, type, value){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.setFilter(field, type, value);
	 				this.rowManager.filterRefresh();
	 			}
	 		},

	 		//add filter to array
	 		addFilter:function(field, type, value){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.addFilter(field, type, value);
	 				this.rowManager.filterRefresh();
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
	 				this.rowManager.filterRefresh();
	 			}
	 		},

	 		//clear filters
	 		clearFilter:function(all){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.clearFilter(all);
	 				this.rowManager.filterRefresh();
	 			}
	 		},

	 		//clear header filters
	 		clearHeaderFilter:function(){
	 			if(this.extExists("filter", true)){
	 				this.extensions.filter.clearHeaderFilter();
	 				this.rowManager.filterRefresh();
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

	 		toggleSelectRow:function(row){
	 			if(this.extExists("selectRow", true)){
	 				this.extensions.selectRow.toggleRow(row);
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

	 		///////////////// Grouping Functions ///////////////

	 		setGroupBy:function(groups){
	 			if(this.extExists("groupRows", true)){
	 				this.options.groupBy = groups;
	 				this.extensions.groupRows.initialize();
	 				this.rowManager.refreshActiveData();
	 			}else{
	 				return false;
	 			}
	 		},

	 		setGroupStartOpen:function(values){
	 			if(this.extExists("groupRows", true)){
	 				this.options.groupStartOpen = values;
	 				this.extensions.groupRows.initialize();
	 				if(this.options.groupBy){

	 					this.rowManager.refreshActiveData();
	 				}else{
	 					console.warn("Grouping Update - cant refresh view, no groups have been set");
	 				}
	 			}else{
	 				return false;
	 			}
	 		},

	 		setGroupHeader:function(values){
	 			if(this.extExists("groupRows", true)){
	 				this.options.groupHeader = values;
	 				this.extensions.groupRows.initialize();
	 				if(this.options.groupBy){
	 					this.rowManager.refreshActiveData();
	 				}else{
	 					console.warn("Grouping Update - cant refresh view, no groups have been set");
	 				}
	 			}else{
	 				return false;
	 			}
	 		},


	 		/////////////// Navigation Management //////////////

	 		navigatePrev:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().prev();
	 				}
	 			}

	 			return false;
	 		},

	 		navigateNext:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().next();
	 				}
	 			}

	 			return false;
	 		},

	 		navigateLeft:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().left();
	 				}
	 			}

	 			return false;
	 		},

	 		navigateRight:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().right();
	 				}
	 			}

	 			return false;
	 		},

	 		navigateUp:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().up();
	 				}
	 			}

	 			return false;
	 		},

	 		navigateDown:function(){
	 			var cell = false;

	 			if(this.table.extExists("edit", true)){
	 				cell = this.table.extensions.edit.currentCell;

	 				if(cell){
	 					e.preventDefault();
	 					return cell.nav().dpwn();
	 				}
	 			}

	 			return false;
	 		},


	 		/////////////// History Management //////////////
	 		undo:function(){
	 			if(this.options.history && this.extExists("history", true)){
	 				return this.extensions.history.undo();
	 			}else{
	 				return false;
	 			}
	 		},

	 		redo:function(){
	 			if(this.options.history && this.extExists("history", true)){
	 				return this.extensions.history.redo();
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
