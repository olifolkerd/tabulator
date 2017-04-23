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

		initialize:function(){
			this.setWidth(column.width);
			this.setValue(row.data[column.definition.field]);
			this.setEventBindings();
		},

		getElement:function(){
			return this.element;
		},

		setEventBindings:function(){
			var self = this,
			cellEvents = this.column.cellEvents,
			element = this.element;

			if (cellEvents.onClick){
				self.element.on("click", function(e){
					cellEvents.onClick(e, self.element, self.value, self.row.getData());
				});
			}

			if (cellEvents.onDblClick){
				self.element.on("dblclick", function(e){
					cellEvents.onDblClick(e, self.element, self.value, self.row.getData());
				});
			}

			if (cellEvents.onContext){
				self.element.on("contextmenu", function(e){
					cellEvents.onContext(e, self.element, self.value, self.row.getData());
				});
			}
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

	cell.initialize();

	return cell;
}