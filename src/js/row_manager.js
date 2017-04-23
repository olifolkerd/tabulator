var RowManager = function(table){

	var manager = {
		table:table,
		element:$("<div class='tabulator-tableHolder'></div>"), //containing element
		tableElement:$("<div class='tabulator-table'></div>"), //table element
		columnManager:null, //hold column manager object

		firstRender:false, //handle first render

		rows:[], //hold row data objects
		activeRows:[], //rows currently on display in the table

		scrollTop:0,
		scrollLeft:0,

		//////////////// Setup Functions /////////////////

		//return containing element
		getElement:function(){
			return this.element;
		},

		//link to column manager
		setColumnManager:function(manager){
			this.columnManager = manager;
		},


		////////////////// Data Handling //////////////////

		setData:function(data){
			var self = this;

			self.rows = [];

			data.forEach(function(def, i){
				var row = new Row(def, self);
				self.rows.push(row);
			});

			self.activeRows = self.rows;

			self.renderTable();
		},

		clearData:function(){
			this.setData([]);
		},

		getData:function(active){
			var self = this,
			output = [];

			var rows = active ? self.rows : self.activeRows;

			rows.forEach(function(row){
				output.push(row.getData(true));
			});

			return output;
		},

		///////////////// Table Rendering /////////////////

		renderTable:function(){
			var self = this,
			element = self.tableElement;

			element.empty();
			self.activeRows.forEach(function(row){
				element.append(row.getElement());
				row.normalizeHeight();
			});

			if(self.firstRender && self.activeRows.length){
				self.firstRender = false;
				self.columnManager.fitToData();
			}
		},

		//normalize height of active rows
		normalizeHeight:function(){
			var self = this;

			self.activeRows.forEach(function(row){
				row.normalizeHeight();
			});
		},

		//adjust the height of the table holder to fit in the Tabulator element
		adjustTableSize:function(){
			var self = this;

			if(self.table.options.height){
				self.element.css({
					"min-height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
					"height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
					"max-height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
				});
			}
		},

	}

	//initialize manager
	manager.element.append(manager.tableElement);

	if(!manager.table.options.fitColumns){
		manager.firstRender = true;
	}


	//scroll header along with table body
	manager.element.scroll(function(){

		// var holder = $(this);
		// var left = holder.scrollLeft();
		// var top = holder.top();

		// if(manager.scrollLeft != left){
		// 	manager.columnManager.scrolHoz(left);
		// }


		// //trigger progressive rendering on scroll
		// // if(self.options.progressiveRender && scrollTop != holder.scrollTop() && scrollTop < holder.scrollTop()){
		// // 	if(!self.progressiveRenderLoading){
		// // 		if(holder[0].scrollHeight - holder.innerHeight() - holder.scrollTop() < self.options.progressiveRenderMargin){
		// // 			if(self.options.progressiveRender == "remote"){
		// // 				if(self.paginationCurrentPage <= self.paginationMaxPage){
		// // 					self.progressiveRenderLoading = true;
		// // 					self._renderTable(true);
		// // 				}
		// // 			}else{
		// // 				if(self.paginationCurrentPage < self.paginationMaxPage){
		// // 					self.paginationCurrentPage++;
		// // 					self._renderTable(true);
		// // 				}
		// // 			}
		// // 		}
		// // 	}else{
		// // 		self.progressiveRenderLoadingNext = true;
		// // 	}
		// // }


		// manager.scrollLeft = left;
		// manager.scrollTop = top;
	});


	return manager;
}