var Page = function(table){

	var extension = {
		table:table, //hold Tabulator object

		element:$("<span class='tabulator-paginator'></span>"),
		pagesElement:$("<span class='tabulator-pages'></span>"),
		firstBut:$("<button class='tabulator-page' data-page='first' role='button' aria-label='' title=''></button>"),
		prevBut:$("<button class='tabulator-page' data-page='prev' role='button' aria-label='' title=''></button>"),
		nextBut:$("<button class='tabulator-page' data-page='next' role='button' aria-label='' title=''></button>"),
		lastBut:$("<button class='tabulator-page' data-page='last' role='button' aria-label='' title=''></button>"),


		type:"local",
		size:5,
		page:1,
		max:1,

		//setup pageination
		initialize:function(){
			var self = this;

			//build pagination element

			//bind localizations
			self.table.extensions.localize.bind("pagination.first", function(value){
				self.firstBut.text(value);
			});

			self.table.extensions.localize.bind("pagination.first_title", function(value){
				self.firstBut.attr("aria-label", value)
				.attr("title", value);
			});

			self.table.extensions.localize.bind("pagination.prev", function(value){
				self.prevBut.text(value);
			});

			self.table.extensions.localize.bind("pagination.prev_title", function(value){
				self.prevBut.attr("aria-label", value)
				.attr("title", value);
			});

			self.table.extensions.localize.bind("pagination.next", function(value){
				self.nextBut.text(value);
			});

			self.table.extensions.localize.bind("pagination.next_title", function(value){
				self.nextBut.attr("aria-label", value)
				.attr("title", value);
			});

			self.table.extensions.localize.bind("pagination.last", function(value){
				self.lastBut.text(value);
			});

			self.table.extensions.localize.bind("pagination.last_title", function(value){
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

			if(!self.table.options.paginationElement){
				self.table.footerManager.append(self.element);
			}


			//set default values
			self.type = self.table.options.pagination;
			self.size = self.table.options.paginationSize || Math.floor(self.table.rowManager.getElement().innerHeight() / 26);
		},

		//calculate maximum page from number of rows
		setMaxRows:function(rowCount){

			if(!rowCount){
				this.max = 1;
			}else{
				this.max = Math.ceil(rowCount/this.size);
			}

			if(this.page > this.max){
				this.page = this.max;
			}
		},

		//reset to first page without triggering action
		reset:function(){
			this.page = 1;
			return true;
		},

		//set the maxmum page
		setMaxPage:function(max){
			this.max = max || 1;

			if(this.page > this.max){
				this.page = this.max;
				this.trigger();
			}
		},

		//set current page number
		setPage:function(page){
			if(page > 0 && page <= this.max){
				this.page = page;
				this.trigger();
				return true;
			}else{
				console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
				return false;
			}
		},

		//setup the pagination buttons
		_setPageButtons:function(){
			var self = this;

			var min = this.page < this.max-2 ? (this.page - 2) : (this.page - (4 - (this.max - this.page)));
			var max = this.page > 3 ? (this.page + 2) : (this.page + (5 - this.page));

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
		},

		_generatePageButton(page){
			var self = this;
			var button = $("<button class='tabulator-page " + (page == self.page ? "active" : "") + "' data-page='" + page + "' role='button' arpagea-label='Show Page " + page + "'>" + page + "</button>");

			button.on("click", function(e){
				self.setPage(page);
			});

			return button;
		},

		//previous page
		previousPage:function(){
			if(this.page > 1){
				this.page--;
				this.trigger();
				return true;
			}else{
				console.warn("Pagination Error - Previous page would be less than page 1:", 0);
				return false;
			}
		},

		//next page
		nextPage:function(){
			if(this.page < this.max){
				this.page++;
				this.trigger();
				return true;
			}else{
				console.warn("Pagination Error - Next page would be greater than maximum page of " + this.max + ":", this.max + 1);
				return false;
			}
		},

		//return current page number
		getPage:function(){
			return this.page;
		},

		//return max page number
		getPageMax:function(){
			return this.max;
		},

		//return appropriate rows for current page
		getPageRows:function(data){
			var output = [],
			start = this.size * (this.page - 1),
			end = start + this.size;

			this._setPageButtons();

			for(let i = start; i < end; i++){
				if(data[i]){
					output.push(data[i]);
				}
			}

			return output;
		},

		trigger:function(){
			switch(this.type){
				case "local":
				this.table.rowManager.refreshActiveData();
				break;

				case "remote":

				break;

				default:
				console.warn("Pagination Error - no such pagination type:", this.type);
			}
		}
	}



	return extension;
}

Tabulator.registerExtension("page", Page);