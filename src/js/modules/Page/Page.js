import Module from '../../core/Module.js';

import defaultPageCounters from './defaults/pageCounters.js';

class Page extends Module{
	
	constructor(table){
		super(table);
		
		this.mode = "local";
		this.progressiveLoad = false;
		
		this.element = null;
		this.pageCounterElement = null;
		this.pageCounter = null;
		
		this.size = 0;
		this.page = 1;
		this.count = 5;
		this.max = 1;

		this.remoteRowCountEstimate = null;
		
		this.initialLoad = true;
		this.dataChanging = false; //flag to check if data is being changed by this module
		
		this.pageSizes = [];
		
		this.registerTableOption("pagination", false); //set pagination type
		this.registerTableOption("paginationMode", "local"); //local or remote pagination
		this.registerTableOption("paginationSize", false); //set number of rows to a page
		this.registerTableOption("paginationInitialPage", 1); //initial page to show on load
		this.registerTableOption("paginationCounter", false);  // set pagination counter
		this.registerTableOption("paginationCounterElement", false);  // set pagination counter
		this.registerTableOption("paginationButtonCount", 5);  // set count of page button
		this.registerTableOption("paginationSizeSelector", false); //add pagination size selector element
		this.registerTableOption("paginationElement", false); //element to hold pagination numbers
		// this.registerTableOption("paginationDataSent", {}); //pagination data sent to the server
		// this.registerTableOption("paginationDataReceived", {}); //pagination data received from the server
		this.registerTableOption("paginationAddRow", "page"); //add rows on table or page
		
		this.registerTableOption("progressiveLoad", false); //progressive loading
		this.registerTableOption("progressiveLoadDelay", 0); //delay between requests
		this.registerTableOption("progressiveLoadScrollMargin", 0); //margin before scroll begins
		
		this.registerTableFunction("setMaxPage", this.setMaxPage.bind(this));
		this.registerTableFunction("setPage", this.setPage.bind(this));
		this.registerTableFunction("setPageToRow", this.userSetPageToRow.bind(this));
		this.registerTableFunction("setPageSize", this.userSetPageSize.bind(this));
		this.registerTableFunction("getPageSize", this.getPageSize.bind(this));
		this.registerTableFunction("previousPage", this.previousPage.bind(this));
		this.registerTableFunction("nextPage", this.nextPage.bind(this));
		this.registerTableFunction("getPage", this.getPage.bind(this));
		this.registerTableFunction("getPageMax", this.getPageMax.bind(this));
		
		//register component functions
		this.registerComponentFunction("row", "pageTo", this.setPageToRow.bind(this));
	}
	
	initialize(){
		if(this.table.options.pagination){
			this.subscribe("row-deleted", this.rowsUpdated.bind(this));
			this.subscribe("row-added", this.rowsUpdated.bind(this));
			this.subscribe("data-processed", this.initialLoadComplete.bind(this));
			this.subscribe("table-built", this.calculatePageSizes.bind(this));
			this.subscribe("footer-redraw", this.footerRedraw.bind(this));

			if(this.table.options.paginationAddRow == "page"){
				this.subscribe("row-adding-position", this.rowAddingPosition.bind(this));
			}
			
			if(this.table.options.paginationMode === "remote"){
				this.subscribe("data-params", this.remotePageParams.bind(this));
				this.subscribe("data-loaded", this._parseRemoteData.bind(this));
			}
			
			if(this.table.options.progressiveLoad){
				console.error("Progressive Load Error - Pagination and progressive load cannot be used at the same time");
			}
			
			this.registerDisplayHandler(this.restOnRenderBefore.bind(this), 40);
			this.registerDisplayHandler(this.getRows.bind(this), 50);
			
			this.createElements();
			this.initializePageCounter();
			this.initializePaginator();
		}else if(this.table.options.progressiveLoad){
			this.subscribe("data-params", this.remotePageParams.bind(this));
			this.subscribe("data-loaded", this._parseRemoteData.bind(this));
			this.subscribe("table-built", this.calculatePageSizes.bind(this));
			this.subscribe("data-processed", this.initialLoadComplete.bind(this));
			
			this.initializeProgressive(this.table.options.progressiveLoad);
			
			if(this.table.options.progressiveLoad === "scroll"){
				this.subscribe("scroll-vertical", this.scrollVertical.bind(this));
			}
		}
	}
	
