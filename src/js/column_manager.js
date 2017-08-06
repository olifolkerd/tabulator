var ColumnManager = function(table){
	this.table = table; //hold parent table
	this.headersElement = $("<div class='tabulator-headers'></div>");
	this.element = $("<div class='tabulator-header'></div>"); //containing element
	this.rowManager = null; //hold row manager object
	this.columns = []; // column definition object
	this.columnsByIndex = []; //columns by index
	this.columnsByField = []; //columns by field
	this.scrollLeft = 0;

	this.element.prepend(this.headersElement);
};


////////////// Setup Functions /////////////////

//link to row manager
ColumnManager.prototype.setRowManager = function(manager){
	this.rowManager = manager;
};

//return containing element
ColumnManager.prototype.getElement = function(){
	return this.element;
};

//return header containing element
ColumnManager.prototype.getHeadersElement = function(){
	return this.headersElement;
};

//scroll horizontally to match table body
ColumnManager.prototype.scrollHorizontal = function(left){
	var hozAdjust = 0,
	scrollWidth = this.element[0].scrollWidth - this.table.element.innerWidth();

	this.element.scrollLeft(left);

	//adjust for vertical scrollbar moving table when present
	if(left > scrollWidth){
		hozAdjust = left - scrollWidth
		this.element.css("margin-left", -(hozAdjust));
	}else{
		this.element.css("margin-left", 0);
	}

	//keep frozen columns fixed in position
	//this._calcFrozenColumnsPos(hozAdjust + 3);

	this.scrollLeft = left;

	if(this.table.extExists("frozenColumns")){
		this.table.extensions.frozenColumns.layout();
	}
};


///////////// Column Setup Functions /////////////

ColumnManager.prototype.setColumns = function(cols, row){
	var self = this;

	self.headersElement.empty();

	self.columns = [];
	self.columnsByIndex = [];
	self.columnsByField = [];


	//reset frozen columns
	if(self.table.extExists("frozenColumns")){
		self.table.extensions.frozenColumns.reset();
	}

	cols.forEach(function(def, i){
		self._addColumn(def);
	});

	self._reIndexColumns();

	if(self.table.options.responsiveLayout && self.table.extExists("responsiveLayout", true)){
		self.table.extensions.responsiveLayout.initialize();
	}

	self.redraw(true);
};

ColumnManager.prototype._addColumn = function(definition, before, nextToColumn){
	var column = new Column(definition, this);
	var index = nextToColumn ? this.findColumnIndex(nextToColumn) : nextToColumn;

	if(nextToColumn && index > -1){

		let parentIndex = this.columns.indexOf(nextToColumn.getTopColumn());

		if(before){
			this.columns.splice(parentIndex, 0, column);
			nextToColumn.getElement().before(column.getElement());
		}else{
			this.columns.splice(parentIndex + 1, 0, column);
			nextToColumn.getElement().after(column.getElement());
		}

	}else{
		if(before){
			this.columns.unshift(column);
			this.headersElement.prepend(column.getElement());
		}else{
			this.columns.push(column);
			this.headersElement.append(column.getElement());
		}
	}

	return column;
};

ColumnManager.prototype.registerColumnField = function(col){
	if(col.definition.field){
		this.columnsByField[col.definition.field] = col;
	}
};

ColumnManager.prototype.registerColumnPosition = function(col){
	this.columnsByIndex.push(col);
};

ColumnManager.prototype._reIndexColumns = function(){
	this.columnsByIndex = [];

	this.columns.forEach(function(column){
		column.reRegisterPosition();
	});
};

//ensure column headers take up the correct amount of space in column groups
ColumnManager.prototype._verticalAlignHeaders = function(){
	var self = this;

	self.columns.forEach(function(column){
		column.clearVerticalAlign();
	});

	self.columns.forEach(function(column){
		column.verticalAlign(self.table.options.columnVertAlign);
	});

	self.rowManager.adjustTableSize();
};

//////////////// Column Details /////////////////

ColumnManager.prototype.findColumn = function(subject){
	var self = this;

	if(typeof subject == "object"){

		if(subject instanceof Column){
			//subject is column element
			return subject;
		}else if(subject instanceof jQuery){
			//subject is a jquery element of the column header
			let match = self.columns.find(function(column){
				return column.element === subject;
			});

			return match || false;
		}else{
			//subject is public column object
			return subject._getSelf() || false;
		}

	}else{
		//subject should be treated as the field name of the column
		return this.columnsByField[subject] || false;
	}

	//catch all for any other type of input

	return false;
};

