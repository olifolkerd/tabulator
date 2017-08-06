
//public row object
var RowComponent = function (row){

	var obj = {

		getData:function(){
			return row.getData(true);
		},

		getElement:function(){
			return row.getElement();
		},

		getCells:function(){
			var cells = [];

			row.getCells().forEach(function(cell){
				cells.push(cell.getComponent());
			});

			return cells;
		},

		getCell:function(column){
			return row.getCell(column).getComponent();
		},

		getIndex:function(){
			return row.getData(true)[row.table.options.index];
		},

		delete:function(){
			row.delete();
		},

		scrollTo:function(){
			row.table.rowManager.scrollToRow(row);
		},

		update:function(data){
			row.updateData(data);
		},

		normalizeHeight:function(){
			row.normalizeHeight(true);
		},

		select:function(){
			row.table.extensions.selectRow.selectRows(row);
		},

		deselect:function(){
			row.table.extensions.selectRow.deselectRows(row);
		},

		toggleSelect:function(){
			row.table.extensions.selectRow.toggleRow(row);
		},

		_getSelf:function(){
			return row;
		},
	}

	return obj;
};


var Row = function(data, parent){
	this.table = parent.table;
	this.parent = parent;
	this.data = {};
	this.type = "row"; //type of element
	this.element = $("<div class='tabulator-row' role='row'></div>");
	this.extensions = {}; //hold extension variables;
	this.cells = [];
	this.height = 0; //hold element height
	this.outerHeight = 0; //holde lements outer height
	this.initialized = false; //element has been rendered
	this.heightInitialized = false; //element has resized cells to fit

	this.setData(data);
	this.generateElement();
};

Row.prototype.getElement = function(){
	return this.element;
};


