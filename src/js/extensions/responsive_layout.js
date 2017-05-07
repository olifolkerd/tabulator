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

			console.log("responsive update");

			while(working){
				if(self.table.rowManager.element.innerWidth() < self.table.rowManager.element[0].scrollWidth){
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
						let width = self.table.rowManager.element.innerWidth() - self.table.rowManager.tableElement.outerWidth();

						if(width > 0){

							if(width >= column.getWidth()){
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
			}
		},
	}

	return extension;
}

Tabulator.registerExtension("responsiveLayout", ResponsiveLayout);