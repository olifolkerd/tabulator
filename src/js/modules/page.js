var Page = function(table){

	this.table = table; //hold Tabulator object

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
};

Page.prototype.createElements = function(){

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

};

Page.prototype.generatePageSizeSelectList = function(){
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
};

//setup pageination
Page.prototype.initialize = function(hidden){
	var self = this,
	pageSelectLabel, testElRow, testElCell;

	//update param names
	this.dataSentNames = Object.assign({}, this.paginationDataSentNames);
	this.dataSentNames = Object.assign(this.dataSentNames, this.table.options.paginationDataSent);

	this.dataReceivedNames = Object.assign({}, this.paginationDataReceivedNames);
	this.dataReceivedNames = Object.assign(this.dataReceivedNames, this.table.options.paginationDataReceived);

	//build pagination element

	//bind localizations
	self.table.modules.localize.bind("pagination|first", function(value){
		self.firstBut.innerHTML = value;
	});

	self.table.modules.localize.bind("pagination|first_title", function(value){
		self.firstBut.setAttribute("aria-label", value);
		self.firstBut.setAttribute("title", value);
	});

	self.table.modules.localize.bind("pagination|prev", function(value){
		self.prevBut.innerHTML = value;
	});

	self.table.modules.localize.bind("pagination|prev_title", function(value){
		self.prevBut.setAttribute("aria-label", value);
		self.prevBut.setAttribute("title", value);
	});

	self.table.modules.localize.bind("pagination|next", function(value){
		self.nextBut.innerHTML = value;
	});

	self.table.modules.localize.bind("pagination|next_title", function(value){
		self.nextBut.setAttribute("aria-label", value);
		self.nextBut.setAttribute("title", value);
	});

	self.table.modules.localize.bind("pagination|last", function(value){
		self.lastBut.innerHTML = value;
	});

	self.table.modules.localize.bind("pagination|last_title", function(value){
		self.lastBut.setAttribute("aria-label", value);
		self.lastBut.setAttribute("title", value);
	});

	//click bindings
	self.firstBut.addEventListener("click", function(){
		self.setPage(1).then(()=>{}).catch(()=>{});
	});

	self.prevBut.addEventListener("click", function(){
		self.previousPage().then(()=>{}).catch(()=>{});
	});

	self.nextBut.addEventListener("click", function(){
		self.nextPage().then(()=>{}).catch(()=>{});
	});

	self.lastBut.addEventListener("click", function(){
		self.setPage(self.max).then(()=>{}).catch(()=>{});
	});

	if(self.table.options.paginationElement){
		self.element = self.table.options.paginationElement;
	}

	if(this.pageSizeSelect){
		pageSelectLabel = document.createElement("label");

		self.table.modules.localize.bind("pagination|page_size", function(value){
			self.pageSizeSelect.setAttribute("aria-label", value);
			self.pageSizeSelect.setAttribute("title", value);
			pageSelectLabel.innerHTML = value;
		});

		self.element.appendChild(pageSelectLabel);
		self.element.appendChild(self.pageSizeSelect);

		self.pageSizeSelect.addEventListener("change", function(e){
			self.setPageSize(self.pageSizeSelect.value == "true" ? true : self.pageSizeSelect.value);
			self.setPage(1).then(()=>{}).catch(()=>{});
		});
	}

	//append to DOM
	self.element.appendChild(self.firstBut);
	self.element.appendChild(self.prevBut);
	self.element.appendChild(self.pagesElement);
	self.element.appendChild(self.nextBut);
	self.element.appendChild(self.lastBut);

	if(!self.table.options.paginationElement && !hidden){
		self.table.footerManager.append(self.element, self);
	}

	//set default values
	self.mode = self.table.options.pagination;

	if(self.table.options.paginationSize){
		self.size = self.table.options.paginationSize;
	}else{
		testElRow = document.createElement("div");
		testElRow.classList.add("tabulator-row");
		testElRow.style.visibility = hidden;

		testElCell = document.createElement("div");
		testElCell.classList.add("tabulator-cell");
		testElCell.innerHTML = "Page Row Test";

		testElRow.appendChild(testElCell);

		self.table.rowManager.getTableElement().appendChild(testElRow);

		self.size =  Math.floor(self.table.rowManager.getElement().clientHeight / testElRow.offsetHeight);

		self.table.rowManager.getTableElement().removeChild(testElRow);
	}

	// self.page = self.table.options.paginationInitialPage || 1;
	self.count = self.table.options.paginationButtonCount;

	self.generatePageSizeSelectList();
};

