//public row object
var RowComponent = function (row){
	this._row = row;
};

RowComponent.prototype.getData = function(transform){
	return this._row.getData(transform);
};

RowComponent.prototype.getElement = function(){
	return this._row.getElement();
};

RowComponent.prototype.getCells = function(){
	var cells = [];

	this._row.getCells().forEach(function(cell){
		cells.push(cell.getComponent());
	});

	return cells;
};

RowComponent.prototype.getCell = function(column){
	var cell = this._row.getCell(column);
	return cell ? cell.getComponent() : false;
};

RowComponent.prototype.getIndex = function(){
	return this._row.getData("data")[this._row.table.options.index];
};

RowComponent.prototype.getPosition = function(active){
	return this._row.table.rowManager.getRowPosition(this._row, active);
};

RowComponent.prototype.delete = function(){
	return this._row.delete();
};

RowComponent.prototype.scrollTo = function(){
	return this._row.table.rowManager.scrollToRow(this._row);
};

RowComponent.prototype.pageTo = function(){
	if(this._row.table.modExists("page", true)){
		return this._row.table.modules.page.setPageToRow(this._row);
	}
};

RowComponent.prototype.move = function(to, after){
	this._row.moveToRow(to, after);
};

RowComponent.prototype.update = function(data){
	return this._row.updateData(data);
};

RowComponent.prototype.normalizeHeight = function(){
	this._row.normalizeHeight(true);
};

RowComponent.prototype.select = function(){
	this._row.table.modules.selectRow.selectRows(this._row);
};

RowComponent.prototype.deselect = function(){
	this._row.table.modules.selectRow.deselectRows(this._row);
};

RowComponent.prototype.toggleSelect = function(){
	this._row.table.modules.selectRow.toggleRow(this._row);
};

RowComponent.prototype.isSelected = function(){
	return this._row.table.modules.selectRow.isRowSelected(this._row);
};

RowComponent.prototype._getSelf = function(){
	return this._row;
};

RowComponent.prototype.validate = function(){
	return this._row.validate();
};

RowComponent.prototype.freeze = function(){
	if(this._row.table.modExists("frozenRows", true)){
		this._row.table.modules.frozenRows.freezeRow(this._row);
	}
};

RowComponent.prototype.unfreeze = function(){
	if(this._row.table.modExists("frozenRows", true)){
		this._row.table.modules.frozenRows.unfreezeRow(this._row);
	}
};

RowComponent.prototype.isFrozen = function(){
	if(this._row.table.modExists("frozenRows", true)){
		var index = this._row.table.modules.frozenRows.rows.indexOf(this._row);
		return index > -1;
	}

	return false;
};

RowComponent.prototype.treeCollapse = function(){
	if(this._row.table.modExists("dataTree", true)){
		this._row.table.modules.dataTree.collapseRow(this._row);
	}
};

RowComponent.prototype.treeExpand = function(){
	if(this._row.table.modExists("dataTree", true)){
		this._row.table.modules.dataTree.expandRow(this._row);
	}
};

RowComponent.prototype.treeToggle = function(){
	if(this._row.table.modExists("dataTree", true)){
		this._row.table.modules.dataTree.toggleRow(this._row);
	}
};

RowComponent.prototype.getTreeParent = function(){
	if(this._row.table.modExists("dataTree", true)){
		return this._row.table.modules.dataTree.getTreeParent(this._row);
	}

	return false;
};

RowComponent.prototype.getTreeChildren = function(){
	if(this._row.table.modExists("dataTree", true)){
		return this._row.table.modules.dataTree.getTreeChildren(this._row, true);
	}

	return false;
};

RowComponent.prototype.addTreeChild = function(data, pos, index){
	if(this._row.table.modExists("dataTree", true)){
		return this._row.table.modules.dataTree.addTreeChildRow(this._row, data, pos, index);
	}

	return false;
};

RowComponent.prototype.reformat = function(){
	return this._row.reinitialize();
};

RowComponent.prototype.getGroup = function(){
	return this._row.getGroup().getComponent();
};

RowComponent.prototype.getTable = function(){
	return this._row.table;
};

RowComponent.prototype.getNextRow = function(){
	var row = this._row.nextRow();
	return row ? row.getComponent() : row;
};

