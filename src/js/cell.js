
//public row object
var CellComponent = function (cell){

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
			return cell.row.getComponent();
		},

		getData:function(){
			return cell.row.getData();
		},

		getField:function(){
			return cell.column.getField();
		},

		getColumn:function(){
			return cell.column.getComponent();
		},

		setValue:function(value, mutate){
			if(typeof mutate == "undefined"){
				mutate = true;
			}

			cell.setValue(value, mutate);
		},

		edit:function(){
			cell.edit();
		},

		nav:function(){
			return cell.nav();
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
	// this.element = $("<div class='tabulator-cell' role='gridcell'></div>");
	this.element = null;
	this.value = null;
	this.oldValue = null;

	this.height = null;
	this.width = null;
	this.minWidth = null;

	this.build();
};

//////////////// Setup Functions /////////////////

//generate element
Cell.prototype.build = function(){
	this.generateElement();

	this.setWidth(this.column.width);

	this._configureCell();

	this.setValueActual(this.column.getFieldValue(this.row.data));
};

Cell.prototype.generateElement = function(){
	this.element = document.createElement('div');
	this.element.className = "tabulator-cell";
	this.element.setAttribute("role", "gridcell");
	this.element = $(this.element);
};


Cell.prototype._configureCell = function(){
	var self = this,
	cellEvents = self.column.cellEvents,
	element = self.element,
	field = this.column.getField(),
	dblTap,	tapHold, tap;

	//set text alignment
	element[0].style.textAlign = self.column.hozAlign;

	if(field){
		element.attr("tabulator-field", field);
	}

	if(self.column.definition.cssClass){
		element.addClass(self.column.definition.cssClass);
	}

	//set event bindings
	if (cellEvents.cellClick){
		self.element.on("click", function(e){
			cellEvents.cellClick(e, self.getComponent());
		});
	}

	if (cellEvents.cellDblClick){
		self.element.on("dblclick", function(e){
			cellEvents.cellDblClick(e, self.getComponent());
		});
	}

	if (cellEvents.cellContext){
		self.element.on("contextmenu", function(e){
			cellEvents.cellContext(e, self.getComponent());
		});
	}

	if (cellEvents.cellTap){
		tap = false;

		self.element.on("touchstart", function(e){
			tap = true;
		});

		self.element.on("touchend", function(e){
			if(tap){
				cellEvents.cellTap(e, self.getComponent());
			}

			tap = false;
		});
	}

	if (cellEvents.cellDblTap){
		dblTap = null;

		self.element.on("touchend", function(e){

			if(dblTap){
				clearTimeout(dblTap);
				dblTap = null;

				cellEvents.cellDblTap(e, self.getComponent());
			}else{

				dblTap = setTimeout(function(){
					clearTimeout(dblTap);
					dblTap = null;
				}, 300);
			}

		});
	}

	if (cellEvents.cellTapHold){
		tapHold = null;

		self.element.on("touchstart", function(e){
			clearTimeout(tapHold);

			tapHold = setTimeout(function(){
				clearTimeout(tapHold);
				tapHold = null;
				tap = false;
				cellEvents.cellTapHold(e, self.getComponent());
			}, 1000)

		});

		self.element.on("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}

	if(self.column.extensions.edit){
		self.table.extensions.edit.bindEditor(self);
	}

	if(self.column.definition.rowHandle && self.table.options.movableRows !== false && self.table.extExists("moveRow")){
		self.table.extensions.moveRow.initializeCell(self);
	}

	//hide cell if not visible
	if(!self.column.visible){
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

	var tooltip = self.column.tooltip;

	if(tooltip){
		if(tooltip === true){
			tooltip = self.value;
		}else if(typeof(tooltip) == "function"){
			tooltip = tooltip(self.getComponent());
		}

		self.element[0].setAttribute("title", tooltip);
	}else{
		self.element[0].setAttribute("title", "");
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

	var changed = this.setValueProcessData(value, mutate);

	if(changed){
		if(this.table.options.history && this.table.extExists("history")){
			this.table.extensions.history.action("cellEdit", this, {oldValue:this.oldValue, newValue:this.value});
		};

		this.table.options.cellEdited(this.getComponent());
		this.table.options.dataEdited(this.table.rowManager.getData());
	}

	if(this.table.extExists("columnCalcs")){
		this.table.extensions.columnCalcs.recalc(this.table.rowManager.displayRows);
	}

};

Cell.prototype.setValueProcessData = function(value, mutate){
	var changed = false;

	if(this.value != value){

		changed = true;

		if(mutate){
			if(this.column.extensions.mutate && this.column.extensions.mutate.type !== "data"){
				value = this.table.extensions.mutator.transformCell(this, value);
			}
		}
	}

	this.setValueActual(value);

	return changed;
}

Cell.prototype.setValueActual = function(value){
	this.oldValue = this.value;

	this.value = value;

	this.column.setFieldValue(this.row.data, value);

	this._generateContents();
	this._generateTooltip();

	//set resizable handles
	if(this.table.options.resizableColumns && this.table.extExists("resizeColumns")){
		this.table.extensions.resizeColumns.initializeColumn("cell", this.column, this.element);
	}

	//handle frozen cells
	if(this.table.extExists("frozenColumns")){
		this.table.extensions.frozenColumns.layoutElement(this.element, this.column);
	}
};

Cell.prototype.setWidth = function(width){
	this.width = width;
	// this.element.css("width", width || "");
	this.element[0].style.width = (width ? width + "px" : "");
};

Cell.prototype.getWidth = function(){
	return this.width || this.element.outerWidth();
};

Cell.prototype.setMinWidth = function(minWidth){
	this.minWidth = minWidth;
	this.element[0].style.minWidth =  (minWidth ? minWidth + "px" : "");
};

Cell.prototype.checkHeight = function(){
	var height = this.element.css("height");

	this.row.reinitializeHeight();
};

Cell.prototype.clearHeight = function(){
	this.element[0].style.height = "";
};


Cell.prototype.setHeight = function(height){
	this.height = height;
	this.element[0].style.height = (height ? height + "px" : "");
};

Cell.prototype.getHeight = function(){
	return this.height || this.element.outerHeight();
};

Cell.prototype.show = function(){
	this.element[0].style.display = "";
};

Cell.prototype.hide = function(){
	this.element[0].style.display = "none";
};

Cell.prototype.edit = function(){
	this.element.focus();
};

Cell.prototype.delete = function(){
	this.element.detach();
	this.column.deleteCell(this);
	this.row.deleteCell(this);
};

//////////////// Navigation /////////////////

Cell.prototype.nav = function(){

	var self = this,
	nextCell = false,
	index = this.row.getCellIndex(this);

	return {
		next:function(){

			var nextCell = this.right(),
			nextRow;

			if(!nextCell){
				nextRow = self.table.rowManager.nextDisplayRow(self.row);

				if(nextRow){
					nextCell = nextRow.findNextEditableCell(-1);

					if(nextCell){
						nextCell.edit();
						return true;
					}
				}
			}else{
				return true;
			}

			return false;

		},
		prev:function(){
			var nextCell = this.left(),
			prevRow;

			if(!nextCell){
				prevRow = self.table.rowManager.prevDisplayRow(self.row);

				if(prevRow){
					nextCell = prevRow.findPrevEditableCell(prevRow.cells.length);

					if(nextCell){
						nextCell.edit();
						return true;
					}
				}

			}else{
				return true;
			}

			return false;

		},
		left:function(){

			nextCell = self.row.findPrevEditableCell(index);

			if(nextCell){
				nextCell.edit();
				return true;
			}else{
				return false;
			}

		},
		right:function(){
			nextCell = self.row.findNextEditableCell(index);

			if(nextCell){
				nextCell.edit();
				return true;
			}else{
				return false;
			}
		},
		up:function(){
			var nextRow = self.table.rowManager.prevDisplayRow(self.row);

			if(nextRow){
				nextRow.cells[index].edit();
			}
		},
		down:function(){
			var nextRow = self.table.rowManager.nextDisplayRow(self.row);

			if(nextRow){
				nextRow.cells[index].edit();
			}
		},

	}

};

Cell.prototype.getIndex = function(){
	this.row.getCellIndex(this);
};

//////////////// Object Generation /////////////////
Cell.prototype.getComponent = function(){
	return new CellComponent(this);
};