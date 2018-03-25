var ResponsiveLayout = function(table){
	this.table = table; //hold Tabulator object
	this.columns = [];
	this.index = 0;
};

//generate resposive columns list
ResponsiveLayout.prototype.initialize = function(){
	var columns=[];

	//detemine level of responsivity for each column
	this.table.columnManager.columnsByIndex.forEach(function(column, i){
		if(column.extensions.responsive){
			if(column.extensions.responsive.order && column.extensions.responsive.visible){
				column.extensions.responsive.index = i;
				columns.push(column);
			}
		}
	});

	//sort list by responsivity
	columns = columns.reverse();
	columns = columns.sort(function(a, b){
		var diff = b.extensions.responsive.order - a.extensions.responsive.order
		return diff || (b.extensions.responsive.index - a.extensions.responsive.index);
	});

	this.columns = columns;
};

//define layout information
ResponsiveLayout.prototype.initializeColumn = function(column){
	var def = column.getDefinition();

	column.extensions.responsive = {order: typeof def.responsive === "undefined" ? 1 : def.responsive, visible:def.visible === false ? false : true};
}

//update column visibility
ResponsiveLayout.prototype.updateColumnVisibility = function(column, visible){
	var index;
	if(column.extensions.responsive){
		column.extensions.responsive.visible = visible;
		this.initialize();
	}
}

//redraw columns to fit space
ResponsiveLayout.prototype.update = function(){
	var self = this,
	working = true;

	while(working){

		let width = self.table.extensions.layout.getMode() == "fitColumns" ? self.table.columnManager.getFlexBaseWidth() : self.table.columnManager.getWidth();

		let diff = self.table.columnManager.element.innerWidth() - width;

		if(diff < 0){
			//table is too wide
			let column = self.columns[self.index];

			if(column){
				column.hide(false, true);
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
						column.show(false, true);

						//set column width to prevent calculation loops on uninitialized columns
						column.setWidth(column.getWidth());

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