RowComponent.prototype.getPrevRow = function(){
	var row = this._row.prevRow();
	return row ? row.getComponent() : row;
};


var Row = function(data, parent, type = "row"){
	this.table = parent.table;
	this.parent = parent;
	this.data = {};
	this.type = type; //type of element
	this.element = false;
	this.modules = {}; //hold module variables;
	this.cells = [];
	this.height = 0; //hold element height
	this.heightStyled = ""; //hold element height prestyled to improve render efficiency
	this.manualHeight = false; //user has manually set row height
	this.outerHeight = 0; //holde lements outer height
	this.initialized = false; //element has been rendered
	this.heightInitialized = false; //element has resized cells to fit

	this.component = null;

	this.created = false;

	this.setData(data);
};


Row.prototype.create = function(){
	if(!this.created){
		this.created = true;
		this.generateElement();
	}
};

Row.prototype.createElement = function (){
	var el = document.createElement("div");

	el.classList.add("tabulator-row");
	el.setAttribute("role", "row");

	this.element = el;
};

Row.prototype.getElement = function(){
	this.create();
	return this.element;
};

Row.prototype.detachElement = function(){
	if (this.element && this.element.parentNode){
		this.element.parentNode.removeChild(this.element);
	}
};

Row.prototype.generateElement = function(){
	var self = this,
	dblTap,	tapHold, tap;

	this.createElement();

	//set row selection characteristics
	if(self.table.options.selectable !== false && self.table.modExists("selectRow")){
		self.table.modules.selectRow.initializeRow(this);
	}

	//setup movable rows
	if(self.table.options.movableRows !== false && self.table.modExists("moveRow")){
		self.table.modules.moveRow.initializeRow(this);
	}

	//setup data tree
	if(self.table.options.dataTree !== false && self.table.modExists("dataTree")){
		self.table.modules.dataTree.initializeRow(this);
	}

	//setup column colapse container
	if(self.table.options.responsiveLayout === "collapse" && self.table.modExists("responsiveLayout")){
		self.table.modules.responsiveLayout.initializeRow(this);
	}

	//set column menu
	if((self.table.options.rowContextMenu || self.table.options.rowClickMenu) && this.table.modExists("menu")){
		self.table.modules.menu.initializeRow(this);
	}


	//handle row click events
	if (self.table.options.rowClick){
		self.element.addEventListener("click", function(e){
			self.table.options.rowClick(e, self.getComponent());
		});
	}

	if (self.table.options.rowDblClick){
		self.element.addEventListener("dblclick", function(e){
			self.table.options.rowDblClick(e, self.getComponent());
		});
	}

	if (self.table.options.rowContext){
		self.element.addEventListener("contextmenu", function(e){
			self.table.options.rowContext(e, self.getComponent());
		});
	}


	//handle mouse events
	if (self.table.options.rowMouseEnter){
		self.element.addEventListener("mouseenter", function(e){
			self.table.options.rowMouseEnter(e, self.getComponent());
		});
	}

	if (self.table.options.rowMouseLeave){
		self.element.addEventListener("mouseleave", function(e){
			self.table.options.rowMouseLeave(e, self.getComponent());
		});
	}

	if (self.table.options.rowMouseOver){
		self.element.addEventListener("mouseover", function(e){
			self.table.options.rowMouseOver(e, self.getComponent());
		});
	}

	if (self.table.options.rowMouseOut){
		self.element.addEventListener("mouseout", function(e){
			self.table.options.rowMouseOut(e, self.getComponent());
		});
	}

	if (self.table.options.rowMouseMove){
		self.element.addEventListener("mousemove", function(e){
			self.table.options.rowMouseMove(e, self.getComponent());
		});
	}


	if (self.table.options.rowTap){

		tap = false;

		self.element.addEventListener("touchstart", function(e){
			tap = true;
		}, {passive: true});

		self.element.addEventListener("touchend", function(e){
			if(tap){
				self.table.options.rowTap(e, self.getComponent());
			}

			tap = false;
		});
	}

	if (self.table.options.rowDblTap){

		dblTap = null;

		self.element.addEventListener("touchend", function(e){

			if(dblTap){
				clearTimeout(dblTap);
				dblTap = null;

				self.table.options.rowDblTap(e, self.getComponent());
			}else{

				dblTap = setTimeout(function(){
					clearTimeout(dblTap);
					dblTap = null;
				}, 300);
			}

		});
	}


	if (self.table.options.rowTapHold){

		tapHold = null;

		self.element.addEventListener("touchstart", function(e){
			clearTimeout(tapHold);

			tapHold = setTimeout(function(){
				clearTimeout(tapHold);
				tapHold = null;
				tap = false;
				self.table.options.rowTapHold(e, self.getComponent());
			}, 1000);

		}, {passive: true});

		self.element.addEventListener("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}
};

Row.prototype.generateCells = function(){
	this.cells = this.table.columnManager.generateCells(this);
};

//functions to setup on first render
Row.prototype.initialize = function(force){
	this.create();

	if(!this.initialized || force){

		this.deleteCells();

		while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

		//handle frozen cells
		if(this.table.modExists("frozenColumns")){
			this.table.modules.frozenColumns.layoutRow(this);
		}

		this.generateCells();

		if(this.table.options.virtualDomHoz && this.table.vdomHoz.initialized){
			this.table.vdomHoz.initializeRow(this);
		}else{
			this.cells.forEach((cell) => {
				this.element.appendChild(cell.getElement());
				cell.cellRendered();
			});
		}

		if(force){
			this.normalizeHeight();
		}

		//setup movable rows
		if(this.table.options.dataTree && this.table.modExists("dataTree")){
			this.table.modules.dataTree.layoutRow(this);
		}

		//setup column colapse container
		if(this.table.options.responsiveLayout === "collapse" && this.table.modExists("responsiveLayout")){
			this.table.modules.responsiveLayout.layoutRow(this);
		}

		if(this.table.options.rowFormatter){
			this.table.options.rowFormatter(this.getComponent());
		}

		//set resizable handles
		if(this.table.options.resizableRows && this.table.modExists("resizeRows")){
			this.table.modules.resizeRows.initializeRow(this);
		}

		this.initialized = true;
	}else{
		if(this.table.options.virtualDomHoz){
			this.table.vdomHoz.reinitializeRow(this);
		}
	}
};

Row.prototype.reinitializeHeight = function(){
	this.heightInitialized = false;

	if(this.element && this.element.offsetParent !== null){
		this.normalizeHeight(true);
	}
};


Row.prototype.reinitialize = function(children){
	this.initialized = false;
	this.heightInitialized = false;

	if(!this.manualHeight){
		this.height = 0;
		this.heightStyled = "";
	}

	if(this.element && this.element.offsetParent !== null){
		this.initialize(true);
	}

	if(this.table.options.dataTree && this.table.modExists("dataTree", true)){
		this.table.modules.dataTree.getTreeChildren(this, false, true).forEach(function(child){
			child.reinitialize(true);
		});
	}
};

//get heights when doing bulk row style calcs in virtual DOM
Row.prototype.calcHeight = function(force){

	var maxHeight = 0,
	minHeight = this.table.options.resizableRows ? this.element.clientHeight : 0;

	this.cells.forEach(function(cell){
		var height = cell.getHeight();
		if(height > maxHeight){
			maxHeight = height;
		}
	});

	if(force){
		this.height = Math.max(maxHeight, minHeight);
	}else{
		this.height = this.manualHeight ? this.height : Math.max(maxHeight, minHeight);
	}

	this.heightStyled = this.height ? this.height + "px" : "";
	this.outerHeight = this.element.offsetHeight;
};

//set of cells
Row.prototype.setCellHeight = function(){
	this.cells.forEach(function(cell){
		cell.setHeight();
	});

	this.heightInitialized = true;
};

Row.prototype.clearCellHeight = function(){
	this.cells.forEach(function(cell){
		cell.clearHeight();
	});
};

//normalize the height of elements in the row
Row.prototype.normalizeHeight = function(force){

	if(force){
		this.clearCellHeight();
	}

	this.calcHeight(force);

	this.setCellHeight();
};

// Row.prototype.setHeight = function(height){
// 	this.height = height;

// 	this.setCellHeight();
// };

//set height of rows
Row.prototype.setHeight = function(height, force){
	if(this.height != height || force){

		this.manualHeight = true;

		this.height = height;
		this.heightStyled = height ? height + "px" : "";

		this.setCellHeight();

		// this.outerHeight = this.element.outerHeight();
		this.outerHeight = this.element.offsetHeight;
	}
};

//return rows outer height
Row.prototype.getHeight = function(){
	return this.outerHeight;
};

//return rows outer Width
Row.prototype.getWidth = function(){
	return this.element.offsetWidth;
};


//////////////// Cell Management /////////////////

Row.prototype.deleteCell = function(cell){
	var index = this.cells.indexOf(cell);

	if(index > -1){
		this.cells.splice(index, 1);
	}
};

//////////////// Data Management /////////////////

Row.prototype.setData = function(data){
	if(this.table.modExists("mutator")){
		data = this.table.modules.mutator.transformRow(data, "data");
	}

	this.data = data;

	if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
		this.table.modules.reactiveData.watchRow(this);
	}
};

//update the rows data
Row.prototype.updateData = function(updatedData){
	var visible = this.element && Tabulator.prototype.helpers.elVisible(this.element),
	tempData = {},
	newRowData;

	return new Promise((resolve, reject) => {

		if(typeof updatedData === "string"){
			updatedData = JSON.parse(updatedData);
		}

		if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
			this.table.modules.reactiveData.block();
		}

		//mutate incomming data if needed
		if(this.table.modExists("mutator")){

			tempData = Object.assign(tempData, this.data);
			tempData = Object.assign(tempData, updatedData);

			newRowData = this.table.modules.mutator.transformRow(tempData, "data", updatedData);
		}else{
			newRowData = updatedData;
		}

		//set data
		for (var attrname in newRowData) {
			this.data[attrname] = newRowData[attrname];
		}

		if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
			this.table.modules.reactiveData.unblock();
		}

		//update affected cells only
		for (var attrname in updatedData) {

			let columns = this.table.columnManager.getColumnsByFieldRoot(attrname);

			columns.forEach((column) => {
				let cell = this.getCell(column.getField());

				if(cell){
					let value = column.getFieldValue(newRowData);
					if(cell.getValue() != value){
						cell.setValueProcessData(value);

						if(visible){
							cell.cellRendered();
						}
					}
				}
			});
		}

		if(this.table.options.groupUpdateOnCellEdit && this.table.options.groupBy && this.table.modExists("groupRows")) {
			this.table.modules.groupRows.reassignRowToGroup(this.row);
		}

		//Partial reinitialization if visible
		if(visible){
			this.normalizeHeight(true);

			if(this.table.options.rowFormatter){
				this.table.options.rowFormatter(this.getComponent());
			}
		}else{
			this.initialized = false;
			this.height = 0;
			this.heightStyled = "";
		}

		if(this.table.options.dataTree !== false && this.table.modExists("dataTree") && this.table.modules.dataTree.redrawNeeded(updatedData)){
			this.table.modules.dataTree.initializeRow(this);

			if(visible){
				this.table.modules.dataTree.layoutRow(this);
				this.table.rowManager.refreshActiveData("tree", false, true);
			}
		}


		//this.reinitialize();

		this.table.options.rowUpdated.call(this.table, this.getComponent());

		if(this.table.options.dataChanged){
			this.table.options.dataChanged.call(this.table, this.table.rowManager.getData());
		}

		resolve();
	});
};