	rowAddingPosition(row, top){
		var rowManager = this.table.rowManager,
		displayRows = rowManager.getDisplayRows(),
		index;
		
		if(top){
			if(displayRows.length){
				index = displayRows[0];
			}else{
				if(rowManager.activeRows.length){
					index = rowManager.activeRows[rowManager.activeRows.length-1];
					top = false;
				}
			}
		}else{
			if(displayRows.length){
				index = displayRows[displayRows.length - 1];
				top = displayRows.length < this.size ? false : true;
			}
		}
		
		return {index, top};
	}
	
	calculatePageSizes(){
		var testElRow, testElCell;
		
		if(this.table.options.paginationSize){
			this.size = this.table.options.paginationSize;
		}else{
			testElRow = document.createElement("div");
			testElRow.classList.add("tabulator-row");
			testElRow.style.visibility = "hidden";
			
			testElCell = document.createElement("div");
			testElCell.classList.add("tabulator-cell");
			testElCell.innerHTML = "Page Row Test";
			
			testElRow.appendChild(testElCell);
			
			this.table.rowManager.getTableElement().appendChild(testElRow);
			
			this.size = Math.floor(this.table.rowManager.getElement().clientHeight / testElRow.offsetHeight);
			
			this.table.rowManager.getTableElement().removeChild(testElRow);
		}

		this.dispatchExternal("pageSizeChanged", this.size);
		
		this.generatePageSizeSelectList();
	}
	
	initialLoadComplete(){
		this.initialLoad = false;
	}
	
	remotePageParams(data, config, silent, params){
		if(!this.initialLoad){
			if((this.progressiveLoad && !silent) || (!this.progressiveLoad && !this.dataChanging)){
				this.reset(true);
			}
		}
		
		//configure request params
		params.page = this.page;
		
		//set page size if defined
		if(this.size){
			params.size = this.size;
		}
		
		return params;
	}
	
	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////
	
	userSetPageToRow(row){
		if(this.table.options.pagination){
			row = this.rowManager.findRow(row);
			
			if(row){
				return this.setPageToRow(row);
			}
		}
		
		return Promise.reject();
	}
	
	userSetPageSize(size){
		if(this.table.options.pagination){
			this.setPageSize(size);
			return this.setPage(1);
		}else{
			return false;
		}
	}
	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////
	
	scrollVertical(top, dir){
		var element, diff, margin;
		if(!dir && !this.table.dataLoader.loading){
			element = this.table.rowManager.getElement();
			diff = element.scrollHeight - element.clientHeight - top;
			margin = this.table.options.progressiveLoadScrollMargin || (element.clientHeight * 2);
			
			if(diff < margin){
				this.nextPage()
					.catch(() => {}); //consume the exception thrown when on the last page
			}
		}
	}
	
	restOnRenderBefore(rows, renderInPosition){
		if(!renderInPosition){
			if(this.mode === "local"){
				this.reset();
			}
		}
		
		return rows;
	}
	
	rowsUpdated(){
		this.refreshData(true, "all");
	}
	
	createElements(){
		var button;
		
		this.element = document.createElement("span");
		this.element.classList.add("tabulator-paginator");
		
		this.pagesElement = document.createElement("span");
		this.pagesElement.classList.add("tabulator-pages");
		
		button = document.createElement("button");
		button.classList.add("tabulator-page");
		button.setAttribute("type", "button");
		button.setAttribute("role", "button");
		button.setAttribute("aria-label", "");
		button.setAttribute("title", "");
		
		this.firstBut = button.cloneNode(true);
		this.firstBut.setAttribute("data-page", "first");
		
		this.prevBut = button.cloneNode(true);
		this.prevBut.setAttribute("data-page", "prev");
		
		this.nextBut = button.cloneNode(true);
		this.nextBut.setAttribute("data-page", "next");
		
		this.lastBut = button.cloneNode(true);
		this.lastBut.setAttribute("data-page", "last");
		
		if(this.table.options.paginationSizeSelector){
			this.pageSizeSelect = document.createElement("select");
			this.pageSizeSelect.classList.add("tabulator-page-size");
		}
	}
	
