
//public row object
var CellComponent = function (cell){
	this.cell = cell;
};

CellComponent.prototype.getValue = function(){
	return this.cell.getValue();
};

CellComponent.prototype.getOldValue = function(){
	return this.cell.getOldValue();
};

CellComponent.prototype.getElement = function(){
	return this.cell.getElement();
};

CellComponent.prototype.getRow = function(){
	return this.cell.row.getComponent();
};

CellComponent.prototype.getData = function(){
	return this.cell.row.getData();
};

CellComponent.prototype.getField = function(){
	return this.cell.column.getField();
};

CellComponent.prototype.getColumn = function(){
	return this.cell.column.getComponent();
};

CellComponent.prototype.setValue = function(value, mutate){
	if(typeof mutate == "undefined"){
		mutate = true;
	}

	this.cell.setValue(value, mutate);
};

CellComponent.prototype.restoreOldValue = function(){
	this.cell.setValueActual(this.cell.getOldValue());
};

CellComponent.prototype.edit = function(force){
	return this.cell.edit(force);
};

CellComponent.prototype.cancelEdit = function(){
	this.cell.cancelEdit(force);
};


CellComponent.prototype.nav = function(){
	return this.cell.nav();
};

CellComponent.prototype.checkHeight = function(){
	this.cell.checkHeight();
};

CellComponent.prototype.getTable = function(){
	return this.cell.table;
};

CellComponent.prototype._getSelf = function(){
	return this.cell;
};



var Cell = function(column, row){

	this.table = column.table;
	this.column = column;
	this.row = row;
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
	this.element = this.element;
};


