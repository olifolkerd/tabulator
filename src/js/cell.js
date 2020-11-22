
//public row object
var CellComponent = function (cell){
	this._cell = cell;
};

CellComponent.prototype.getValue = function(){
	return this._cell.getValue();
};

CellComponent.prototype.getOldValue = function(){
	return this._cell.getOldValue();
};

CellComponent.prototype.getInitialValue = function(){
	return this._cell.initialValue;
};

CellComponent.prototype.getElement = function(){
	return this._cell.getElement();
};

CellComponent.prototype.getRow = function(){
	return this._cell.row.getComponent();
};

CellComponent.prototype.getData = function(){
	return this._cell.row.getData();
};

CellComponent.prototype.getField = function(){
	return this._cell.column.getField();
};

CellComponent.prototype.getColumn = function(){
	return this._cell.column.getComponent();
};

CellComponent.prototype.setValue = function(value, mutate){
	if(typeof mutate == "undefined"){
		mutate = true;
	}

	this._cell.setValue(value, mutate);
};

CellComponent.prototype.restoreOldValue = function(){
	this._cell.setValueActual(this._cell.getOldValue());
};

CellComponent.prototype.restoreInitialValue = function(){
	this._cell.setValueActual(this._cell.initialValue);
};

CellComponent.prototype.edit = function(force){
	return this._cell.edit(force);
};

CellComponent.prototype.cancelEdit = function(){
	this._cell.cancelEdit();
};

CellComponent.prototype.isEdited = function(){
	return !! this._cell.modules.edit && this._cell.modules.edit.edited;
};

CellComponent.prototype.clearEdited = function(){
	if(self.table.modExists("edit", true)){
		this._cell.table.modules.edit.clearEdited(this._cell);
	}
};


CellComponent.prototype.isValid = function(){
	return this._cell.modules.validate ? !this._cell.modules.validate.invalid : true;
};

CellComponent.prototype.validate = function(){
	return this._cell.validate();
};

CellComponent.prototype.clearValidation = function(){
	if(this._cell.table.modExists("validate", true)){
		this._cell.table.modules.validate.clearValidation(this._cell);
	}
};


CellComponent.prototype.nav = function(){
	return this._cell.nav();
};

CellComponent.prototype.checkHeight = function(){
	this._cell.checkHeight();
};

CellComponent.prototype.getTable = function(){
	return this._cell.table;
};

CellComponent.prototype._getSelf = function(){
	return this._cell;
};



var Cell = function(column, row){

	this.table = column.table;
	this.column = column;
	this.row = row;
	this.element = null;
	this.value = null;
	this.initialValue;
	this.oldValue = null;
	this.modules = {};

	this.height = null;
	this.width = null;
	this.minWidth = null;

	this.component = null;

	this.loaded = false; //track if the cell has been added to the DOM yet

	this.build();
};

//////////////// Setup Functions /////////////////

