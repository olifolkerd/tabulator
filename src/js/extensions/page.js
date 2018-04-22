var Page = function(table){

	this.table = table; //hold Tabulator object

	this.element = $("<span class='tabulator-paginator'></span>");
	this.pagesElement = $("<span class='tabulator-pages'></span>");
	this.firstBut = $("<button class='tabulator-page' data-page='first' role='button' aria-label='' title='' type='button'></button>");
	this.prevBut = $("<button class='tabulator-page' data-page='prev' role='button' aria-label='' title='' type='button'></button>");
	this.nextBut = $("<button class='tabulator-page' data-page='next' role='button' aria-label='' title='' type='button'></button>");
	this.lastBut = $("<button class='tabulator-page' data-page='last' role='button' aria-label='' title='' type='button'></button>");

	this.mode = "local";
	this.progressiveLoad = false;

	this.size = 0;
	this.page = 1;
	this.count = 5;
	this.max = 1;
	this.paginator = false;

	this.displayIndex = 0; //index in display pipeline
};

//setup pageination
Page.prototype.initialize = function(hidden){
	var self = this;

	//update param names
	for(let key in self.table.options.paginationDataSent){
		self.paginationDataSentNames[key] = self.table.options.paginationDataSent[key];
	}

	for(let key in self.table.options.paginationDataReceived){
		self.paginationDataReceivedNames[key] = self.table.options.paginationDataReceived[key];
	}

	if(self.table.options.paginator){
		self.paginator = self.table.options.paginator;
	}


	//build pagination element

	//bind localizations
	self.table.extensions.localize.bind("pagination|first", function(value){
		self.firstBut.html(value);
	});

	self.table.extensions.localize.bind("pagination|first_title", function(value){
		self.firstBut.attr("aria-label", value)
		.attr("title", value);
	});

	self.table.extensions.localize.bind("pagination|prev", function(value){
		self.prevBut.html(value);
	});

	self.table.extensions.localize.bind("pagination|prev_title", function(value){
		self.prevBut.attr("aria-label", value)
		.attr("title", value);
	});

	self.table.extensions.localize.bind("pagination|next", function(value){
		self.nextBut.html(value);
	});

	self.table.extensions.localize.bind("pagination|next_title", function(value){
		self.nextBut.attr("aria-label", value)
		.attr("title", value);
	});

	self.table.extensions.localize.bind("pagination|last", function(value){
		self.lastBut.html(value);
	});

	self.table.extensions.localize.bind("pagination|last_title", function(value){
		self.lastBut.attr("aria-label", value)
		.attr("title", value);
	});

	//click bindings
	self.firstBut.on("click", function(){
		self.setPage(1);
	});

	self.prevBut.on("click", function(){
		self.previousPage();
	});

	self.nextBut.on("click", function(){
		self.nextPage();
	});

	self.lastBut.on("click", function(){
		self.setPage(self.max);
	});

	if(self.table.options.paginationElement){
		self.element = self.table.options.paginationElement;
	}

	//append to DOM
	self.element.append(self.firstBut);
	self.element.append(self.prevBut);
	self.element.append(self.pagesElement);
	self.element.append(self.nextBut);
	self.element.append(self.lastBut);

	if(!self.table.options.paginationElement && !hidden){
		self.table.footerManager.append(self.element, self);
	}

	//set default values
	self.mode = self.table.options.pagination;
	self.size = self.table.options.paginationSize || Math.floor(self.table.rowManager.getElement().innerHeight() / 24);
	self.count = self.table.options.paginationButtonCount;
};

Page.prototype.initializeProgressive = function(mode){
	this.initialize(true);
	this.mode = "progressive_" + mode;
	this.progressiveLoad = true;
}

Page.prototype.setDisplayIndex = function(index){
	this.displayIndex = index;
}

Page.prototype.getDisplayIndex = function(){
	return this.displayIndex;
}


//calculate maximum page from number of rows
Page.prototype.setMaxRows = function(rowCount){
	if(!rowCount){
		this.max = 1;
	}else{
		this.max = Math.ceil(rowCount/this.size);
	}

	if(this.page > this.max){
		this.page = this.max;
	}
};

//reset to first page without triggering action
Page.prototype.reset = function(force){
	if(this.mode == "local" || force){
		this.page = 1;
	}
	return true;
};

//set the maxmum page
Page.prototype.setMaxPage = function(max){
	this.max = max || 1;

	if(this.page > this.max){
		this.page = this.max;
		this.trigger();
	}
};

//set current page number
Page.prototype.setPage = function(page){
	if(page > 0 && page <= this.max){
		this.page = page;
		this.trigger();
		return true;
	}else{
		console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
		return false;
	}
};

Page.prototype.setPageSize = function(size){
	if(size > 0){
		this.size = size;
	}
};


//setup the pagination buttons
Page.prototype._setPageButtons = function(){
	var self = this;

	let leftSize = Math.floor((this.count-1) / 2);
	let rightSize = Math.ceil((this.count-1) / 2);
	let min = this.max - this.page + leftSize + 1 < this.count ? this.max-this.count+1: Math.max(this.page-leftSize,1);
	let max = this.page <= rightSize? Math.min(this.count, this.max) :Math.min(this.page+rightSize, this.max);

	self.pagesElement.empty();

	if(self.page == 1){
		self.firstBut.prop("disabled", true);
		self.prevBut.prop("disabled", true);
	}else{
		self.firstBut.prop("disabled", false);
		self.prevBut.prop("disabled", false);
	}

	if(self.page == self.max){
		self.lastBut.prop("disabled", true);
		self.nextBut.prop("disabled", true);
	}else{
		self.lastBut.prop("disabled", false);
		self.nextBut.prop("disabled", false);
	}

	for(let i = min; i <= max; i++){
		if(i>0 && i <= self.max){
			self.pagesElement.append(self._generatePageButton(i));
		}
	}

	this.footerRedraw();
};

