import Module from '../../core/Module.js';

import Helpers from '../../core/Helpers.js';

import defaultDataSentNames from './defaults/dataSentNames.js';
import defaultDataReceivedNames from './defaults/dataReceivedNames.js';

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

		this.dataReceivedNames = {};
		this.dataSentNames = {};

		this.createElements();
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
	initialize(hidden){
		var this = this,
		pageSelectLabel, testElRow, testElCell;

		//update param names
		this.dataSentNames = Object.assign({}, Page.defaultDataSentNames);
		this.dataSentNames = Object.assign(this.dataSentNames, this.table.options.paginationDataSent);

		this.dataReceivedNames = Object.assign({}, Page.defaultDataReceivedNames);
		this.dataReceivedNames = Object.assign(this.dataReceivedNames, this.table.options.paginationDataReceived);

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
			this.setPage(1).then(()=>{}).catch(()=>{});
		});

		this.prevBut.addEventListener("click", () => {
			this.previousPage().then(()=>{}).catch(()=>{});
		});

		this.nextBut.addEventListener("click", () => {
			this.nextPage().then(()=>{}).catch(()=>{});
		});

		this.lastBut.addEventListener("click", () => {
			this.setPage(this.max).then(()=>{}).catch(()=>{});
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
				this.setPage(1).then(()=>{}).catch(()=>{});
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

		//set default values
		this.mode = this.table.options.pagination;

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

			this.size =  Math.floor(this.table.rowManager.getElement().clientHeight / testElRow.offsetHeight);

			this.table.rowManager.getTableElement().removeChild(testElRow);
		}

		// this.page = this.table.options.paginationInitialPage || 1;
		this.count = this.table.options.paginationButtonCount;

		this.generatePageSizeSelectList();
	}

	initializeProgressive(mode){
		this.initialize(true);
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
			this.setPage(page).then(()=>{}).catch(()=>{});
		});

		return button;
	}

	//previous page
	previousPage(){
		return new Promise((resolve, reject)=>{
			if(this.page > 1){
				this.page--;
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
				console.warn("Pagination Error - Previous page would be less than page 1:", 0);
				reject()
			}
		});
	}

	//next page
	nextPage(){
		return new Promise((resolve, reject)=>{
			if(this.page < this.max){
				this.page++;
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
				if(!this.progressiveLoad){
					console.warn("Pagination Error - Next page would be greater than maximum page of " + this.max + ":", this.max + 1);
				}
				reject();
			}
		});
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

		return new Promise((resolve, reject)=>{

			switch(this.mode){
				case "local":
				left = this.table.rowManager.scrollLeft;

				this.table.rowManager.refreshActiveData("page");
				this.table.rowManager.scrollHorizontal(left);

				this.table.options.pageLoaded.call(this.table, this.getPage());
				resolve();
				break;

				case "remote":
				case "progressive_load":
				case "progressive_scroll":
				this.table.modules.ajax.blockActiveRequest();
				this._getRemotePage()
				.then(()=>{
					resolve();
				})
				.catch(()=>{
					reject();
				});
				break;

				default:
				console.warn("Pagination Error - no such pagination mode:", this.mode);
				reject();
			}
		});
	}

	_getRemotePage(){
		var oldParams, pageParams;

		return new Promise((resolve, reject) => {

			if(!this.table.modExists("ajax", true)){
				reject();
			}

			//record old params and restore after request has been made
			oldParams = Helpers.deepClone(this.table.modules.ajax.getParams() || {});
			pageParams = this.table.modules.ajax.getParams();

			//configure request params
			pageParams[this.dataSentNames.page] = this.page;

			//set page size if defined
			if(this.size){
				pageParams[this.dataSentNames.size] = this.size;
			}

			//set sort data if defined
			if(this.table.options.ajaxSorting && this.table.modExists("sort")){
				let sorters = this.table.modules.sort.getSort();

				sorters.forEach((item) => {
					delete item.column;
				});

				pageParams[this.dataSentNames.sorters] = sorters;
			}

			//set filter data if defined
			if(this.table.options.ajaxFiltering && this.table.modExists("filter")){
				let filters = this.table.modules.filter.getFilters(true, true);
				pageParams[this.dataSentNames.filters] = filters;
			}

			this.table.modules.ajax.setParams(pageParams);

			this.table.modules.ajax.sendRequest(this.progressiveLoad)
			.then((data)=>{
				this._parseRemoteData(data);
				resolve();
			})
			.catch((e)=>{reject()});

			this.table.modules.ajax.setParams(oldParams);
		});
	}

	_parseRemoteData(data){
		var left, data, margin;

		if(typeof data[this.dataReceivedNames.last_page] === "undefined"){
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.last_page + "' property");
		}

		if(data[this.dataReceivedNames.data]){
			this.max = parseInt(data[this.dataReceivedNames.last_page]) || 1;

			if(this.progressiveLoad){
				switch(this.mode){
					case "progressive_load":

					if(this.page == 1){
						this.table.rowManager.setData(data[this.dataReceivedNames.data], false, this.initialLoad && this.page == 1)
					}else{
						this.table.rowManager.addRows(data[this.dataReceivedNames.data]);
					}

					if(this.page < this.max){
						setTimeout(() => {
							this.nextPage().then(()=>{}).catch(()=>{});
						}, this.table.options.ajaxProgressiveLoadDelay);
					}
					break;

					case "progressive_scroll":
					data = this.table.rowManager.getData().concat(data[this.dataReceivedNames.data]);

					this.table.rowManager.setData(data, true, this.initialLoad && this.page == 1);

					margin = this.table.options.ajaxProgressiveLoadScrollMargin || (this.table.rowManager.element.clientHeight * 2);

					if(this.table.rowManager.element.scrollHeight <= (this.table.rowManager.element.clientHeight + margin)){
						this.nextPage().then(()=>{}).catch(()=>{});
					}
					break;
				}
			}else{
				left = this.table.rowManager.scrollLeft;

				this.table.rowManager.setData(data[this.dataReceivedNames.data], false, this.initialLoad && this.page == 1);

				this.table.rowManager.scrollHorizontal(left);

				this.table.columnManager.scrollHorizontal(left);

				this.table.options.pageLoaded.call(this.table, this.getPage());
			}

			this.initialLoad = false;

		}else{
			console.warn("Remote Pagination Error - Server response missing '" + this.dataReceivedNames.data + "' property");
		}
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

//load defaults
Page.defaultDataSentNames = defaultDataSentNames;
Page.defaultDataReceivedNames = defaultDataReceivedNames;

export default Page;