	generatePageSizeSelectList(){
		var pageSizes = [];
		
		if(this.pageSizeSelect){
			
			if(Array.isArray(this.table.options.paginationSizeSelector)){
				pageSizes = this.table.options.paginationSizeSelector;
				this.pageSizes = pageSizes;
				
				if(this.pageSizes.indexOf(this.size) == -1){
					pageSizes.unshift(this.size);
				}
			}else{
				
				if(this.pageSizes.indexOf(this.size) == -1){
					pageSizes = [];
					
					for (let i = 1; i < 5; i++){
						pageSizes.push(this.size * i);
					}
					
					this.pageSizes = pageSizes;
				}else{
					pageSizes = this.pageSizes;
				}
			}
			
			while(this.pageSizeSelect.firstChild) this.pageSizeSelect.removeChild(this.pageSizeSelect.firstChild);
			
			pageSizes.forEach((item) => {
				var itemEl = document.createElement("option");
				itemEl.value = item;
				
				if(item === true){
					this.langBind("pagination|all", function(value){
						itemEl.innerHTML = value;
					});
				}else{
					itemEl.innerHTML = item;
				}
				
				
				
				this.pageSizeSelect.appendChild(itemEl);
			});
			
			this.pageSizeSelect.value = this.size;
		}
	}
	
	initializePageCounter(){
		var counter = this.table.options.paginationCounter,
		pageCounter = null;
		
		if(counter){
			if(typeof counter === "function"){
				pageCounter = counter;
			}else{
				pageCounter = Page.pageCounters[counter];
			}
			
			if(pageCounter){
				this.pageCounter = pageCounter;
				
				this.pageCounterElement = document.createElement("span");
				this.pageCounterElement.classList.add("tabulator-page-counter");
			}else{
				console.warn("Pagination Error - No such page counter found: ", counter);
			}
		}
	}
	
