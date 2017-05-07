var Page = function(table){

	var extension = {
		table:table, //hold Tabulator object
		type:"local",
		size:5,
		page:1,
		max:1,

		//setup pageination
		initialize:function(){
			this.type = this.table.options.pagination;
			// this.size = self.table.options.paginationSize;
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

		//set the maxmum page
		setMaxPage:function(max){
			this.max = max || 1;

			if(this.page > this.max){
				this.page = this.max;
			}
		},

		//set current page number
		setPage:function(page){
			if(page > 0 && page <= this.max){
				this.page = page;
				return true;
			}else{
				console.warn("Pagination Error - Requested page is out of range of 1 - " + this.max + ":", page);
				return false;
			}
		},

		//previous page
		previousPage:function(){
			if(this.page < this.max){
				this.page++;
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

			for(let i = start; i < end; i++){
				if(data[i]){
					output.push(data[i]);
				}
			}

			return output;
		},
	}



	return extension;
}

Tabulator.registerExtension("page", Page);