Row.prototype.generateElement = function(){
	var self = this,
	dblTap,	tapHold, tap;

	//set row selection characteristics
	if(self.table.options.selectable !== false && self.table.extExists("selectRow")){
		self.table.extensions.selectRow.initializeRow(this);
	}

	//setup movable rows
	if(self.table.options.movableRows !== false && self.table.extExists("moveRow")){
		self.table.extensions.moveRow.initializeRow(this);
	}

	//handle row click events
	if (self.table.options.rowClick){
		self.element.on("click", function(e){
			self.table.options.rowClick(e, self.getComponent());
		})
	}

	if (self.table.options.rowDblClick){
		self.element.on("dblclick", function(e){
			self.table.options.rowDblClick(e, self.getComponent());
		})
	}

	if (self.table.options.rowContext){
		self.element.on("contextmenu", function(e){
			self.table.options.rowContext(e, self.getComponent());
		})
	}

	if (self.table.options.rowTap){

		tap = false;

		self.element.on("touchstart", function(e){
			tap = true;
		});

		self.element.on("touchend", function(e){
			if(tap){
				self.table.options.rowTap(e, self.getComponent());
			}

			tap = false;
		});
	}

	if (self.table.options.rowDblTap){

		dblTap = null;

		self.element.on("touchend", function(e){

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

		self.element.on("touchstart", function(e){
			clearTimeout(tapHold);

			tapHold = setTimeout(function(){
				clearTimeout(tapHold);
				tapHold = null;
				tap = false;
				self.table.options.rowTapHold(e, self.getComponent());
			}, 1000)

		});

		self.element.on("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}
};

Row.prototype.generateCells = function(){
	this.cells = this.table.columnManager.generateCells(this);
}

//functions to setup on first render
Row.prototype.initialize = function(force){
	var self = this;

	if(!self.initialized || force){

		self.deleteCells();

		self.element.empty();

		//handle frozen cells
		if(this.table.extExists("frozenColumns")){
			this.table.extensions.frozenColumns.layoutRow(this);
		}

		this.generateCells();

		self.cells.forEach(function(cell){
			self.element.append(cell.getElement());
		});

		if(force){
			self.normalizeHeight();
		}

		if(self.table.options.rowFormatter){
			self.table.options.rowFormatter(self.getComponent());
		}

		self.initialized = true;
	}
};

Row.prototype.reinitializeHeight = function(){
	this.heightInitialized = false;

	if(this.element[0].offsetParent !== null){
		this.normalizeHeight(true);
	}
};


Row.prototype.reinitialize = function(){
	this.initialized = false;
	this.heightInitialized = false;
	this.height = 0;

	if(this.element[0].offsetParent !== null){
		this.initialize(true);
	}
};

//get heights when doing bulk row style calcs in virtual DOM
Row.prototype.calcHeight = function(){
	this.height = this.element[0].clientHeight;
	this.outerHeight = this.element[0].offsetHeight;
};

//set of cells
Row.prototype.setCellHeight = function(){
	var height = this.height;

	this.cells.forEach(function(cell){
		cell.setHeight(height);
	});

	this.heightInitialized = true;
};

Row.prototype.clearCellHeight = function(){
	this.cells.forEach(function(cell){
		cell.clearHeight();
	});
}

//normalize the height of elements in the row
Row.prototype.normalizeHeight = function(force){

	if(force){
		this.clearCellHeight();
	}

	this.calcHeight();

	this.setCellHeight();
};

//set height of rows
Row.prototype.setHeight = function(height, force){
	if(this.height != height || force){

		this.height = height;

		this.setCellHeight();

		// this.outerHeight = this.element.outerHeight();
		this.outerHeight = this.element[0].offsetHeight;
	}
};

//return rows outer height
Row.prototype.getHeight = function(){
	return this.outerHeight;
};

//return rows outer Width
Row.prototype.getWidth = function(){
	return this.element.outerWidth();
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
	var self = this;

	if(self.table.extExists("mutator")){
		self.data = self.table.extensions.mutator.transformRow(data);
	}else{
		self.data = data;
	}
};

//update the rows data
Row.prototype.updateData = function(data){
	var self = this;

	//mutate incomming data if needed
	if(self.table.extExists("mutator")){
		data = self.table.extensions.mutator.transformRow(data);
	}

	//set data
	for (var attrname in data) {
		self.data[attrname] = data[attrname];
	}

	//update affected cells only
	for (var attrname in data) {
		let cell = this.getCell(attrname);

		if(cell){
			if(cell.getValue() != data[attrname]){
				cell.setValueProcessData(data[attrname]);
			}
		}
	}

	//Partial reinitialization if visible
	if(this.element.is(":visible")){
		self.normalizeHeight();

		if(self.table.options.rowFormatter){
			self.table.options.rowFormatter(self.getComponent());
		}
	}else{
		this.initialized = false;
		this.height = 0;
	}

	//self.reinitialize();

	self.table.options.rowUpdated(self.getComponent());
};

Row.prototype.getData = function(transform){
	var self = this;

	if(transform){
		if(self.table.extExists("accessor")){
			return self.table.extensions.accessor.transformRow(self.data);
		}
	}else{
		return this.data;
	}

};

Row.prototype.getCell = function(column){
	var match = false,
	column = this.table.columnManager.findColumn(column);

	match = this.cells.find(function(cell){
		return cell.column === column;
	});

	return match;
},

Row.prototype.getCellIndex = function(findCell){
	return this.cells.findIndex(function(cell){
		return cell === findCell;
	});
},


Row.prototype.findNextEditableCell = function(index){

	var nextCell = false;

	if(index < this.cells.length-1){
		for(var i = index+1; i < this.cells.length; i++){
			let cell = this.cells[i];

			if(cell.column.extensions.edit && cell.getElement().is(":visible")){
				let allowEdit = true;

				if(typeof cell.column.extensions.edit.check == "function"){
					allowEdit = cell.column.extensions.edit.check(cell.getComponent());
				}

				if(allowEdit){
					nextCell = cell;
					break;
				}
			}
		}
	}

	return nextCell;
},

Row.prototype.findPrevEditableCell = function(index){
	var prevCell = false;

	if(index > 0){
		for(var i = index-1; i >= 0; i--){
			let cell = this.cells[i],
			allowEdit = true;

			if(cell.column.extensions.edit && cell.getElement().is(":visible")){
				if(typeof cell.column.extensions.edit.check == "function"){
					allowEdit = cell.column.extensions.edit.check(cell.getComponent());
				}

				if(allowEdit){
					prevCell = cell;
					break;
				}
			}
		}
	}

	return prevCell;
},


Row.prototype.getCells = function(){
	return this.cells;
},

///////////////////// Actions  /////////////////////

Row.prototype.delete = function(){

	var index = this.table.rowManager.getRowIndex(this);

	this.deleteActual();

	if(this.table.options.history && this.table.extExists("history")){
		if(index){
			index = this.table.rowManager.rows[index-1];
		}

		this.table.extensions.history.action("rowDelete", this, {data:this.getData(), pos:!index, index:index});
	};
};


Row.prototype.deleteActual = function(){
	this.table.rowManager.deleteRow(this);

	this.deleteCells();
};


Row.prototype.deleteCells = function(){
	var cellCount = this.cells.length;

	for(let i = 0; i < cellCount; i++){
		this.cells[0].delete();
	}
};



//////////////// Object Generation /////////////////
Row.prototype.getComponent = function(){
	return new RowComponent(this);
};