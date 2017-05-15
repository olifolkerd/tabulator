
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

			row.cells.forEach(function(cell){
				cells.push(cell.getComponent());
			});

			return cells;
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
	this.element = $("<div class='tabulator-row' role='row'></div>");
	this.extensions = {}; //hold extension variables;
	this.cells = [];
	this.height = 0; //hold element height
	this.outerHeight = 0; //holde lements outer height
	this.initialized = false; //element has been rendered

	this.setData(data);
	this.generateElement();
};

Row.prototype.getElement = function(){
	return this.element;
};


Row.prototype.generateElement = function(){
	var self = this;

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
};


//normalize the height of elements in the row
Row.prototype.normalizeHeight = function(force){

	if(force){
		//zero cell heights
		this.cells.forEach(function(cell){
			cell.setHeight();
		});
	}

	this.setHeight(this.element.innerHeight(), force)
};

//functions to setup on first render
Row.prototype.initialize = function(force){
	var self = this;

	if(!self.initialized || force){

		self.element.empty();

		//handle frozen cells
		if(this.table.extExists("frozenColumns")){
			this.table.extensions.frozenColumns.layoutRow(this);
		}

		self.cells = this.parent.columnManager.generateCells(self);

		self.cells.forEach(function(cell){
			self.element.append(cell.getElement());
		});

		self.normalizeHeight();

		if(self.table.options.rowFormatter){
			self.table.options.rowFormatter(row.getComponent());
		}

		self.initialized = true;
	}
};

Row.prototype.reinitialize = function(){
	this.initialized = false;
	this.height = 0;

	if(this.element.is(":visible")){
		this.initialize(true);
	}
};

Row.prototype.setHeight = function(height, force){
	var self = this;

	if(self.height != height || force){

		self.height = height;

		self.cells.forEach(function(cell){
			cell.setHeight(height);
		});

		self.outerHeight = this.element.outerHeight();
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
	}else{
		data = data;
	}

	for (var attrname in data) {
		self.data[attrname] = data[attrname];
	}

	self.reinitialize();

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

///////////////////// Actions  /////////////////////

Row.prototype.delete = function(){
	this.table.rowManager.deleteRow(this);

	var cellCount = this.cells.length;

	for(let i = 0; i < cellCount; i++){
		this.cells[0].delete();
	}
};

//////////////// Object Generation /////////////////
Row.prototype.getComponent = function(){
	return new RowComponent(this);
};