	//setup pagination
	initializePaginator(hidden){
		var pageSelectLabel, paginationCounterHolder;
		
		if(!hidden){
			//build pagination element
			
			//bind localizations
			this.langBind("pagination|first", (value) => {
				this.firstBut.innerHTML = value;
			});
			
			this.langBind("pagination|first_title", (value) => {
				this.firstBut.setAttribute("aria-label", value);
				this.firstBut.setAttribute("title", value);
			});
			
			this.langBind("pagination|prev", (value) => {
				this.prevBut.innerHTML = value;
			});
			
			this.langBind("pagination|prev_title", (value) => {
				this.prevBut.setAttribute("aria-label", value);
				this.prevBut.setAttribute("title", value);
			});
			
			this.langBind("pagination|next", (value) => {
				this.nextBut.innerHTML = value;
			});
			
			this.langBind("pagination|next_title", (value) => {
				this.nextBut.setAttribute("aria-label", value);
				this.nextBut.setAttribute("title", value);
			});
			
			this.langBind("pagination|last", (value) => {
				this.lastBut.innerHTML = value;
			});
			
			this.langBind("pagination|last_title", (value) => {
				this.lastBut.setAttribute("aria-label", value);
				this.lastBut.setAttribute("title", value);
			});
			
			//click bindings
			this.firstBut.addEventListener("click", () => {
				this.setPage(1);
			});
			
			this.prevBut.addEventListener("click", () => {
				this.previousPage();
			});
			
			this.nextBut.addEventListener("click", () => {
				this.nextPage();
			});
			
			this.lastBut.addEventListener("click", () => {
				this.setPage(this.max);
			});
			
			if(this.table.options.paginationElement){
				this.element = this.table.options.paginationElement;
			}
			
			if(this.pageSizeSelect){
				pageSelectLabel = document.createElement("label");
				
				this.langBind("pagination|page_size", (value) => {
					this.pageSizeSelect.setAttribute("aria-label", value);
					this.pageSizeSelect.setAttribute("title", value);
					pageSelectLabel.innerHTML = value;
				});
				
				this.element.appendChild(pageSelectLabel);
				this.element.appendChild(this.pageSizeSelect);
				
				this.pageSizeSelect.addEventListener("change", (e) => {
					this.setPageSize(this.pageSizeSelect.value == "true" ? true : this.pageSizeSelect.value);
					this.setPage(1);
				});
			}
			
			//append to DOM
			this.element.appendChild(this.firstBut);
			this.element.appendChild(this.prevBut);
			this.element.appendChild(this.pagesElement);
			this.element.appendChild(this.nextBut);
			this.element.appendChild(this.lastBut);
			
			if(!this.table.options.paginationElement){
				if(this.table.options.paginationCounter){

					paginationCounterHolder; 

					if(this.table.options.paginationCounterElement){
						if(this.table.options.paginationCounterElement instanceof HTMLElement){
							this.table.options.paginationCounterElement.appendChild(this.pageCounterElement);
						}else if(typeof this.table.options.paginationCounterElement === "string"){
							paginationCounterHolder = document.querySelector(this.table.options.paginationCounterElement);
							
							if(paginationCounterHolder){
								paginationCounterHolder.appendChild(this.pageCounterElement);
							}else{
								console.warn("Pagination Error - Unable to find element matching paginationCounterElement selector:", this.table.options.paginationCounterElement);
							}
						}
					}else{
						this.footerAppend(this.pageCounterElement);
					}
					
				}
				
				this.footerAppend(this.element);
			}
			
			this.page = this.table.options.paginationInitialPage;
			this.count = this.table.options.paginationButtonCount;
		}
		
		//set default values
		this.mode = this.table.options.paginationMode;
	}
	
	initializeProgressive(mode){
		this.initializePaginator(true);
		this.mode = "progressive_" + mode;
		this.progressiveLoad = true;
	}
	
	trackChanges(){
		this.dispatch("page-changed");
	}
	
	//calculate maximum page from number of rows
	setMaxRows(rowCount){
		if(!rowCount){
			this.max = 1;
		}else{
			this.max = this.size === true ?  1 : Math.ceil(rowCount/this.size);
		}
		
		if(this.page > this.max){
			this.page = this.max;
		}
	}
	
	//reset to first page without triggering action
	reset(force){
		if(!this.initialLoad){
			if(this.mode == "local" || force){
				this.page = 1;
				this.trackChanges();
			}
		}
	}
	
	//set the maximum page
	setMaxPage(max){
		
		max = parseInt(max);
		
		this.max = max || 1;
		
		if(this.page > this.max){
			this.page = this.max;
			this.trigger();
		}
	}
	
	//set current page number
	setPage(page){
		switch(page){
			case "first":
				return this.setPage(1);
	
			case "prev":
				return this.previousPage();
			
			case "next":
				return this.nextPage();
			
			case "last":
				return this.setPage(this.max);
		}
		
		page = parseInt(page);
		
		if((page > 0 && page <= this.max) || this.mode !== "local"){
			this.page = page;
			
			this.trackChanges();
			
			return this.trigger();
		}else{
			console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
			return Promise.reject();
		}
	}
	
	setPageToRow(row){
		var rows = this.displayRows(-1);
		var index = rows.indexOf(row);
	
		if(index > -1){
			var page = this.size === true ? 1 : Math.ceil((index + 1) / this.size);
			
			return this.setPage(page);
		}else{
			console.warn("Pagination Error - Requested row is not visible");
			return Promise.reject();
		}
	}
	
	setPageSize(size){
		if(size !== true){
			size = parseInt(size);
		}

		if(size > 0){
			this.size = size;
			this.dispatchExternal("pageSizeChanged", size);
		}
		
		if(this.pageSizeSelect){
			// this.pageSizeSelect.value = size;
			this.generatePageSizeSelectList();
		}
		
		this.trackChanges();
	}
	