Page.prototype.initializeProgressive = function(mode){
	this.initialize(true);
	this.mode = "progressive_" + mode;
	this.progressiveLoad = true;
};

Page.prototype.setDisplayIndex = function(index){
	this.displayIndex = index;
};

Page.prototype.getDisplayIndex = function(){
	return this.displayIndex;
};


//calculate maximum page from number of rows
Page.prototype.setMaxRows = function(rowCount){
	if(!rowCount){
		this.max = 1;
	}else{
		this.max = this.size === true ?  1 : Math.ceil(rowCount/this.size);
	}

	if(this.page > this.max){
		this.page = this.max;
	}
};

//reset to first page without triggering action
Page.prototype.reset = function(force, columnsChanged){
	if(this.mode == "local" || force){
		this.page = 1;
	}

	if(columnsChanged){
		this.initialLoad = true;
	}

	return true;
};

//set the maxmum page
Page.prototype.setMaxPage = function(max){

	max = parseInt(max);

	this.max = max || 1;

	if(this.page > this.max){
		this.page = this.max;
		this.trigger();
	}
};

//set current page number
Page.prototype.setPage = function(page){
	var self = this;

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

	return new Promise((resolve, reject)=>{

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

			if(self.table.options.persistence && self.table.modExists("persistence", true) && self.table.modules.persistence.config.page){
				self.table.modules.persistence.save("page");
			}

		}else{
			console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
			reject();
		}
	});
};

Page.prototype.setPageToRow = function(row){

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
};


Page.prototype.setPageSize = function(size){
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
};


//setup the pagination buttons
Page.prototype._setPageButtons = function(){
	var self = this;

	let leftSize = Math.floor((this.count-1) / 2);
	let rightSize = Math.ceil((this.count-1) / 2);
	let min = this.max - this.page + leftSize + 1 < this.count ? this.max-this.count+1: Math.max(this.page-leftSize,1);
	let max = this.page <= rightSize? Math.min(this.count, this.max) :Math.min(this.page+rightSize, this.max);

	while(self.pagesElement.firstChild) self.pagesElement.removeChild(self.pagesElement.firstChild);

	if(self.page == 1){
		self.firstBut.disabled = true;
		self.prevBut.disabled = true;
	}else{
		self.firstBut.disabled = false;
		self.prevBut.disabled = false;
	}

	if(self.page == self.max){
		self.lastBut.disabled = true;
		self.nextBut.disabled = true;
	}else{
		self.lastBut.disabled = false;
		self.nextBut.disabled = false;
	}

	for(let i = min; i <= max; i++){
		if(i>0 && i <= self.max){
			self.pagesElement.appendChild(self._generatePageButton(i));
		}
	}

	this.footerRedraw();
};

Page.prototype._generatePageButton = function(page){
	var self = this,
	button = document.createElement("button");

	button.classList.add("tabulator-page");
	if(page == self.page){
		button.classList.add("active");
	}

	button.setAttribute("type", "button");
	button.setAttribute("role", "button");

	self.table.modules.localize.bind("pagination|page_title", function(value){
		button.setAttribute("aria-label", value + " " + page);
		button.setAttribute("title", value + " " + page);
	});

	button.setAttribute("data-page", page);
	button.textContent = page;

	button.addEventListener("click", function(e){
		self.setPage(page).then(()=>{}).catch(()=>{});
	});

	return button;
};