//generate element
Cell.prototype.build = function(){
	this.generateElement();

	this.setWidth();

	this._configureCell();

	this.setValueActual(this.column.getFieldValue(this.row.data));

	this.initialValue = this.value;
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
	vertAligns = {
		top:"flex-start",
		bottom:"flex-end",
		middle:"center",
	},
	hozAligns = {
		left:"flex-start",
		right:"flex-end",
		center:"center",
	};

	//set text alignment
	element.style.textAlign = self.column.hozAlign;

	if(self.column.vertAlign){
		element.style.display = "inline-flex";

		element.style.alignItems = vertAligns[self.column.vertAlign] || "";

		if(self.column.hozAlign){
			element.style.justifyContent = hozAligns[self.column.hozAlign] || "";
		}
	}

	if(field){
		element.setAttribute("tabulator-field", field);
	}

	//add class to cell if needed
	if(self.column.definition.cssClass){
		var classNames = self.column.definition.cssClass.split(" ")
		classNames.forEach(function(className) {
			element.classList.add(className)
		});
	}

	//update tooltip on mouse enter
	if (this.table.options.tooltipGenerationMode === "hover"){
		element.addEventListener("mouseenter", function(e){
			self._generateTooltip();
		});
	}

	self._bindClickEvents(cellEvents);

	self._bindTouchEvents(cellEvents);

	self._bindMouseEvents(cellEvents);

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

Cell.prototype._bindClickEvents = function(cellEvents){
	var self = this,
	element = self.element;

	//set event bindings
	if (cellEvents.cellClick || self.table.options.cellClick){
		element.addEventListener("click", function(e){
			var component = self.getComponent();

			if(cellEvents.cellClick){
				cellEvents.cellClick.call(self.table, e, component);
			}

			if(self.table.options.cellClick){
				self.table.options.cellClick.call(self.table, e, component);
			}
		});
	}

	if (cellEvents.cellDblClick || this.table.options.cellDblClick){
		element.addEventListener("dblclick", function(e){
			var component = self.getComponent();

			if(cellEvents.cellDblClick){
				cellEvents.cellDblClick.call(self.table, e, component);
			}

			if(self.table.options.cellDblClick){
				self.table.options.cellDblClick.call(self.table, e, component);
			}
		});
	}else{
		element.addEventListener("dblclick", function(e){

			if(self.table.modExists("edit")){
				if (self.table.modules.edit.currentCell === self){
					return; //prevent instant selection of editor content
				}
			}

			e.preventDefault();

			try{
				if (document.selection) { // IE
					var range = document.body.createTextRange();
					range.moveToElementText(self.element);
					range.select();
				} else if (window.getSelection) {
					var range = document.createRange();
					range.selectNode(self.element);
					window.getSelection().removeAllRanges();
					window.getSelection().addRange(range);
				}
			}catch(e){}
		});
	}

	if (cellEvents.cellContext || this.table.options.cellContext){
		element.addEventListener("contextmenu", function(e){
			var component = self.getComponent();

			if(cellEvents.cellContext){
				cellEvents.cellContext.call(self.table, e, component);
			}

			if(self.table.options.cellContext){
				self.table.options.cellContext.call(self.table, e, component);
			}
		});
	}
};


Cell.prototype._bindMouseEvents = function(cellEvents){
	var self = this,
	element = self.element;

	if (cellEvents.cellMouseEnter || self.table.options.cellMouseEnter){
		element.addEventListener("mouseenter", function(e){
			var component = self.getComponent();

			if(cellEvents.cellMouseEnter){
				cellEvents.cellMouseEnter.call(self.table, e, component);
			}

			if(self.table.options.cellMouseEnter){
				self.table.options.cellMouseEnter.call(self.table, e, component);
			}
		});
	}

	if (cellEvents.cellMouseLeave || self.table.options.cellMouseLeave){
		element.addEventListener("mouseleave", function(e){
			var component = self.getComponent();

			if(cellEvents.cellMouseLeave){
				cellEvents.cellMouseLeave.call(self.table, e, component);
			}

			if(self.table.options.cellMouseLeave){
				self.table.options.cellMouseLeave.call(self.table, e, component);
			}
		});
	}

	if (cellEvents.cellMouseOver || self.table.options.cellMouseOver){
		element.addEventListener("mouseover", function(e){
			var component = self.getComponent();

			if(cellEvents.cellMouseOver){
				cellEvents.cellMouseOver.call(self.table, e, component);
			}

			if(self.table.options.cellMouseOver){
				self.table.options.cellMouseOver.call(self.table, e, component);
			}
		});
	}

	if (cellEvents.cellMouseOut || self.table.options.cellMouseOut){
		element.addEventListener("mouseout", function(e){
			var component = self.getComponent();

			if(cellEvents.cellMouseOut){
				cellEvents.cellMouseOut.call(self.table, e, component);
			}

			if(self.table.options.cellMouseOut){
				self.table.options.cellMouseOut.call(self.table, e, component);
			}
		});
	}

	if (cellEvents.cellMouseMove || self.table.options.cellMouseMove){
		element.addEventListener("mousemove", function(e){
			var component = self.getComponent();

			if(cellEvents.cellMouseMove){
				cellEvents.cellMouseMove.call(self.table, e, component);
			}

			if(self.table.options.cellMouseMove){
				self.table.options.cellMouseMove.call(self.table, e, component);
			}
		});
	}


};


Cell.prototype._bindTouchEvents = function(cellEvents){
	var self = this,
	element = self.element,
	dblTap,	tapHold, tap;

	if (cellEvents.cellTap || this.table.options.cellTap){
		tap = false;

		element.addEventListener("touchstart", function(e){
			tap = true;
		}, {passive: true});

		element.addEventListener("touchend", function(e){
			if(tap){
				var component = self.getComponent();

				if(cellEvents.cellTap){
					cellEvents.cellTap.call(self.table, e, component);
				}

				if(self.table.options.cellTap){
					self.table.options.cellTap.call(self.table, e, component);
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
					cellEvents.cellDblTap.call(self.table, e, component);
				}

				if(self.table.options.cellDblTap){
					self.table.options.cellDblTap.call(self.table, e, component);
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
					cellEvents.cellTapHold.call(self.table, e, component);
				}

				if(self.table.options.cellTapHold){
					self.table.options.cellTapHold.call(self.table, e, component);
				}
			}, 1000);

		}, {passive: true});

		element.addEventListener("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}
};


//generate cell contents
Cell.prototype._generateContents = function(){
	var val;

	if(this.table.modExists("format")){
		val = this.table.modules.format.formatValue(this);
	}else{
		val = this.element.innerHTML = this.value;
	}

	switch(typeof val){
		case "object":
		if(val instanceof Node){

			//clear previous cell contents
			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

			this.element.appendChild(val);
		}else{
			this.element.innerHTML = "";

			if(val != null){
				console.warn("Format Error - Formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", val);
			}
		}
		break;
		case "undefined":
		case "null":
		this.element.innerHTML = "";
		break;
		default:
		this.element.innerHTML = val;
	}
};

Cell.prototype.cellRendered = function(){
	if(this.table.modExists("format") && this.table.modules.format.cellRendered){
		this.table.modules.format.cellRendered(this);
	}
};

//generate tooltip text
Cell.prototype._generateTooltip = function(){
	var tooltip = this.column.tooltip;

	if(tooltip){
		if(tooltip === true){
			tooltip = this.value;
		}else if(typeof(tooltip) == "function"){
			tooltip = tooltip(this.getComponent());

			if(tooltip === false){
				tooltip = "";
			}
		}

		if(typeof tooltip === "undefined"){
			tooltip = "";
		}

		this.element.setAttribute("title", tooltip);
	}else{
		this.element.setAttribute("title", "");
	}
};


//////////////////// Getters ////////////////////
Cell.prototype.getElement = function(containerOnly){
	if(!this.loaded){
		this.loaded = true;
		if(!containerOnly){
			this.layoutElement();
		}
	}

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
			this.column.cellEvents.cellEdited.call(this.table, component);
		}

		if(this.table.options.groupUpdateOnCellEdit && this.table.options.groupBy && this.table.modExists("groupRows")) {
			this.table.modules.groupRows.reassignRowToGroup(this.row);
		}

		this.cellRendered();

		this.table.options.cellEdited.call(this.table, component);

		if(this.table.options.dataChanged){
			this.table.options.dataChanged.call(this.table, this.table.rowManager.getData());
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

	if(changed && this.table.modExists("columnCalcs")){
		if(this.column.definition.topCalc || this.column.definition.bottomCalc){
			if(this.table.options.groupBy && this.table.modExists("groupRows")){

				if(this.table.options.columnCalcs == "table" || this.table.options.columnCalcs == "both"){
					this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
				}

				if(this.table.options.columnCalcs != "table"){
					this.table.modules.columnCalcs.recalcRowGroup(this.row);
				}

			}else{
				this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
			}
		}
	}

	return changed;
};

Cell.prototype.setValueActual = function(value){
	this.oldValue = this.value;

	this.value = value;

	if(this.table.options.reactiveData && this.table.modExists("reactiveData")){
		this.table.modules.reactiveData.block();
	}

	this.column.setFieldValue(this.row.data, value);

	if(this.table.options.reactiveData && this.table.modExists("reactiveData")){
		this.table.modules.reactiveData.unblock();
	}

	if(this.loaded){
		this.layoutElement();
	}
};

Cell.prototype.layoutElement = function(){
	this._generateContents();
	this._generateTooltip();

	//set resizable handles
	if(this.table.options.resizableColumns && this.table.modExists("resizeColumns") && this.row.type === "row"){
		this.table.modules.resizeColumns.initializeColumn("cell", this.column, this.element);
	}


	if((this.column.definition.contextMenu || this.column.definition.clickMenu) && this.table.modExists("menu")){
		this.table.modules.menu.initializeCell(this);
	}

	//handle frozen cells
	if(this.table.modExists("frozenColumns")){
		this.table.modules.frozenColumns.layoutElement(this.element, this.column);
	}
};

Cell.prototype.setWidth = function(){
	this.width = this.column.width;
	this.element.style.width = this.column.widthStyled;
};

Cell.prototype.clearWidth = function(){
	this.width = "";
	this.element.style.width = "";
};

Cell.prototype.getWidth = function(){
	return this.width || this.element.offsetWidth;
};

Cell.prototype.setMinWidth = function(){
	this.minWidth = this.column.minWidth;
	this.element.style.minWidth = this.column.minWidthStyled;
};

Cell.prototype.setMaxWidth = function(){
	this.maxWidth = this.column.maxWidth;
	this.element.style.maxWidth = this.column.maxWidthStyled;
};

Cell.prototype.checkHeight = function(){
	// var height = this.element.css("height");
	this.row.reinitializeHeight();
};

Cell.prototype.clearHeight = function(){
	this.element.style.height = "";
	this.height = null;
};


Cell.prototype.setHeight = function(){
	this.height = this.row.height;
	this.element.style.height =  this.row.heightStyled;
};

Cell.prototype.getHeight = function(){
	return this.height || this.element.offsetHeight;
};

Cell.prototype.show = function(){
	this.element.style.display = this.column.vertAlign ? "inline-flex" : "";
};

Cell.prototype.hide = function(){
	this.element.style.display = "none";
};

Cell.prototype.edit = function(force){
	if(this.table.modExists("edit", true)){
		return this.table.modules.edit.editCell(this, force);
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


Cell.prototype.validate = function(){
	if(this.column.modules.validate && this.table.modExists("validate", true)){
		var valid = this.table.modules.validate.validate(this.column.modules.validate, this, this.getValue());

		return valid === true;
	}else{
		return true;
	}
};

Cell.prototype.delete = function(){
	if(!this.table.rowManager.redrawBlock && this.element.parentNode){
		this.element.parentNode.removeChild(this.element);
	}

	if(this.modules.validate && this.modules.validate.invalid){
		this.table.modules.validate.clearValidation(this);
	}

	if(this.modules.edit && this.modules.edit.edited){
		this.table.modules.edit.clearEdited(this);
	}

	if(this.table.options.history){
		this.table.modules.history.clearComponentHistory(this);
	}

	this.element = false;
	this.column.deleteCell(this);
	this.row.deleteCell(this);
	this.calcs = {};
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

	if(!this.component){
		this.component = new CellComponent(this);
	}

	return this.component;
};