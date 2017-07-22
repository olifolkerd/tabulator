var FrozenColumns = function(table){
	this.table = table; //hold Tabulator object
	this.leftColumns = [];
	this.rightColumns = [];
	this.leftMargin = 0;
	this.rightMargin = 0;
	this.initializationMode = "left";
	this.active = false;
};

//reset initial state
FrozenColumns.prototype.reset = function(){
	this.initializationMode = "left";
	this.leftColumns = [];
	this.rightColumns = [];
	this.active = false;
};

//initialize specific column
FrozenColumns.prototype.initializeColumn = function(column){
	var config = {margin:0, edge:false};

	if(column.definition.frozen){

		if(!column.parent.isGroup){


			if(!column.isGroup){
				config.position = this.initializationMode;

				if(this.initializationMode == "left"){
					this.leftColumns.push(column);
				}else{
					this.rightColumns.unshift(column);
				}

				this.active = true;

				column.extensions.frozen = config;
			}else{
				console.warn("Frozen Column Error - Column Groups cannot be frozen");
			}
		}else{
			console.warn("Frozen Column Error - Grouped columns cannot be frozen");
		}

	}else{
		this.initializationMode = "right";
	}
};

//layout columns appropropriatly
FrozenColumns.prototype.layout = function(){
	var self = this,
	tableHolder = this.table.rowManager.element,
	rightMargin = 0;

	if(self.active){

		//calculate row padding

		self.leftMargin = self._calcSpace(self.leftColumns, self.leftColumns.length);
		self.table.columnManager.headersElement.css("margin-left", self.leftMargin);

		self.rightMargin = self._calcSpace(self.rightColumns, self.rightColumns.length);
		self.table.columnManager.element.css("padding-right", self.rightMargin);

		self.table.rowManager.activeRows.forEach(function(row){
			self.layoutRow(row);
		});

		if(self.table.extExists("columnCalcs")){
			if(self.table.extensions.columnCalcs.topInitialized && self.table.extensions.columnCalcs.topRow){
				self.layoutRow(self.table.extensions.columnCalcs.topRow);
			}
			if(self.table.extensions.columnCalcs.botInitialized && self.table.extensions.columnCalcs.botRow){
				self.layoutRow(self.table.extensions.columnCalcs.botRow);
			}
		}


		//calculate left columns
		self.leftColumns.forEach(function(column, i){
			column.extensions.frozen.margin = self._calcSpace(self.leftColumns, i) + self.table.columnManager.scrollLeft;

			if(i == self.leftColumns.length - 1){
				column.extensions.frozen.edge = true;
			}else{
				column.extensions.frozen.edge = false;
			}

			self.layoutColumn(column);
		});

		//calculate right frozen columns
		rightMargin = self.table.rowManager.element.innerWidth() + self.table.columnManager.scrollLeft;

		if(tableHolder[0].scrollHeight > tableHolder.innerHeight()){
			rightMargin -= tableHolder[0].offsetWidth - tableHolder[0].clientWidth;
		}

		self.rightColumns.forEach(function(column, i){
			column.extensions.frozen.margin = rightMargin - self._calcSpace(self.rightColumns, i + 1);

			if(i == self.rightColumns.length - 1){
				column.extensions.frozen.edge = true;
			}else{
				column.extensions.frozen.edge = false;
			}

			self.layoutColumn(column);
		});
	}
};

FrozenColumns.prototype.layoutColumn = function(column){
	var self = this;

	self.layoutElement(column.element, column);

	column.cells.forEach(function(cell){
		self.layoutElement(cell.element, column);
	});
};

FrozenColumns.prototype.layoutRow = function(row){
	row.getElement().css({
		"padding-left": this.leftMargin,
		"padding-right": this.rightMargin,
	});
};

FrozenColumns.prototype.layoutElement = function(element, column){

	if(column.extensions.frozen){
		var css = {
			position:"absolute",
			left:column.extensions.frozen.margin
		}

		element.css(css);
		element.addClass("tabulator-frozen");

		if(column.extensions.frozen.edge){
			element.addClass("tabulator-frozen-" + column.extensions.frozen.position);
		}
	}
};

FrozenColumns.prototype._calcSpace = function(columns, index){
	var width = 0;

	for (let i = 0; i < index; i++){
		if(columns[i].visible){
			width += columns[i].getWidth();
		}
	}

	return width;
};

Tabulator.registerExtension("frozenColumns", FrozenColumns);