//previous page
Page.prototype.previousPage = function(){
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
};

//next page
Page.prototype.nextPage = function(){
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
};

//return current page number
Page.prototype.getPage = function(){
	return this.page;
};

//return max page number
Page.prototype.getPageMax = function(){
	return this.max;
};

Page.prototype.getPageSize = function(size){
	return this.size;
};

Page.prototype.getMode = function(){
	return this.mode;
};

//return appropriate rows for current page
Page.prototype.getRows = function(data){
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
};

Page.prototype.trigger = function(){
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
};

Page.prototype._getRemotePage = function(){
	var self = this,
	oldParams, pageParams;


	return new Promise((resolve, reject)=>{

		if(!self.table.modExists("ajax", true)){
			reject()
		}

		//record old params and restore after request has been made
		oldParams = Tabulator.prototype.helpers.deepClone(self.table.modules.ajax.getParams() || {});
		pageParams = self.table.modules.ajax.getParams();

		//configure request params
		pageParams[this.dataSentNames.page] = self.page;

		//set page size if defined
		if(this.size){
			pageParams[this.dataSentNames.size] = this.size;
		}

		//set sort data if defined
		if(this.table.options.ajaxSorting && this.table.modExists("sort")){
			let sorters = self.table.modules.sort.getSort();

			sorters.forEach(function(item){
				delete item.column;
			});

			pageParams[this.dataSentNames.sorters] = sorters;
		}

		//set filter data if defined
		if(this.table.options.ajaxFiltering && this.table.modExists("filter")){
			let filters = self.table.modules.filter.getFilters(true, true);
			pageParams[this.dataSentNames.filters] = filters;
		}

		self.table.modules.ajax.setParams(pageParams);

		self.table.modules.ajax.sendRequest(this.progressiveLoad)
		.then((data)=>{
			self._parseRemoteData(data);
			resolve();
		})
		.catch((e)=>{reject()});

		self.table.modules.ajax.setParams(oldParams);
	});
};



Page.prototype._parseRemoteData = function(data){
	var self = this,
	left, data, margin;

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
					setTimeout(function(){
						self.nextPage().then(()=>{}).catch(()=>{});
					}, self.table.options.ajaxProgressiveLoadDelay);
				}
				break;

				case "progressive_scroll":
				data = this.table.rowManager.getData().concat(data[this.dataReceivedNames.data]);

				this.table.rowManager.setData(data, true, this.initialLoad && this.page == 1);

				margin = this.table.options.ajaxProgressiveLoadScrollMargin || (this.table.rowManager.element.clientHeight * 2);

				if(self.table.rowManager.element.scrollHeight <= (self.table.rowManager.element.clientHeight + margin)){
					self.nextPage().then(()=>{}).catch(()=>{});
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

};




//handle the footer element being redrawn
Page.prototype.footerRedraw = function(){
	var footer = this.table.footerManager.element;

	if((Math.ceil(footer.clientWidth) - footer.scrollWidth) < 0){
		this.pagesElement.style.display = 'none';
	}else{
		this.pagesElement.style.display = '';

		if((Math.ceil(footer.clientWidth) - footer.scrollWidth) < 0){
			this.pagesElement.style.display = 'none';
		}
	}
};

//set the paramter names for pagination requests
Page.prototype.paginationDataSentNames = {
	"page":"page",
	"size":"size",
	"sorters":"sorters",
	// "sort_dir":"sort_dir",
	"filters":"filters",
	// "filter_value":"filter_value",
	// "filter_type":"filter_type",
};

//set the property names for pagination responses
Page.prototype.paginationDataReceivedNames = {
	"current_page":"current_page",
	"last_page":"last_page",
	"data":"data",
};

Tabulator.prototype.registerModule("page", Page);