	_setPageCounter(totalRows, size, currentRow){
		var content;
		
		if(this.pageCounter){

			if(this.mode === "remote"){
				size = this.size;
				currentRow = ((this.page - 1) * this.size) + 1;
				totalRows = this.remoteRowCountEstimate;
			}

			content = this.pageCounter.call(this, size, currentRow, this.page, totalRows, this.max);
			
			switch(typeof content){
				case "object":
					if(content instanceof Node){
					
						//clear previous cell contents
						while(this.pageCounterElement.firstChild) this.pageCounterElement.removeChild(this.pageCounterElement.firstChild);
					
						this.pageCounterElement.appendChild(content);
					}else{
						this.pageCounterElement.innerHTML = "";
					
						if(content != null){
							console.warn("Page Counter Error - Page Counter has returned a type of object, the only valid page counter object return is an instance of Node, the page counter returned:", content);
						}
					}
					break;
				case "undefined":
					this.pageCounterElement.innerHTML = "";
					break;
				default:
					this.pageCounterElement.innerHTML = content;
			}
		}
	}
	
	//setup the pagination buttons
	_setPageButtons(){
		let leftSize = Math.floor((this.count-1) / 2);
		let rightSize = Math.ceil((this.count-1) / 2);
		let min = this.max - this.page + leftSize + 1 < this.count ? this.max-this.count+1: Math.max(this.page-leftSize,1);
		let max = this.page <= rightSize? Math.min(this.count, this.max) :Math.min(this.page+rightSize, this.max);
		
		while(this.pagesElement.firstChild) this.pagesElement.removeChild(this.pagesElement.firstChild);
		
		if(this.page == 1){
			this.firstBut.disabled = true;
			this.prevBut.disabled = true;
		}else{
			this.firstBut.disabled = false;
			this.prevBut.disabled = false;
		}
		
		if(this.page == this.max){
			this.lastBut.disabled = true;
			this.nextBut.disabled = true;
		}else{
			this.lastBut.disabled = false;
			this.nextBut.disabled = false;
		}
		
		for(let i = min; i <= max; i++){
			if(i>0 && i <= this.max){
				this.pagesElement.appendChild(this._generatePageButton(i));
			}
		}
		
		this.footerRedraw();
	}
	
	_generatePageButton(page){
		var button = document.createElement("button");
		
		button.classList.add("tabulator-page");
		if(page == this.page){
			button.classList.add("active");
		}
		
		button.setAttribute("type", "button");
		button.setAttribute("role", "button");
		
		this.langBind("pagination|page_title", (value) => {
			button.setAttribute("aria-label", value + " " + page);
			button.setAttribute("title", value + " " + page);
		});
		
		button.setAttribute("data-page", page);
		button.textContent = page;
		
		button.addEventListener("click", (e) => {
			this.setPage(page);
		});
		
		return button;
	}
	
	//previous page
	previousPage(){
		if(this.page > 1){
			this.page--;
			
			this.trackChanges();
			
			return this.trigger();
			
		}else{
			console.warn("Pagination Error - Previous page would be less than page 1:", 0);
			return Promise.reject();
		}
	}
	
	//next page
	nextPage(){
		if(this.page < this.max){
			this.page++;
			
			this.trackChanges();
			
			return this.trigger();
			
		}else{
			if(!this.progressiveLoad){
				console.warn("Pagination Error - Next page would be greater than maximum page of " + this.max + ":", this.max + 1);
			}
			return Promise.reject();
		}
	}
	
	//return current page number
	getPage(){
		return this.page;
	}
	
	//return max page number
	getPageMax(){
		return this.max;
	}
	
	getPageSize(size){
		return this.size;
	}
	
	getMode(){
		return this.mode;
	}
	