ColumnManager.prototype.getColumnByField = function(field){
	return this.columnsByField[field];
};

ColumnManager.prototype.getColumnByIndex = function(index){
	return this.columnsByIndex[index];
};

ColumnManager.prototype.getColumns = function(){
	return this.columns;
};

ColumnManager.prototype.findColumnIndex = function(column){
	return this.columnsByIndex.findIndex(function(col){
		return column === col;
	});
};

//return all columns that are not groups
ColumnManager.prototype.getRealColumns = function(){
	return this.columnsByIndex;
};

//travers across columns and call action
ColumnManager.prototype.traverse = function(callback){
	var self = this;

	self.columnsByIndex.forEach(function(column,i){
		callback(column, i);
	});
};

//get defintions of actual columns
ColumnManager.prototype.getDefinitions = function(active){
	var self = this,
	output = [];

	self.columnsByIndex.forEach(function(column){
		if(!active || (active && column.visible)){
			output.push(column.getDefinition());
		}
	});

	return output;
};

//get full nested definition tree
ColumnManager.prototype.getDefinitionTree = function(){
	var self = this,
	output = [];

	self.columns.forEach(function(column){
		output.push(column.getDefinition(true));
	});

	return output;
};

ColumnManager.prototype.getComponents = function(){
	var self = this,
	output = [];

	self.columnsByIndex.forEach(function(column){
		output.push(column.getComponent());
	});

	return output;
};

ColumnManager.prototype.getWidth = function(){
	var width = 0;

	this.columnsByIndex.forEach(function(column){
		if(column.visible){
			width += column.getWidth();
		}
	});

	return width;
};

ColumnManager.prototype.moveColumn = function(from, to, after){

	this._moveColumnInArray(this.columns, from, to, after);
	this._moveColumnInArray(this.columnsByIndex, from, to, after, true);

	this.table.options.columnMoved(from.getComponent());

	if(this.table.options.persistentLayout && this.table.extExists("persistentLayout", true)){
		this.table.extensions.persistentLayout.save();
	}
};

ColumnManager.prototype._moveColumnInArray = function(columns, from, to, after, updateRows){
	var	fromIndex = columns.indexOf(from),
	toIndex;

	if (fromIndex > -1) {

		columns.splice(fromIndex, 1);

		toIndex = columns.indexOf(to);

		if (toIndex > -1) {

			if(after){
				toIndex = toIndex+1;
			}

		}else{
			toIndex = fromIndex;
		}

		columns.splice(toIndex, 0, from);

		if(updateRows){

			this.table.rowManager.rows.forEach(function(row){
				if(row.cells.length){
					var cell = row.cells.splice(fromIndex, 1)[0];
					row.cells.splice(toIndex, 0, cell);
				}
			});
		}
	}
};

//////////////// Cell Management /////////////////

ColumnManager.prototype.generateCells = function(row){
	var self = this;

	var cells = [];

	self.columnsByIndex.forEach(function(column){
		cells.push(column.generateCell(row));
	});

	return cells;
};

//////////////// Column Management /////////////////

//resize columns to fit data in cells
ColumnManager.prototype.fitToData = function(){
	var self = this;

	self.columnsByIndex.forEach(function(column){
		column.reinitializeWidth();
	});

	if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
		this.table.extensions.responsiveLayout.update();
	}
};

