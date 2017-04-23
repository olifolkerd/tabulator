var Row = function(data, parent){

	var row = {
		table:parent.table,
		data:data,
		parent:parent,
		element:$("<div class='tabulator-row' role='row'></div>"),
		cells:[],

		//////////////// Setup Functions /////////////////

		getElement:function(){
			return this.element;
		},

		getData:function(){
			return this.data;
		},

		generateElement:function(){
			var self = this;
			self.element.empty();

			self.cells = parent.columnManager.generateCells(self);

			self.cells.forEach(function(cell){
				self.element.append(cell.getElement());
			});

			//handle row click events
			if (self.table.options.rowClick){
				self.element.on("click", function(e){
					self.table.options.rowClick(e, self.getElement(), self.getData());
				})
			}

			if (self.table.options.rowDblClick){
				self.element.on("dblclick", function(e){
					self.table.options.rowDblClick(e, self.getElement(), self.getData());
				})
			}

			if (self.table.options.rowContext){
				self.element.on("contextmenu", function(e){
					self.table.options.rowContext(e, self.getElement(), self.getData());
				})
			}
		},

		normalizeHeight:function(){
			var self = this;

			var height = self.element.innerHeight();

			self.cells.forEach(function(cell){
				cell.setHeight(height);
			});
		}

	}

	row.generateElement();

	return row;
}