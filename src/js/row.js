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

		generateElement:function(){
			var self = this;
			self.element.empty();

			self.cells = parent.columnManager.generateCells(self);

			console.log("row", self.cells);

			self.cells.forEach(function(cell){
				self.element.append(cell.getElement());
			});
		},

	}

	row.generateElement();

	return row;
}