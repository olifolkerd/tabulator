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

	 			layout:"fitData", ///layout type "fitColumns" | "fitData"
	 			layoutColumnsOnNewData:false, //update column widths on setData
	 			fitColumns:false, //DEPRICATED - fit colums to width of screen;

	 			columnMinWidth:40, //minimum global width for a column
	 			columnVertAlign:"top", //vertical alignment of column headers

	 			resizableColumns:true, //resizable columns
	 			resizableRows:false, //resizable rows
	 			autoResize:true, //auto resize table

	 			columns:[],//store for colum header info

	 			data:[], //default starting data

	 			tooltips: false, //Tool tip value
	 			tooltipsHeader: false, //Tool tip for headers
	 			tooltipGenerationMode:"load", //when to generate tooltips

	 			initialSort:false, //initial sorting criteria

	 			footerElement:false, //hold footer element

	 			index:"id", //filed for row index

	 			keybindings:[], //array for keybindings

	 			clipboard:false, //enable clipboard
	 			clipboardCopySelector:"active", //method of chosing which data is coppied to the clipboard
	 			clipboardCopyFormatter:"table", //convert data to a clipboard string
	 			clipboardCopyHeader:true, //include table headers in copt
	 			clipboardPasteParser:"table", //convert pasted clipboard data to rows
	 			clipboardPasteAction:"insert", //how to insert pasted data into the table

	 			clipboardCopied:function(){}, //data has been copied to the clipboard
	 			clipboardPasted:function(){}, //data has been pasted into the table
	 			clipboardPasteError:function(){}, //data has not successfully been pasted into the table

	 			downloadDataFormatter:false, //function to manipulate table data before it is downloaded
	 			downloadReady:function(data, blob){return blob;}, //function to manipulate download data
	 			downloadComplete:false, //function to manipulate download data

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

	 			persistentLayout:false, //store column layout in memory
	 			persistentSort:false, //store sorting in memory
	 			persistentFilter:false, //store filters in memory
	 			persistenceID:"", //key for persistent storage
	 			persistenceMode:true, //mode for storing persistence information
	 			persistentLayoutID:"",//DEPRICATED - key for persistent storage;

	 			responsiveLayout:false, //responsive layout flags
	 			responsiveLayoutCollapseStartOpen:true, //start showing collapsed data
	 			responsiveLayoutCollapseUseFormatters:true, //responsive layout collapse formatter
	 			responsiveLayoutCollapseFormatter:false, //responsive layout collapse formatter

	 			pagination:false, //set pagination type
				paginationSize:false, //set number of rows to a page
				paginationButtonCount: 5, // set count of page button 
	 			paginationElement:false, //element to hold pagination numbers
	 			paginationDataSent:{}, //pagination data sent to the server
	 			paginationDataReceived:{}, //pagination data received from the server
	 			paginator:false, //pagination url string builder
	 			paginationAddRow: "page", //add rows on table or page

	 			ajaxURL:false, //url for ajax loading
	 			ajaxParams:{}, //params for ajax loading
	 			ajaxConfig:"get", //ajax request type
	 			ajaxLoader:true, //show loader
	 			ajaxLoaderLoading:false, //loader element
	 			ajaxLoaderError:false, //loader element
	 			ajaxFiltering:false,
	 			ajaxSorting:false,
	 			ajaxProgressiveLoad:false, //progressive loading
	 			ajaxProgressiveLoadDelay:0, //delay between requests
	 			ajaxProgressiveLoadScrollMargin:0, //margin before scroll begins

	 			groupBy:false, //enable table grouping and set field to group by
				groupStartOpen:true, //starting state of group

				groupHeader:false, //header generation function

				movableColumns:false, //enable movable columns

				movableRows:false, //enable movable rows
				movableRowsConnectedTables:false, //tables for movable rows to be connected to
				movableRowsSender:false,
				movableRowsReceiver:"insert",
				movableRowsSendingStart:function(){},
				movableRowsSent:function(){},
				movableRowsSentFailed:function(){},
				movableRowsSendingStop:function(){},
				movableRowsReceivingStart:function(){},
				movableRowsReceived:function(){},
				movableRowsReceivedFailed:function(){},
				movableRowsReceivingStop:function(){},

				scrollToRowPosition:"top",
				scrollToRowIfVisible:true,

				scrollToColumnPosition:"left",
				scrollToColumnIfVisible:true,

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
	 			rowResized:function(){},

	 			//cell callbacks
	 			//row callbacks
	 			cellClick:false,
	 			cellDblClick:false,
	 			cellContext:false,
	 			cellTap:false,
	 			cellDblTap:false,
	 			cellTapHold:false,
	 			cellEditing:function(){},
	 			cellEdited:function(){},
	 			cellEditCancelled:function(){},

	 			//column callbacks
	 			columnMoved:false,
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
	 			groupToggleElement:"arrow",
	 			groupClosedShowCalcs:false,
	 			dataGrouping:function(){},
	 			dataGrouped:false,
	 			groupVisibilityChanged:function(){},
	 			groupClick:false,
	 			groupDblClick:false,
	 			groupContext:false,
	 			groupTap:false,
	 			groupDblTap:false,
	 			groupTapHold:false,

	 			columnCalcs:true,

	 			//pagination callbacks
	 			pageLoaded:function(){},

	 			//localization callbacks
	 			localized:function(){},

	 			//validation has failed
	 			validationFailed:function(){},

	 			//history callbacks
	 			historyUndo:function(){},
	 			historyRedo:function(){},

	 		},

	 		//convert depricated functionality to new functions
	 		_mapDepricatedFunctionality:function(){

	 			if(this.options.fitColumns){
	 				this.options.layout = "fitColumns";
	 				console.warn("The%c fitColumns:true%c option has been depricated and will be removed in version 4.0, use %c layout:'fitColumns'%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 			}

	 			if(this.options.persistentLayoutID){
	 				this.options.persistenceID = this.options.persistentLayoutID;
	 				console.warn("The%c persistentLayoutID%c option has been depricated and will be removed in version 4.0, use %c persistenceID%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 			}

	 			if(this.options.persistentLayout === "cookie" || this.options.persistentLayout === "local"){
	 				this.options.persistenceMode = this.options.persistentLayout;
	 				this.options.persistentLayout = true;
	 				console.warn("Setting the persistent storage mode on the%c persistentLayout%c option has been depricated and will be removed in version 4.0, use %c persistenceMode%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 			}

	 			if(this.options.downloadDataMutator){
	 				this.options.downloadDataFormatter = this.options.downloadDataMutator;
	 				console.warn("The%c downloadDataMutator%c option has been depricated and will be removed in version 4.0, use %cdownloadDataFormatter%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 			}

	 		},

	 		//constructor
	 		_create: function(){
	 			var self = this,
	 			element = this.element;

	 			self._clearObjectPointers();

	 			self._mapDepricatedFunctionality();

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

	 				//load initial data set
	 				this._loadInitialData();
	 			}
	 		},

	 		//clear pointers to objects in default config object

	 		_clearObjectPointers: function(){
	 			this.options.columns = this.options.columns.slice(0);
	 			this.options.data = this.options.data.slice(0);
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

	 			//set table height
	 			if(options.height){
	 				options.height = isNaN(options.height) ? options.height : options.height + "px";
	 				this.element.css({"height": options.height});
	 			}

	 			this.rowManager.initialize();

	 			this._detectBrowser();

	 			if(this.extExists("layout", true)){
	 				ext.layout.initialize(options.layout);
	 			}

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

	 			//build table elements
	 			element.append(this.columnManager.getElement());
	 			element.append(this.rowManager.getElement());


	 			if(options.footerElement){
	 				this.footerManager.activate();
	 			}


	 			if( (options.persistentLayout || options.persistentSort || options.persistentFilter) && this.extExists("persistence", true)){
	 				ext.persistence.initialize(options.persistenceMode, options.persistenceID);
	 			}

	 			if(options.persistentLayout && this.extExists("persistence", true)){
	 				options.columns = ext.persistence.load("columns", options.columns) ;
	 			}

	 			if(options.movableRows && this.extExists("moveRow")){
	 				ext.moveRow.initialize();
	 			}

	 			if(this.extExists("columnCalcs")){
	 				ext.columnCalcs.initialize();
	 			}

	 			this.columnManager.setColumns(options.columns);

	 			if(this.extExists("frozenRows")){
	 				this.extensions.frozenRows.initialize();
	 			}

	 			if((options.persistentSort || options.initialSort) && this.extExists("sort", true)){
	 				var sorters = [];

	 				if(options.persistentSort && this.extExists("persistence", true)){
	 					sorters = ext.persistence.load("sort");

	 					if(sorters === false && options.initialSort){
	 						sorters = options.initialSort;
	 					}
	 				}else if(options.initialSort){
	 					sorters = options.initialSort;
	 				}

	 				ext.sort.setSort(sorters);
	 			}

	 			if(options.persistentFilter && this.extExists("persistence", true)){
	 				var filters = ext.persistence.load("filter");

	 				if(filters !== false){
	 					this.setFilter(filters);
	 				}
	 			}

	 			if(this.extExists("ajax")){
	 				ext.ajax.initialize();
	 			}

	 			if(options.pagination && this.extExists("page", true)){
	 				ext.page.initialize();
	 			}

	 			if(options.groupBy && this.extExists("groupRows", true)){
	 				ext.groupRows.initialize();
	 			}

	 			if(this.extExists("keybindings")){
	 				ext.keybindings.initialize();
	 			}

	 			if(this.extExists("selectRow")){
	 				ext.selectRow.clearSelectionData(true);
	 			}

	 			if(options.autoResize && this.extExists("resizeTable")){
	 				ext.resizeTable.initialize();
	 			}

	 			if(this.extExists("clipboard")){
	 				ext.clipboard.initialize();
	 			}

	 			options.tableBuilt();
	 		},

	 		_loadInitialData: function(){
	 			var self = this;

	 			if(self.options.pagination && self.extExists("page")){
	 				self.extensions.page.reset(true);

	 				if(self.options.pagination == "local"){
	 					if(self.options.data.length){
	 						self.rowManager.setData(self.options.data);
	 					}else{
	 						if(self.options.ajaxURL && self.extExists("ajax")){
	 							self.extensions.ajax.loadData();
	 						}else{
	 							self.rowManager.setData(self.options.data);
	 						}
	 					}
	 				}else{
	 					self.extensions.page.setPage(1);
	 				}
	 			}else{
	 				if(self.options.data.length){
	 					self.rowManager.setData(self.options.data);
	 				}else{
	 					if(self.options.ajaxURL && self.extExists("ajax")){
	 						self.extensions.ajax.loadData();
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

	 			//clear row data
	 			this.rowManager.rows.forEach(function(row){
	 				row.wipe();
	 			});

	 			this.rowManager.rows = [];
	 			this.rowManager.activeRows = [];
	 			this.rowManager.displayRows = [];

	 			//clear event bindings
	 			if(this.options.autoResize && this.extExists("resizeTable")){
	 				this.extensions.resizeTable.clearBindings();
	 			}

	 			if(this.extExists("keybindings")){
	 				this.extensions.keybindings.clearBindings();
	 			}

	 			//clear DOM
	 			element.empty();
	 			element.removeClass("tabulator");
	 		},

	 		_detectBrowser(){
	 			var ua = navigator.userAgent;

	 			if(ua.indexOf("Trident") > -1){
	 				this.browser = "ie";
	 				this.browserSlow = true;
	 			}else if(ua.indexOf("Edge") > -1){
	 				this.browser = "edge";
	 				this.browserSlow = true;
	 			}else if(ua.indexOf("Firefox") > -1){
	 				this.browser = "firefox";
	 				this.browserSlow = false;
	 			}else{
	 				this.browser = "other";
	 				this.browserSlow = false;
	 			}
	 		},

	 		////////////////// Data Handling //////////////////


	 		//load data

	 		setData:function(data, params, config){
	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

	 			this._setData(data, params, config);
	 		},

	 		_setData:function(data, params, config, inPosition){
	 			var self = this;

	 			if(typeof(data) === "string"){
	 				if (data.indexOf("{") == 0 || data.indexOf("[") == 0){
	 					//data is a json encoded string
	 					self.rowManager.setData(JSON.parse(data), inPosition);
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
	 							self.extensions.ajax.loadData(inPosition);
	 						}
	 					}
	 				}
	 			}else{
	 				if(data){
	 					//asume data is already an object
	 					self.rowManager.setData(data, inPosition);
	 				}else{

	 					//no data provided, check if ajaxURL is present;
	 					if(self.extExists("ajax") && self.extensions.ajax.getUrl){

	 						if(self.options.pagination == "remote" && self.extExists("page", true)){
	 							self.extensions.page.reset(true);
	 							self.extensions.page.setPage(1);
	 						}else{
	 							self.extensions.ajax.loadData(inPosition);
	 						}

	 					}else{
	 						//empty data
	 						self.rowManager.setData([], inPosition);
	 					}
	 				}
	 			}
	 		},

	 		//clear data
	 		clearData:function(){
	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

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

	 		//get table html
	 		getHtml:function(active){
	 			return this.rowManager.getHtml(active);
	 		},

	 		//retrieve Ajax URL
	 		getAjaxUrl:function(){
	 			if(this.extExists("ajax", true)){
	 				return this.extensions.ajax.getUrl();
	 			}
	 		},

	 		//replace data, keeping table in position with same sort
	 		replaceData:function(data, params, config){
	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

	 			this._setData(data, params, config, true);
	 		},


	 		//update table data
	 		updateData:function(data){
	 			var self = this;

	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

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

	 		addData:function(data, pos, index){
	 			var rows = [], output = [];

	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

	 			if(data){
	 				rows = this.rowManager.addRows(data, pos, index);

	 				rows.forEach(function(row){
	 					output.push(row.getComponent());
	 				});

	 				return output;
	 			}else{
	 				console.warn("Update Error - No data provided");
	 			}
	 		},

	 		//update table data
	 		updateOrAddData:function(data){
	 			var self = this;
	 			var rows = [];

	 			if(this.extExists("ajax")){
	 				this.extensions.ajax.blockActiveRequest();
	 			}

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

	 			if(data){
	 				data.forEach(function(item){
	 					var row = self.rowManager.findRow(item[self.options.index]);

	 					if(row){
	 						row.updateData(item)
	 						rows.push(row.getComponent());
	 					}else{
	 						rows.push(self.rowManager.addRows(item)[0].getComponent());
	 					}
	 				})

	 				return rows;
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

	 		//get row object
	 		getRowFromPosition:function(position, active){
	 			var row = this.rowManager.getRowFromPosition(position, active);

	 			if(row){
	 				return row.getComponent();
	 			}else{
	 				console.warn("Find Error - No matching row found:", position);
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

	 			var row;

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

	 			row = this.rowManager.addRows(data, pos, index)[0];

	 			//recalc column calculations if present
	 			if(this.extExists("columnCalcs")){
	 				this.extensions.columnCalcs.recalc(this.rowManager.activeRows);
	 			}

	 			return row.getComponent();
	 		},

	 		//update a row if it exitsts otherwise create it
	 		updateOrAddRow:function(index, data){
	 			var row = this.rowManager.findRow(index);

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

	 			if(row){
	 				row.updateData(data);
	 			}else{
	 				row = this.rowManager.addRows(data)[0];

	 				//recalc column calculations if present
	 				if(this.extExists("columnCalcs")){
	 					this.extensions.columnCalcs.recalc(this.rowManager.activeRows);
	 				}
	 			}
	 			return row.getComponent();
	 		},

	 		//update row data
	 		updateRow:function(index, data){
	 			var row = this.rowManager.findRow(index);

	 			if(typeof data === "string"){
	 				data = JSON.parse(data);
	 			}

	 			if(row){
	 				row.updateData(data);
	 				return row.getComponent();
	 			}else{
	 				console.warn("Update Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//scroll to row in DOM
	 		scrollToRow:function(index, position, ifVisible){
	 			var row = this.rowManager.findRow(index);

	 			if(row){
	 				return this.rowManager.scrollToRow(row, position, ifVisible);
	 			}else{
	 				console.warn("Scroll Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		getRows:function(active){
	 			return this.rowManager.getComponents(active);
	 		},

	 		//get position of row in table
	 		getRowPosition:function(index, active){
	 			var row = this.rowManager.findRow(index);

	 			if(row){
	 				return this.rowManager.getRowPosition(row, active);
	 			}else{
	 				console.warn("Position Error - No matching row found:", index);
	 				return false;
	 			}
	 		},

	 		//copy table data to clipboard
	 		copyToClipboard:function(selector, selectorParams, formatter, formatterParams){
	 			if(this.extExists("clipboard", true)){
	 				this.extensions.clipboard.copy(selector, selectorParams, formatter, formatterParams);
	 			}
	 		},

	 		/////////////// Column Functions  ///////////////

	 		setColumns:function(definition){
	 			this.columnManager.setColumns(definition);
	 		},

	 		getColumns:function(structured){
	 			return this.columnManager.getComponents(structured);
	 		},

	 		getColumnDefinitions:function(){
	 			return this.columnManager.getDefinitionTree();
	 		},

	 		getColumnLayout:function(){
	 			if(this.extExists("persistence", true)){
	 				return this.extensions.persistence.parseColumns(this.columnManager.getColumns());
	 			}
	 		},

	 		setColumnLayout:function(layout){
	 			if(this.extExists("persistence", true)){
	 				this.columnManager.setColumns(this.extensions.persistence.mergeDefinition(this.options.columns, layout))
	 				return true;
	 			}
	 			return false;
	 		},

	 		showColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				column.show();

	 				if(this.options.responsiveLayout && this.extExists("responsiveLayout", true)){
	 					this.extensions.responsiveLayout.update();
	 				}
	 			}else{
	 				console.warn("Column Show Error - No matching column found:", field);
	 				return false;
	 			}
	 		},

	 		hideColumn:function(field){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				column.hide();

	 				if(this.options.responsiveLayout && this.extExists("responsiveLayout", true)){
	 					this.extensions.responsiveLayout.update();
	 				}
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

	 		//scroll to column in DOM
	 		scrollToColumn:function(field, position, ifVisible){
	 			var column = this.columnManager.findColumn(field);

	 			if(column){
	 				return this.columnManager.scrollToColumn(column, position, ifVisible);
	 			}else{
	 				console.warn("Scroll Error - No matching column found:", field);
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
	 				console.warn("The%c getSort%c function has been depricated and will be removed in version 4.0, use %c getSorters%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 				return this.getSorters();
	 			}
	 		},

	 		getSorters:function(){
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
	 		getFilter:function(all){
	 			console.warn("The%c getFilter%c function has been depricated and will be removed in version 4.0, use %c getFilters%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");
	 			this.getFilters(all);
	 		},

	 		getFilters:function(all){
	 			if(this.extExists("filter", true)){
	 				return this.extensions.filter.getFilters(all);
	 			}
	 		},

	 		setHeaderFilterFocus:function(field){
	 			if(this.extExists("filter", true)){
	 				var column = this.columnManager.findColumn(field);

	 				if(column){
	 					this.extensions.filter.setHeaderFilterFocus(column);
	 				}else{
	 					console.warn("Column Filter Focus Error - No matching column found:", field);
	 					return false;
	 				}
	 			}
	 		},


	 		setHeaderFilterValue:function(field, value){
	 			if(this.extExists("filter", true)){
	 				var column = this.columnManager.findColumn(field);

	 				if(column){
	 					this.extensions.filter.setHeaderFilterValue(column, value);
	 				}else{
	 					console.warn("Column Filter Error - No matching column found:", field);
	 					return false;
	 				}
	 			}
	 		},

	 		getHeaderFilters:function(){
	 			if(this.extExists("filter", true)){
	 				return this.extensions.filter.getHeaderFilters();
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

	 		getPageSize:function(){
	 			if(this.options.pagination && this.extExists("page", true)){
	 				return this.extensions.page.getPageSize();
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
	 				return this.extensions.page.getPage();
	 			}else{
	 				return false;
	 			}
	 		},

	 		getPageMax:function(){
	 			if(this.options.pagination && this.extExists("page")){
	 				return this.extensions.page.getPageMax();
	 			}else{
	 				return false;
	 			}
	 		},

	 		///////////////// Grouping Functions ///////////////

	 		setGroupBy:function(groups){
	 			if(this.extExists("groupRows", true)){
	 				this.options.groupBy = groups;
	 				this.extensions.groupRows.initialize();
	 				this.rowManager.refreshActiveData("display");
	 			}else{
	 				return false;
	 			}
	 		},

	 		setGroupStartOpen:function(values){
	 			if(this.extExists("groupRows", true)){
	 				this.options.groupStartOpen = values;
	 				this.extensions.groupRows.initialize();
	 				if(this.options.groupBy){
	 					this.rowManager.refreshActiveData("group");
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
	 					this.rowManager.refreshActiveData("group");
	 				}else{
	 					console.warn("Grouping Update - cant refresh view, no groups have been set");
	 				}
	 			}else{
	 				return false;
	 			}
	 		},

	 		getGroups:function(values){
	 			if(this.extExists("groupRows", true)){
	 				return this.extensions.groupRows.getGroups();
	 			}else{
	 				return false;
	 			}
	 		},


	 		///////////////// Column Calculation Functions ///////////////
	 		getCalcResults:function(){
	 			if(this.extExists("columnCalcs", true)){
	 				return this.extensions.columnCalcs.getResults();
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

	 		/////////// Inter Table Communications ///////////

	 		tableComms:function(table, extension, action, data){
	 			this.extensions.comms.receive(table, extension, action, data)
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

	 	/*=include extensions/layout.js */
	 	/*=include extensions/localize.js */
	 	/*=include extensions/comms.js */

	 	/*=include extensions_enabled.js */

	 })();
