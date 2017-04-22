var Cell = function(column, row){
	var cell = {
		table:column.table,
		column:column,
		row:row,
		element:$("<div class='tabulator-cell' role='gridcell'></div>"),
		value:null,

		height:null,
		width:null,
		minWidth:null,

		//////////////// Setup Functions /////////////////

		getElement:function(){
			return this.element;
		},

		setValue:function(value){
			this.value = value;
			this.row.data[this.column.definition.field] = value;

			this.generateContents();
		},

		generateContents:function(){
			var self = this;

			if(self.table.extExists("format")){
				self.element.html(self.table.extensions.format.formatValue(self));
			}else{
				self.element.html(self.value);
			}
		},

		//////////////////// Actions ////////////////////

		setWidth:function(width){
			this.width = width;
			this.element.css("width", width || "");
		},

		getWidth:function(){
			return this.width || this.element.outerWidth();
		},

		// setMinWidth:function(minWidth){
		// 	this.minWidth = minWidth;
		// 	this.element.css("min-width", minWidth || "");
		// },

		setHeight:function(height){
			this.height = height;
			this.element.css("height", height || "");
		},

		getHeight:function(){
			return this.height || this.element.outerHeight();
		},
	}

	cell.setWidth(column.width);
	cell.setValue(row.data[column.definition.field]);
	// cell.setMinWidth(column.minWidth);

	return cell;
}