//resize columns to fill the table element
ColumnManager.prototype.fitToTable = function(){
	var self = this;

	var totalWidth = self.table.element.innerWidth(); //table element width
	var fixedWidth = 0; //total width of columns with a defined width
	var flexWidth = 0; //total width available to flexible columns
	var flexColWidth = 0; //desired width of flexible columns
	var flexColumns = []; //array of flexible width columns
	var gapFill=0; //number of pixels to be added to final column to close and half pixel gaps

	if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
		this.table.extensions.responsiveLayout.update();
	}

	//adjust for vertical scrollbar if present
	if(self.rowManager.element[0].scrollHeight > self.rowManager.element.innerHeight()){
		totalWidth -= self.rowManager.element[0].offsetWidth - self.rowManager.element[0].clientWidth;
	}

	self.columnsByIndex.forEach(function(column){
		var width, minWidth, colWidth;

		if(column.visible){

			width = column.definition.width;

			if(width){
				minWidth =  parseInt(column.minWidth);

				if(typeof(width) == "string"){
					if(width.indexOf("%") > -1){
						colWidth = (totalWidth / 100) * parseInt(width) ;
					}else{
						colWidth = parseInt(width);
					}
				}else{
					colWidth = width;
				}

				fixedWidth += colWidth > minWidth ? colWidth : minWidth;

			}else{
				flexColumns.push(column);
			}
		}
	});

	//calculate available space
	flexWidth = totalWidth - fixedWidth;

	//calculate correct column size
	flexColWidth = Math.floor(flexWidth / flexColumns.length)

	//calculate any sub pixel space that needs to be filed by the last column
	gapFill = totalWidth - fixedWidth - (flexColWidth * flexColumns.length);
	gapFill = gapFill > 0 ? gapFill : 0;

	flexColumns.forEach(function(column, i){
		var width = flexColWidth >= column.minWidth ? flexColWidth : column.minWidth;

		if(i == flexColumns.length -1 && gapFill){
			width += gapFill;
		}

		column.setWidth(width);
	});

};

ColumnManager.prototype.getFlexBaseWidth = function(){
	var self = this,
	totalWidth = self.table.element.innerWidth(), //table element width
	fixedWidth = 0;

	//adjust for vertical scrollbar if present
	if(self.rowManager.element[0].scrollHeight > self.rowManager.element.innerHeight()){
		totalWidth -= self.rowManager.element[0].offsetWidth - self.rowManager.element[0].clientWidth;
	}

	this.columnsByIndex.forEach(function(column){
		var width, minWidth, colWidth;

		if(column.visible){

			width = column.definition.width || 0;

			minWidth = typeof column.minWidth == "undefined" ? self.table.options.columnMinWidth : parseInt(column.minWidth);

			if(typeof(width) == "string"){
				if(width.indexOf("%") > -1){
					colWidth = (totalWidth / 100) * parseInt(width) ;
				}else{
					colWidth = parseInt(width);
				}
			}else{
				colWidth = width;
			}

			fixedWidth += colWidth > minWidth ? colWidth : minWidth;

		}
	});

	return fixedWidth;
};

ColumnManager.prototype.addColumn = function(definition, before, nextToColumn){
	var column = this._addColumn(definition, before, nextToColumn);

	this._reIndexColumns();

	if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
		this.table.extensions.responsiveLayout.initialize();
	}

	if(this.table.extExists("columnCalcs")){
		this.table.extensions.columnCalcs.recalc(this.table.rowManager.displayRows);
	}

	this.redraw();

	if(!this.table.options.fitColumns){
		column.reinitializeWidth();
	}

	this._verticalAlignHeaders();

	this.table.rowManager.reinitialize();
};

//remove column from system
ColumnManager.prototype.deregisterColumn = function(column){
	var field = column.getField(),
	index;

	//remove from field list
	if(field){
		delete this.columnsByField[field];
	}

	//remove from index list
	index = this.columnsByIndex.indexOf(column);

	if(index > -1){
		this.columnsByIndex.splice(index, 1);
	}

	//remove from column list
	index = this.columns.indexOf(column);

	if(index > -1){
		this.columns.splice(index, 1);
	}

	if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
		this.table.extensions.responsiveLayout.initialize();
	}

	this.redraw();
};

//redraw columns
ColumnManager.prototype.redraw = function(force){
	if(force){
		if(this.element.is(":visible")){
			this._verticalAlignHeaders();
		}
		this.table.rowManager.resetScroll();
		this.table.rowManager.reinitialize();
	}

	if(this.table.options.fitColumns){
		this.fitToTable();
	}else{
		if(force){
			this.fitToData();
		}else{
			if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
				this.table.extensions.responsiveLayout.update();
			}
		}
	}

	if(this.table.extExists("frozenColumns")){
		this.table.extensions.frozenColumns.layout();
	}

	if(this.table.extExists("columnCalcs")){
		this.table.extensions.columnCalcs.recalc(this.table.rowManager.displayRows);
	}

	if(force){
		if(this.table.options.persistentLayout && this.table.extExists("persistentLayout", true)){
			this.table.extensions.persistentLayout.save();
		}

		if(this.table.extExists("columnCalcs")){
			this.table.extensions.columnCalcs.redraw();
		}
	}

	this.table.footerManager.redraw();



};