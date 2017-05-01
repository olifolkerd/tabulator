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

		//generate element
		generateElement:function(){
			this.setWidth(this.column.width);

			this._configureCell();

			this.setValue(this.row.data[this.column.getField()]);
		},


		_configureCell:function(){
			var self = this,
			cellEvents = self.column.cellEvents,
			element = self.element;

			//set text alignment
			element.css("text-align", typeof(self.column.definition.align) == "undefined" ? "" : self.column.definition.align);

			//set event bindings
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

			if(self.column.extensions.edit){
				self.table.extensions.edit.bindEditor(self);
			}
		},

		//generate cell contents
		_generateContents:function(){
			var self = this;

			if(self.table.extExists("format")){
				self.element.html(self.table.extensions.format.formatValue(self));
			}else{
				self.element.html(self.value);
			}
		},

		//generate tooltip text
		_generateTooltip:function(){
			var self = this;

			var tooltip = self.column.definition.tooltip || self.column.definition.tooltip === false ? self.column.definition.tooltip : self.table.options.tooltips;

			if(tooltip){
				if(tooltip === true){
					tooltip = self.value;
				}else if(typeof(tooltip) == "function"){
					tooltip = tooltip(self.column.getField(), self.value, self.row.getData());
				}

				self.element.attr("title", tooltip);
			}else{
				self.element.attr("title", "");
			}
		},


		//////////////////// Getters ////////////////////
		getElement:function(){
			return this.element;
		},

		getValue:function(){
			return this.value;
		},


		//////////////////// Actions ////////////////////

		setValue:function(value, userEdit){
			var oldVal,
			changed = false;

			if(this.value != value){

				if(userEdit){
					changed = true;
					oldVal = this.value;

					if(this.column.extensions.mutate && this.column.extensions.mutate.type !== "data"){
						value = this.table.extensions.mutator.transformCell(cell, value);
					}
				}

				this.value = value;
				this.row.data[this.column.getField()] = value;
			}

			this._generateContents();
			this._generateTooltip();

			//set resizable handles
			if(this.table.options.colResizable && this.table.extExists("resizeColumns")){
				this.table.extensions.resizeColumns.initializeColumn(this.column, this.element);
			}

			if(changed){
				this.table.options.cellEdited(this.row.getData()[this.table.options.index], this.column.getField(), value, oldVal, this.row.getData(), this.getElement(), this.row.getElement());
				this.table.options.dataEdited(this.table.rowManager.getData());
			}
		},

		setWidth:function(width){
			this.width = width;
			this.element.css("width", width || "");
		},

		getWidth:function(){
			return this.width || this.element.outerWidth();
		},

		setMinWidth:function(minWidth){
			this.minWidth = minWidth;
			this.element.css("min-width", minWidth || "");
		},

		setHeight:function(height){
			this.height = height;
			this.element.css("height", height || "");
		},

		getHeight:function(){
			return this.height || this.element.outerHeight();
		},
	}

	cell.generateElement();

	return cell;
}