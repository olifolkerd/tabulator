var ResponsiveLayout = function(table){
	this.table = table; //hold Tabulator object
	this.columns = [];
	this.index = 0;
};

//generate resposivle columns list
ResponsiveLayout.prototype.initialize = function(){
	var columns=[];

	//detemine level of responsivity for each column
	this.table.columnManager.columnsByIndex.forEach(function(column){
		var def = column.getDefinition();

		column.extensions.responsive = {order: typeof def.responsive === "undefined" ? 1 : def.responsive};

		if(column.extensions.responsive.order){
			columns.push(column);
		}
	});


	//sort list by responsivity
	columns = columns.reverse();
	columns = columns.sort(function(a, b){
		return b.extensions.responsive.order - a.extensions.responsive.order;
	});

	this.columns = columns;
};

ResponsiveLayout.prototype.update = function(){
	var self = this,
	working = true;

	while(working){

		let width = self.table.options.fitColumns ? self.table.columnManager.getFlexBaseWidth() : self.table.columnManager.getWidth();

		let diff = self.table.columnManager.element.innerWidth() - width;

		if(diff < 0){
			//table is too wide
			let column = self.columns[self.index];

			if(column){
				column.hide();
				self.index ++;
			}else{
				working = false;
			}

		}else{
			//table has spare space
			let column = self.columns[self.index -1];

			if(column){
				if(diff > 0){

					if(diff >= column.getWidth()){
						column.show();
						self.index --;
					}else{
						working = false;
					}
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}

		if(!self.table.rowManager.activeRowsCount){
			self.table.rowManager.renderEmptyScroll();
		}
	}
};

Tabulator.registerExtension("responsiveLayout", ResponsiveLayout);