Row.prototype.getData = function(transform){
	if(transform){
		if(this.table.modExists("accessor")){
			return this.table.modules.accessor.transformRow(this, transform);
		}
	}

	return this.data;
};

Row.prototype.getCell = function(column){
	var match = false;

	column = this.table.columnManager.findColumn(column);

	match = this.cells.find(function(cell){
		return cell.column === column;
	});

	return match;
};

Row.prototype.getCellIndex = function(findCell){
	return this.cells.findIndex(function(cell){
		return cell === findCell;
	});
};


Row.prototype.findNextEditableCell = function(index){
	var nextCell = false;

	if(index < this.cells.length-1){
		for(var i = index+1; i < this.cells.length; i++){
			let cell = this.cells[i];

			if(cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())){
				let allowEdit = true;

				if(typeof cell.column.modules.edit.check == "function"){
					allowEdit = cell.column.modules.edit.check(cell.getComponent());
				}

				if(allowEdit){
					nextCell = cell;
					break;
				}
			}
		}
	}

	return nextCell;
};

Row.prototype.findPrevEditableCell = function(index){
	var prevCell = false;

	if(index > 0){
		for(var i = index-1; i >= 0; i--){
			let cell = this.cells[i],
			allowEdit = true;

			if(cell.column.modules.edit && Tabulator.prototype.helpers.elVisible(cell.getElement())){
				if(typeof cell.column.modules.edit.check == "function"){
					allowEdit = cell.column.modules.edit.check(cell.getComponent());
				}

				if(allowEdit){
					prevCell = cell;
					break;
				}
			}
		}
	}

	return prevCell;
};