Page.prototype._generatePageButton = function(page){
	var self = this;
	var button = $("<button class='tabulator-page " + (page == self.page ? "active" : "") + "' data-page='" + page + "' role='button' arpagea-label='Show Page " + page + "'>" + page + "</button>");

	button.on("click", function(e){
		self.setPage(page);
	});

	return button;
};

//previous page
Page.prototype.previousPage = function(){
	if(this.page > 1){
		this.page--;
		this.trigger();
		return true;
	}else{
		console.warn("Pagination Error - Previous page would be less than page 1:", 0);
		return false;
	}
};

//next page
Page.prototype.nextPage = function(){
	if(this.page < this.max){
		this.page++;
		this.trigger();
		return true;
	}else{
		if(!this.progressiveLoad){
			console.warn("Pagination Error - Next page would be greater than maximum page of " + this.max + ":", this.max + 1);
		}
		return false;
	}
};

//return current page number
Page.prototype.getPage = function(){
	return this.page;
};

//return max page number
Page.prototype.getPageMax = function(){
	return this.max;
};

Page.prototype.getPageSize = function(size){;
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
		start = this.size * (this.page - 1);
		end = start + parseInt(this.size);

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

	switch(this.mode){
		case "local":
		left = this.table.rowManager.scrollLeft;

		this.table.rowManager.refreshActiveData("page");
		this.table.rowManager.scrollHorizontal(left);

		this.table.options.pageLoaded(this.getPage());
		break;

		case "remote":
		case "progressive_load":
		case "progressive_scroll":
		this.table.extensions.ajax.blockActiveRequest();
		this._getRemotePage();
		break;

		default:
		console.warn("Pagination Error - no such pagination mode:", this.mode);
	}
};

Page.prototype._getRemotePage = function(){
	if(this.table.extExists("ajax", true)){

		if(this.paginator){
			this._getRemotePagePaginator();
		}else{
			this._getRemotePageAuto();
		}
	}
};

Page.prototype._getRemotePagePaginator = function(){
	var self = this,
	ajax = self.table.extensions.ajax,
	oldUrl = ajax.getUrl();

	ajax.setUrl(self.paginator(ajax.getUrl(), self.page, self.size, ajax.getParams()))

	ajax.sendRequest(function(data){
		self._parseRemoteData(data);
	});

	ajax.setUrl(oldUrl);
};

Page.prototype._getRemotePageAuto = function(){
	var self = this,
	oldParams, pageParams;

	//record old params and restore after request has been made
	oldParams = $.extend(true, {}, self.table.extensions.ajax.getParams());
	pageParams = self.table.extensions.ajax.getParams();

	//configure request params
	pageParams[this.paginationDataSentNames.page] = self.page;

	//set page size if defined
	if(this.size){
		pageParams[this.paginationDataSentNames.size] = this.size;
	}

	//set sort data if defined
	if(this.table.extExists("sort")){
		let sorters = self.table.extensions.sort.getSort();

		sorters.forEach(function(item){
			delete item.column;
		});

		pageParams[this.paginationDataSentNames.sorters] = sorters;
	}

	//set filter data if defined
	if(this.table.extExists("filter")){
		let filters = self.table.extensions.filter.getFilters(true, true);
		pageParams[this.paginationDataSentNames.filters] = filters;
	}

	self.table.extensions.ajax.setParams(pageParams);

	self.table.extensions.ajax.sendRequest(function(data){
		self._parseRemoteData(data);
	}, this.progressiveLoad);

	self.table.extensions.ajax.setParams(oldParams);
};



Page.prototype._parseRemoteData = function(data){
	var self = this,
	left, data, margin;

	if(data[this.paginationDataReceivedNames.last_page]){
		if(data[this.paginationDataReceivedNames.data]){
			this.max = parseInt(data[this.paginationDataReceivedNames.last_page]);

			if(this.progressiveLoad){
				switch(this.mode){
					case "progressive_load":
					this.table.rowManager.addRows(data[this.paginationDataReceivedNames.data]);
					if(this.page < this.max){
						setTimeout(function(){
							self.nextPage();
						}, self.table.options.ajaxProgressiveLoadDelay)

					}
					break;

					case "progressive_scroll":
					data = this.table.rowManager.getData().concat(data[this.paginationDataReceivedNames.data]);

					this.table.rowManager.setData(data, true);

					margin = this.table.options.ajaxProgressiveLoadScrollMargin || (this.table.rowManager.element[0].clientHeight * 2);

					if(self.table.rowManager.element[0].scrollHeight <= (self.table.rowManager.element[0].clientHeight + margin)){
						self.nextPage();
					}
					break;
				}
			}else{
				left = this.table.rowManager.scrollLeft;

				this.table.rowManager.setData(data[this.paginationDataReceivedNames.data]);

				this.table.rowManager.scrollHorizontal(left);

				this.table.options.pageLoaded(this.getPage());
			}

		}else{
			console.warn("Remote Pagination Error - Server response missing '" + this.paginationDataReceivedNames.data + "' property");
		}
	}else{
		console.warn("Remote Pagination Error - Server response missing '" + this.paginationDataReceivedNames.last_page + "' property");
	}
};




//handle the footer element being redrawn
Page.prototype.footerRedraw = function(){
	var footer = this.table.footerManager.element;

	if((Math.ceil(footer.innerWidth()) - footer[0].scrollWidth) < 0){
		this.pagesElement.hide();
	}else{
		this.pagesElement.show();

		if((Math.ceil(footer.innerWidth()) - footer[0].scrollWidth) < 0){
			this.pagesElement.hide();
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

Tabulator.registerExtension("page", Page);
