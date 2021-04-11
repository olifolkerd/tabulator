import Module from '../../core/Module.js';

import Helpers from '../../core/tools/Helpers.js';

class Page extends Module{

	constructor(table){
		super(table);

		this.mode = "local";
		this.progressiveLoad = false;

		this.size = 0;
		this.page = 1;
		this.count = 5;
		this.max = 1;

		this.displayIndex = 0; //index in display pipeline

		this.initialLoad = true;

		this.pageSizes = [];

		this.dataReceivedNames = {}; //TODO - remove once pagimation update is complete
		this.dataSentNames = {}; //TODO - remove once pagimation update is complete

		this.registerTableOption("pagination", false); //set pagination type
		this.registerTableOption("paginationMode", false); //local or remote pagination
		this.registerTableOption("paginationSize", false); //set number of rows to a page
		this.registerTableOption("paginationInitialPage", 1); //initail page to show on load
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
			this.initializePaginator();
		}else if(this.table.options.progressiveLoad){

			this.subscribe("data-params", this.remotePageParams.bind(this));
			this.subscribe("data-loaded", this._parseRemoteData.bind(this));

			this.initializeProgressive(this.table.options.progressiveLoad)

			if(this.table.options.progressiveLoad === "scroll"){
				this.subscribe("scroll-vertical", this.cellValueChanged.bind(this));
			}
		}
	}

	remotePageParams(data, config, params){
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
				return this.setPageToRow(row)
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

	restOnRenderBefore(rows, renderInPosition){
		if(!renderInPosition){
			if(this.mode === "local"){
				this.reset();
			}
		}

		return rows;
	}

	rowsUpdated(){
		this.refreshData(false, true, "all");
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
					this.table.modules.localize.bind("pagination|all", function(value){
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

	//setup pageination
	initializePaginator(hidden){
		var pageSelectLabel, testElRow, testElCell;

		if(!hidden){

			// //update param names
			// this.dataSentNames = Object.assign({}, Page.defaultDataSentNames);
			// this.dataSentNames = Object.assign(this.dataSentNames, this.table.options.paginationDataSent);

			// this.dataReceivedNames = Object.assign({}, Page.defaultDataReceivedNames);
			// this.dataReceivedNames = Object.assign(this.dataReceivedNames, this.table.options.paginationDataReceived);

			//build pagination element

			//bind localizations
			this.table.modules.localize.bind("pagination|first", (value) => {
				this.firstBut.innerHTML = value;
			});

			this.table.modules.localize.bind("pagination|first_title", (value) => {
				this.firstBut.setAttribute("aria-label", value);
				this.firstBut.setAttribute("title", value);
			});

			this.table.modules.localize.bind("pagination|prev", (value) => {
				this.prevBut.innerHTML = value;
			});

			this.table.modules.localize.bind("pagination|prev_title", (value) => {
				this.prevBut.setAttribute("aria-label", value);
				this.prevBut.setAttribute("title", value);
			});

			this.table.modules.localize.bind("pagination|next", (value) => {
				this.nextBut.innerHTML = value;
			});

			this.table.modules.localize.bind("pagination|next_title", (value) => {
				this.nextBut.setAttribute("aria-label", value);
				this.nextBut.setAttribute("title", value);
			});

			this.table.modules.localize.bind("pagination|last", (value) => {
				this.lastBut.innerHTML = value;
			});

			this.table.modules.localize.bind("pagination|last_title", (value) => {
				this.lastBut.setAttribute("aria-label", value);
				this.lastBut.setAttribute("title", value);
			});

			//click bindings
			this.firstBut.addEventListener("click", () => {
				this.setPage(1)
			});

			this.prevBut.addEventListener("click", () => {
				this.previousPage()
			});

			this.nextBut.addEventListener("click", () => {
				this.nextPage()
			});

			this.lastBut.addEventListener("click", () => {
				this.setPage(this.max)
			});

			if(this.table.options.paginationElement){
				this.element = this.table.options.paginationElement;
			}

			if(this.pageSizeSelect){
				pageSelectLabel = document.createElement("label");

				this.table.modules.localize.bind("pagination|page_size", (value) => {
					this.pageSizeSelect.setAttribute("aria-label", value);
					this.pageSizeSelect.setAttribute("title", value);
					pageSelectLabel.innerHTML = value;
				});

				this.element.appendChild(pageSelectLabel);
				this.element.appendChild(this.pageSizeSelect);

				this.pageSizeSelect.addEventListener("change", (e) => {
					this.setPageSize(this.pageSizeSelect.value == "true" ? true : this.pageSizeSelect.value);
					this.setPage(1)
				});
			}

			//append to DOM
			this.element.appendChild(this.firstBut);
			this.element.appendChild(this.prevBut);
			this.element.appendChild(this.pagesElement);
			this.element.appendChild(this.nextBut);
			this.element.appendChild(this.lastBut);

			if(!this.table.options.paginationElement && !hidden){
				this.table.footerManager.append(this.element, this);
			}

			// this.page = this.table.options.paginationInitialPage || 1;
			this.count = this.table.options.paginationButtonCount;

			this.generatePageSizeSelectList();
		}

		//set default values
		this.mode = this.table.options.paginationMode;

		if(this.table.options.paginationSize){
			this.size = this.table.options.paginationSize;
		}else{
			testElRow = document.createElement("div");
			testElRow.classList.add("tabulator-row");
			testElRow.style.visibility = hidden;

			testElCell = document.createElement("div");
			testElCell.classList.add("tabulator-cell");
			testElCell.innerHTML = "Page Row Test";

			testElRow.appendChild(testElCell);

			this.table.rowManager.getTableElement().appendChild(testElRow);

			console.log("size", this.table.rowManager.getElement().clientHeight , testElRow.offsetHeight, this.table.rowManager.getElement().clientHeight / testElRow.offsetHeight)

			this.size = Math.floor(this.table.rowManager.getElement().clientHeight / testElRow.offsetHeight);

			this.table.rowManager.getTableElement().removeChild(testElRow);
		}
	}

	initializeProgressive(mode){
		this.initializePaginator(true);
		this.mode = "progressive_" + mode;
		this.progressiveLoad = true;
	}

	setDisplayIndex(index){
		this.displayIndex = index;
	}

	getDisplayIndex(){
		return this.displayIndex;
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
	reset(force, columnsChanged){
		if(this.mode == "local" || force){
			this.page = 1;
		}

		if(columnsChanged){
			this.initialLoad = true;
		}

		return true;
	}

	//set the maxmum page
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
			break;

			case "prev":
			return this.previousPage();
			break;

			case "next":
			return this.nextPage();
			break;

			case "last":
			return this.setPage(this.max);
			break;
		}

		return new Promise((resolve, reject) => {

			page = parseInt(page);

			if((page > 0 && page <= this.max) || this.mode !== "local"){
				this.page = page;
				this.trigger()
				.then(()=>{
					resolve();
				})
				.catch(()=>{
					reject();
				});

				if(this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.page){
					this.table.modules.persistence.save("page");
				}

			}else{
				console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
				reject();
			}
		});
	}

	setPageToRow(row){
		return new Promise((resolve, reject)=>{

			var rows = this.table.rowManager.getDisplayRows(this.displayIndex - 1);
			var index = rows.indexOf(row);

			if(index > -1){
				var page = this.size === true ? 1 : Math.ceil((index + 1) / this.size);

				this.setPage(page)
				.then(()=>{
					resolve();
				})
				.catch(()=>{
					reject();
				});
			}else{
				console.warn("Pagination Error - Requested row is not visible");
				reject();
			}
		});
	}

	setPageSize(size){
		if(size !== true){
			size = parseInt(size);
		}

		if(size > 0){
			this.size = size;
		}

		if(this.pageSizeSelect){
			// this.pageSizeSelect.value = size;
			this.generatePageSizeSelectList();
		}

		if(this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.page){
			this.table.modules.persistence.save("page");
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

		this.table.modules.localize.bind("pagination|page_title", (value) => {
			button.setAttribute("aria-label", value + " " + page);
			button.setAttribute("title", value + " " + page);
		});

		button.setAttribute("data-page", page);
		button.textContent = page;

		button.addEventListener("click", (e) => {
			this.setPage(page)
		});

		return button;
	}

	//previous page
	previousPage(){
		if(this.page > 1){
			this.page--;

			if(this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.page){
				this.table.modules.persistence.save("page");
			}

			return this.trigger()

		}else{
			console.warn("Pagination Error - Previous page would be less than page 1:", 0);
			return Promise.reject()
		}
	}

	//next page
	nextPage(){
		if(this.page < this.max){
			this.page++;

			if(this.table.options.persistence && this.table.modExists("persistence", true) && this.table.modules.persistence.config.page){
				this.table.modules.persistence.save("page");
			}

			return this.trigger();;

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
		var output, start, end;

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
				if(data[i]){
					output.push(data[i]);
				}
			}

			return output;
		}else{
			this._setPageButtons();

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
			break;

			case "remote":
			case "progressive_load":
			case "progressive_scroll":
				return this.reloadData(null, true);
			break;

			default:
				console.warn("Pagination Error - no such pagination mode:", this.mode);
				return Promise.reject();
		}
	}

	// _getRemotePage(){
	// 	var oldParams, pageParams;

	// 	return new Promise((resolve, reject) => {

	// 		if(!this.table.modExists("ajax", true)){
	// 			reject();
	// 		}

	// 		//record old params and restore after request has been made
	// 		oldParams = Helpers.deepClone(this.table.modules.ajax.getParams() || {});
	// 		pageParams = this.table.modules.ajax.getParams();

	// 		//configure request params
	// 		pageParams[this.dataSentNames.page] = this.page;

	// 		//set page size if defined
	// 		if(this.size){
	// 			pageParams[this.dataSentNames.size] = this.size;
	// 		}

	// 		//set sort data if defined
	// 		if(this.table.options.sortMode === "remote" && this.table.modExists("sort")){
	// 			let sorters = this.table.modules.sort.getSort();

	// 			sorters.forEach((item) => {
	// 				delete item.column;
	// 			});

	// 			pageParams[this.dataSentNames.sorters] = sorters;
	// 		}

	// 		//set filter data if defined
	// 		if(this.table.options.filterMode === "remote" && this.table.modExists("filter")){
	// 			let filters = this.table.modules.filter.getFilters(true, true);
	// 			pageParams[this.dataSentNames.filters] = filters;
	// 		}

	// 		this.table.modules.ajax.setParams(pageParams);

	// 		this.table.modules.ajax.sendRequest(this.progressiveLoad)
	// 		.then((data)=>{
	// 			this._parseRemoteData(data);
	// 			resolve();
	// 		})
	// 		.catch((e)=>{reject()});

	// 		this.table.modules.ajax.setParams(oldParams);
	// 	});
	// }

	_parseRemoteData(data){
		var left, data, margin;

		if(typeof data.last_page === "undefined"){
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.last_page + "' property");
		}

		if(data.data){
			this.max = parseInt(data.last_page) || 1;

			if(this.progressiveLoad){
				switch(this.mode){
					case "progressive_load":

					if(this.page == 1){
						this.table.rowManager.setData(data.data, false, this.initialLoad && this.page == 1)
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
					data = this.table.rowManager.getData().concat(data.data);

					this.table.rowManager.setData(data, true, this.initialLoad && this.page == 1);

					margin = this.table.options.progressiveLoadScrollMargin || (this.table.rowManager.element.clientHeight * 2);

					if(this.table.rowManager.element.scrollHeight <= (this.table.rowManager.element.clientHeight + margin)){
						this.nextPage();
					}
					break;
				}

				return false;
			}else{
				// left = this.table.rowManager.scrollLeft;

				// this.table.rowManager.setData(data.data, false, this.initialLoad && this.page == 1);

				// this.table.rowManager.scrollHorizontal(left);

				// this.table.columnManager.scrollHorizontal(left);

				this.dispatchExternal("pageLoaded",  this.getPage());
			}

			this.initialLoad = false;

		}else{
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.data + "' property");
		}

		return data.data;
	}

	//handle the footer element being redrawn
	footerRedraw(){
		var footer = this.table.footerManager.element;

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

export default Page;