Row.prototype.getCells = function(){
	return this.cells;
};

Row.prototype.nextRow = function(){
	var row = this.table.rowManager.nextDisplayRow(this, true);
	return row || false;
};

Row.prototype.prevRow = function(){
	var row = this.table.rowManager.prevDisplayRow(this, true);
	return row || false;
};

Row.prototype.moveToRow = function(to, before){
	var toRow = this.table.rowManager.findRow(to);

	if(toRow){
		this.table.rowManager.moveRowActual(this, toRow, !before);
		this.table.rowManager.refreshActiveData("display", false, true);
	}else{
		console.warn("Move Error - No matching row found:", to);
	}
};

Row.prototype.validate = function(){
	var invalid = [];

	this.cells.forEach(function(cell){
		if(!cell.validate()){
			invalid.push(cell.getComponent());
		}
	});

	return invalid.length ? invalid : true;
};

///////////////////// Actions  /////////////////////

Row.prototype.delete = function(){
	return new Promise((resolve, reject) => {
		var index, rows;

		if(this.table.options.history && this.table.modExists("history")){

			if(this.table.options.groupBy && this.table.modExists("groupRows")){
				rows = this.getGroup().rows
				index = rows.indexOf(this);

				if(index){
					index = rows[index-1];
				}
			}else{
				index = this.table.rowManager.getRowIndex(this);

				if(index){
					index = this.table.rowManager.rows[index-1];
				}
			}

			this.table.modules.history.action("rowDelete", this, {data:this.getData(), pos:!index, index:index});
		}

		this.deleteActual();

		resolve();
	});
};