Cell.prototype._configureCell = function(){
	var self = this,
	cellEvents = self.column.cellEvents,
	element = self.element,
	field = this.column.getField(),
	dblTap,	tapHold, tap;

	//set text alignment
	element.style.textAlign = self.column.hozAlign;

	if(field){
		element.setAttribute("tabulator-field", field);
	}

	if(self.column.definition.cssClass){
		element.classList.add(self.column.definition.cssClass);
	}

	//set event bindings
	if (cellEvents.cellClick || self.table.options.cellClick){
		self.element.addEventListener("click", function(e){
			var component = self.getComponent();

			if(cellEvents.cellClick){
				cellEvents.cellClick(e, component);
			}

			if(self.table.options.cellClick){
				self.table.options.cellClick(e, component);
			}
		});
	}

	if (cellEvents.cellDblClick || this.table.options.cellDblClick){
		element.addEventListener("dblclick", function(e){
			var component = self.getComponent();

			if(cellEvents.cellDblClick){
				cellEvents.cellDblClick(e, component);
			}

			if(self.table.options.cellDblClick){
				self.table.options.cellDblClick(e, component);
			}
		});
	}

	if (cellEvents.cellContext || this.table.options.cellContext){
		element.addEventListener("contextmenu", function(e){
			var component = self.getComponent();

			if(cellEvents.cellContext){
				cellEvents.cellContext(e, component);
			}

			if(self.table.options.cellContext){
				self.table.options.cellContext(e, component);
			}
		});
	}

	if (this.table.options.tooltipGenerationMode === "hover"){
		//update tooltip on mouse enter
		element.addEventListener("mouseenter", function(e){
			self._generateTooltip();
		});
	}

	if (cellEvents.cellTap || this.table.options.cellTap){
		tap = false;

		element.addEventListener("touchstart", function(e){
			tap = true;
		});

		element.addEventListener("touchend", function(e){
			if(tap){
				var component = self.getComponent();

				if(cellEvents.cellTap){
					cellEvents.cellTap(e, component);
				}

				if(self.table.options.cellTap){
					self.table.options.cellTap(e, component);
				}
			}

			tap = false;
		});
	}

	if (cellEvents.cellDblTap || this.table.options.cellDblTap){
		dblTap = null;

		element.addEventListener("touchend", function(e){

			if(dblTap){
				clearTimeout(dblTap);
				dblTap = null;

				var component = self.getComponent();

				if(cellEvents.cellDblTap){
					cellEvents.cellDblTap(e, component);
				}

				if(self.table.options.cellDblTap){
					self.table.options.cellDblTap(e, component);
				}
			}else{

				dblTap = setTimeout(function(){
					clearTimeout(dblTap);
					dblTap = null;
				}, 300);
			}

		});
	}

	if (cellEvents.cellTapHold || this.table.options.cellTapHold){
		tapHold = null;

		element.addEventListener("touchstart", function(e){
			clearTimeout(tapHold);

			tapHold = setTimeout(function(){
				clearTimeout(tapHold);
				tapHold = null;
				tap = false;
				var component = self.getComponent();

				if(cellEvents.cellTapHold){
					cellEvents.cellTapHold(e, component);
				}

				if(self.table.options.cellTapHold){
					self.table.options.cellTapHold(e, component);
				}
			}, 1000);

		});

		element.addEventListener("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}

	if(self.column.modules.edit){
		self.table.modules.edit.bindEditor(self);
	}

	if(self.column.definition.rowHandle && self.table.options.movableRows !== false && self.table.modExists("moveRow")){
		self.table.modules.moveRow.initializeCell(self);
	}

	//hide cell if not visible
	if(!self.column.visible){
		self.hide();
	}
};

//generate cell contents
Cell.prototype._generateContents = function(){
	var self = this, val;

	if(self.table.modExists("format")){
		val = self.table.modules.format.formatValue(self);
		if(typeof val !== "object"){
			self.element.innerHTML = val;
		}else{
			self.element.appendChild(val);
		}

	}else{
		self.element.innerHTML = self.value;
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

			if(tooltip === false){
				tooltip = "";
			}
		}

		self.element.setAttribute("title", tooltip);
	}else{
		self.element.setAttribute("title", "");
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

	var changed = this.setValueProcessData(value, mutate),
	component;

	if(changed){
		if(this.table.options.history && this.table.modExists("history")){
			this.table.modules.history.action("cellEdit", this, {oldValue:this.oldValue, newValue:this.value});
		}

		component = this.getComponent();

		if(this.column.cellEvents.cellEdited){
			this.column.cellEvents.cellEdited(component);
		}

		this.table.options.cellEdited(component);

		this.table.options.dataEdited(this.table.rowManager.getData());
	}

	if(this.table.modExists("columnCalcs")){
		if(this.column.definition.topCalc || this.column.definition.bottomCalc){
			if(this.table.options.groupBy && this.table.modExists("groupRows")){
				this.table.modules.columnCalcs.recalcRowGroup(this.row);
			}else{
				this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
			}
		}
	}

};

Cell.prototype.setValueProcessData = function(value, mutate){
	var changed = false;

	if(this.value != value){

		changed = true;

		if(mutate){
			if(this.column.modules.mutate){
				value = this.table.modules.mutator.transformCell(this, value);
			}
		}
	}

	this.setValueActual(value);

	return changed;
};

Cell.prototype.setValueActual = function(value){
	this.oldValue = this.value;

	this.value = value;

	this.column.setFieldValue(this.row.data, value);

	this._generateContents();
	this._generateTooltip();

	//set resizable handles
	if(this.table.options.resizableColumns && this.table.modExists("resizeColumns")){
		this.table.modules.resizeColumns.initializeColumn("cell", this.column, this.element);
	}

	//handle frozen cells
	if(this.table.modExists("frozenColumns")){
		this.table.modules.frozenColumns.layoutElement(this.element, this.column);
	}
};

Cell.prototype.setWidth = function(width){
	this.width = width;
	// this.element.css("width", width || "");
	this.element.style.width = (width ? width + "px" : "");
};

Cell.prototype.getWidth = function(){
	return this.width || this.element.offsetWidth;
};

Cell.prototype.setMinWidth = function(minWidth){
	this.minWidth = minWidth;
	this.element.style.minWidth =  (minWidth ? minWidth + "px" : "");
};

Cell.prototype.checkHeight = function(){
	// var height = this.element.css("height");

	this.row.reinitializeHeight();
};

Cell.prototype.clearHeight = function(){
	this.element.style.height = "";
};


Cell.prototype.setHeight = function(height){
	this.height = height;
	this.element.style.height = (height ? height + "px" : "");
};

Cell.prototype.getHeight = function(){
	return this.height || this.element.offsetHeight;
};

Cell.prototype.show = function(){
	this.element.style.display = "";
};

Cell.prototype.hide = function(){
	this.element.style.display = "none";
};

Cell.prototype.edit = function(force){
	if(this.table.modExists("edit", true)){
		return this.table.modules.edit.editCell(this, false, force);
	}
};

Cell.prototype.cancelEdit = function(){
	if(this.table.modExists("edit", true)){
		var editing = this.table.modules.edit.getCurrentCell();

		if(editing && editing._getSelf() === this){
			this.table.modules.edit.cancelEdit();
		}else{
			console.warn("Cancel Editor Error - This cell is not currently being edited ");
		}
	}
};




Cell.prototype.delete = function(){
	this.element.parentNode.removeChild(this.element);
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
				nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

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
				prevRow = self.table.rowManager.prevDisplayRow(self.row, true);

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
			var nextRow = self.table.rowManager.prevDisplayRow(self.row, true);

			if(nextRow){
				nextRow.cells[index].edit();
			}
		},
		down:function(){
			var nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

			if(nextRow){
				nextRow.cells[index].edit();
			}
		},

	};

};

Cell.prototype.getIndex = function(){
	this.row.getCellIndex(this);
};

//////////////// Object Generation /////////////////
Cell.prototype.getComponent = function(){
	return new CellComponent(this);
};