	//return appropriate rows for current page
	getRows(data){
		var actualRowPageSize = 0,
		output, start, end, actualStartRow;

		var actualRows = data.filter((row) => {
			return row.type === "row";
		});
		
		if(this.mode == "local"){
			output = [];
			
			this.setMaxRows(data.length);
			
			if(this.size === true){
				start = 0;
				end = data.length;
			}else{
				start = this.size * (this.page - 1);
				end = start + parseInt(this.size);
			}
			
			this._setPageButtons();
			
			for(let i = start; i < end; i++){
				let row = data[i];

				if(row){
					output.push(row);

					if(row.type === "row"){
						if(!actualStartRow){
							actualStartRow = row;
						}	

						actualRowPageSize++;
					}
				}
			}
			
			this._setPageCounter(actualRows.length, actualRowPageSize, actualStartRow ? (actualRows.indexOf(actualStartRow) + 1) : 0);
			
			return output;
		}else{
			this._setPageButtons();
			this._setPageCounter(actualRows.length);
			
			return data.slice(0);
		}
	}
	
	trigger(){
		var left;
		
		switch(this.mode){
			case "local":
				left = this.table.rowManager.scrollLeft;
			
				this.refreshData();
				this.table.rowManager.scrollHorizontal(left);
			
				this.dispatchExternal("pageLoaded", this.getPage());
			
				return Promise.resolve();
			
			case "remote":
				this.dataChanging = true;
				return this.reloadData(null)
					.finally(() => {
						this.dataChanging = false;
					});
			
			case "progressive_load":
			case "progressive_scroll":
				return this.reloadData(null, true);
			
			default:
				console.warn("Pagination Error - no such pagination mode:", this.mode);
				return Promise.reject();
		}
	}
	
	_parseRemoteData(data){
		var margin;
		
		if(typeof data.last_page === "undefined"){
			console.warn("Remote Pagination Error - Server response missing '" + (this.options("dataReceiveParams").last_page || "last_page") + "' property");
		}
		
		if(data.data){
			this.max = parseInt(data.last_page) || 1;

			this.remoteRowCountEstimate = typeof data.last_row !== "undefined" ? data.last_row : (data.last_page * this.size - (this.page == data.last_page ? (this.size - data.data.length) : 0));
			
			if(this.progressiveLoad){
				switch(this.mode){
					case "progressive_load":
					
						if(this.page == 1){
							this.table.rowManager.setData(data.data, false, this.page == 1);
						}else{
							this.table.rowManager.addRows(data.data);
						}
					
						if(this.page < this.max){
							setTimeout(() => {
								this.nextPage();
							}, this.table.options.progressiveLoadDelay);
						}
						break;
					
					case "progressive_scroll":
						data = this.page === 1 ? data.data : this.table.rowManager.getData().concat(data.data);
					
						this.table.rowManager.setData(data, this.page !== 1, this.page == 1);
					
						margin = this.table.options.progressiveLoadScrollMargin || (this.table.rowManager.element.clientHeight * 2);
					
						if(this.table.rowManager.element.scrollHeight <= (this.table.rowManager.element.clientHeight + margin)){
							if(this.page < this.max){
								setTimeout(() => {
									this.nextPage();
								});
							}
						}
						break;
				}
				
				return false;
			}else{
				// left = this.table.rowManager.scrollLeft;
				this.dispatchExternal("pageLoaded",  this.getPage());
				// this.table.rowManager.scrollHorizontal(left);
				// this.table.columnManager.scrollHorizontal(left);
			}
			
		}else{
			console.warn("Remote Pagination Error - Server response missing '" + (this.options("dataReceiveParams").data || "data") + "' property");
		}
		
		return data.data;
	}
	
	//handle the footer element being redrawn
	footerRedraw(){
		var footer = this.table.footerManager.containerElement;

		if((Math.ceil(footer.clientWidth) - footer.scrollWidth) < 0){
			this.pagesElement.style.display = 'none';
		}else{
			this.pagesElement.style.display = '';
			
			if((Math.ceil(footer.clientWidth) - footer.scrollWidth) < 0){
				this.pagesElement.style.display = 'none';
			}
		}
	}
}

Page.moduleName = "page";

//load defaults
Page.pageCounters = defaultPageCounters;

export default Page;