Row.prototype.deleteActual = function(blockRedraw){
	var index = this.table.rowManager.getRowIndex(this);

	this.detatchModules();

	// if(this.table.options.dataTree && this.table.modExists("dataTree")){
	// 	this.table.modules.dataTree.collapseRow(this, true);
	// }

	//remove any reactive data watchers from row object
	if(this.table.options.reactiveData && this.table.modExists("reactiveData", true)){
		// this.table.modules.reactiveData.unwatchRow(this);
	}

	//remove from group
	if(this.modules.group){
		this.modules.group.removeRow(this);
	}

	this.table.rowManager.deleteRow(this, blockRedraw);

	this.deleteCells();

	this.initialized = false;
	this.heightInitialized = false;
	this.element = false;

	if(this.table.options.dataTree && this.table.modExists("dataTree", true)){
		this.table.modules.dataTree.rowDelete(this);
	}

	//recalc column calculations if present
	if(this.table.modExists("columnCalcs")){
		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			this.table.modules.columnCalcs.recalcRowGroup(this);
		}else{
			this.table.modules.columnCalcs.recalc(this.table.rowManager.activeRows);
		}
	}
};

Row.prototype.detatchModules = function(){
	//deselect row if it is selected
	if(this.table.modExists("selectRow")){
		this.table.modules.selectRow._deselectRow(this, true);
	}

	//cancel edit if row is currently being edited
	if(this.table.modExists("edit")){
		if(this.table.modules.edit.currentCell.row === this){
			this.table.modules.edit.cancelEdit();
		}
	}

	if(this.table.modExists("frozenRows")){
		this.table.modules.frozenRows.detachRow(this);
	}
};

Row.prototype.deleteCells = function(){
	var cellCount = this.cells.length;

	for(let i = 0; i < cellCount; i++){
		this.cells[0].delete();
	}
};

Row.prototype.wipe = function(){
	this.detatchModules();
	this.deleteCells();

	if(this.element){
		while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

		if(this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
	}

	this.element = false;
	this.modules = {};
};


Row.prototype.getGroup = function(){
	return this.modules.group || false;
};


//////////////// Object Generation /////////////////
Row.prototype.getComponent = function(){
	if(!this.component){
		this.component = new RowComponent(this);
	}

	return this.component;
};
