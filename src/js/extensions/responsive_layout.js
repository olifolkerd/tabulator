var ResponsiveLayout = function(table){

	var extension = {
		table:table, //hold Tabulator object
		columns:[],
		index:0,

		//generate resposivle columns list
		initialize:function(){
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
		},

		update:function(){
			var self = this,
			working = true;

			while(working){

				let diff = self.table.columnManager.element.innerWidth() -  self.table.columnManager.getWidth();

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
		},
	}

	return extension;
}

Tabulator.registerExtension("responsiveLayout", ResponsiveLayout);