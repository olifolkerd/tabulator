var Cell = function(column, row){
	var cell = {
		table:column.table,
		column:column,
		row:row,
		element:$("<div class='tabulator-cell' role='gridcell'></div>"),
		value:null,

		//////////////// Setup Functions /////////////////

		getElement:function(){
			return this.element;
		},

		setValue:function(value){
			row.data[column.definition.field] = value;

			this.generateContents();
		},

		generateContents:function(){
			var self = this;

			self.element.html(row.data[column.definition.field]);
		},
	}

	cell.generateContents();

	return cell;
}