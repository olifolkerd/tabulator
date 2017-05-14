
//public row object
var CellObject = function (cell){

	var obj = {
		getValue:function(){
			return cell.getValue();
		},

		getOldValue:function(){
			return cell.getOldValue();
		},

		getElement:function(){
			return cell.getElement();
		},

		getRow:function(){
			return cell.row.getObject();
		},

		getColumn:function(){
			return cell.column.getObject();
		},

		setValue:function(value, mutate){
			cell.setValue(value, mutate);
		},

		checkHeight:function(){
			cell.checkHeight();
		},

		_getSelf:function(){
			return cell;
		},
	}

	return obj;
};

var Cell = function(column, row){

	this.table = column.table;
	this.column = column;
	this.row = row;
	this.element = $("<div class='tabulator-cell' role='gridcell'></div>");
	this.value = null;
	this.oldValue = null;

	this.height = null;
	this.width = null;
	this.minWidth = null;

	this.generateElement();
};

//////////////// Setup Functions /////////////////

//generate element
Cell.prototype.generateElement = function(){
	this.setWidth(this.column.width);

	this._configureCell();

	this.setValue(this.row.data[this.column.getField()]);
};


Cell.prototype._configureCell = function(){
	var self = this,
	cellEvents = self.column.cellEvents,
	element = self.element,
	field = this.column.getField();

	//set text alignment
	element.css("text-align", typeof(self.column.definition.align) == "undefined" ? "" : self.column.definition.align);

	if(field){
		element.attr("tabulator-field", field);
	}

	//set event bindings
	if (cellEvents.onClick){
		self.element.on("click", function(e){
			cellEvents.onClick(e, self.getObject());
		});
	}

	if (cellEvents.onDblClick){
		self.element.on("dblclick", function(e){
			cellEvents.onDblClick(e, self.getObject());
		});
	}

	if (cellEvents.onContext){
		self.element.on("contextmenu", function(e){
			cellEvents.onContext(e, self.getObject());
		});
	}

	if(self.column.extensions.edit){
		self.table.extensions.edit.bindEditor(self);
	}

	if(self.column.visible){
		self.show();
	}else{
		self.hide();
	}
};

//generate cell contents
Cell.prototype._generateContents = function(){
	var self = this;

	if(self.table.extExists("format")){
		self.element.html(self.table.extensions.format.formatValue(self));
	}else{
		self.element.html(self.value);
	}
};

//generate tooltip text
Cell.prototype._generateTooltip = function(){
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
};


//////////////////// Getters ////////////////////
Cell.prototype.getElement = function(){
	return this.element;
};

Cell.prototype.getValue = function(){
	return this.value;
};

Cell.prototype.getOldValue = function(){
	return this.oldValue;
};

//////////////////// Actions ////////////////////

Cell.prototype.setValue = function(value, mutate){
	var oldVal,
	changed = false;

	if(this.value != value){

		if(mutate){
			changed = true;
			oldVal = this.value;

			if(this.column.extensions.mutate && this.column.extensions.mutate.type !== "data"){
				value = this.table.extensions.mutator.transformCell(cell, value);
			}
		}

		this.oldValue = this.value;

		this.value = value;
		this.row.data[this.column.getField()] = value;
	}

	this._generateContents();
	this._generateTooltip();

	//set resizable handles
	if(this.table.options.resizableColumns && this.table.extExists("resizeColumns")){
		this.table.extensions.resizeColumns.initializeColumn(this.column, this.element);
	}

	//handle frozen cells
	if(this.table.extExists("frozenColumns")){
		this.table.extensions.frozenColumns.layoutElement(this.element, this.column);
	}

	if(changed){
		this.table.options.cellEdited(this.getObject());
		this.table.options.dataEdited(this.table.rowManager.getData());
	}
};

Cell.prototype.setWidth = function(width){
	this.width = width;
	this.element.css("width", width || "");
};

Cell.prototype.getWidth = function(){
	return this.width || this.element.outerWidth();
};

Cell.prototype.setMinWidth = function(minWidth){
	this.minWidth = minWidth;
	this.element.css("min-width", minWidth || "");
};

Cell.prototype.checkHeight = function(){
	var height = this.element.css("height");

	if(this.element.is(":visible") && height){
		this.element.css("height", "");

		if(this.element.outerHeight() != parseInt(height)){
			this.row.normalizeHeight(true);
		}else{
			this.element.css("height", height);
		}
	}else{
		this.row.reinitialize();
	}
};

Cell.prototype.setHeight = function(height){
	this.height = height;
	this.element.css("height", height || "");
};

Cell.prototype.getHeight = function(){
	return this.height || this.element.outerHeight();
};

Cell.prototype.show = function(){
	this.element.css("display","");
};

Cell.prototype.hide = function(){
	this.element.css("display","none");
};

Cell.prototype.delete = function(){
	this.element.detach();
	this.column.deleteCell(this);
	this.row.deleteCell(this);
};

//////////////// Object Generation /////////////////
Cell.prototype.getObject = function(){
	return new CellObject(this);
};