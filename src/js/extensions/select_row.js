var SelectRow = function(table){
	this.table = table; //hold Tabulator object
	this.selecting = false; //flag selecting in progress
	this.selectPrev = []; //hold previously selected element for drag drop selection
	this.selectedRows = []; //hold selected rows
};

SelectRow.prototype.clearSelectionData = function(silent){
	this.selecting = false;
	this.selectPrev = [];
	this.selectedRows = [];

	if(!silent){
		this._rowSelectionChanged();
	}
};

SelectRow.prototype.initializeRow = function(row){
	var self = this,
	element = row.getElement();

	// trigger end of row selection
	var endSelect = function(){

		setTimeout(function(){
			self.selecting = false;
		}, 50)

		$("body").off("mouseup", endSelect);
	}


	row.extensions.select = {selected:false};

	//set row selection class
	if(self.table.options.selectableCheck(row.getComponent())){
		element.addClass("tabulator-selectable").removeClass("tabulator-unselectable");

		if(self.table.options.selectable && self.table.options.selectable != "highlight"){
			element.on("click", function(e){
				if(!self.selecting){
					self.toggleRow(row);
				}
			});

			element.on("mousedown", function(e){
				if(e.shiftKey){
					self.selecting = true;

					self.selectPrev = [];

					$("body").on("mouseup", endSelect);
					$("body").on("keyup", endSelect);

					self.toggleRow(row);

					return false;
				}
			});

			element.on("mouseenter", function(e){
				if(self.selecting){
					self.toggleRow(row);

					if(self.selectPrev[1] == row){
						self.toggleRow(self.selectPrev[0]);
					}
				}
			});

			element.on("mouseout", function(e){
				if(self.selecting){
					self.selectPrev.unshift(row);
				}
			});
		}

	}else{
		row.getElement().addClass("tabulator-unselectable").removeClass("tabulator-selectable");
	}
};

//toggle row selection
SelectRow.prototype.toggleRow = function(row){
	if(this.table.options.selectableCheck(row.getComponent())){
		if(row.extensions.select.selected){
			this._deselectRow(row);
		}else{
			this._selectRow(row);
		}
	}
};

//select a number of rows
SelectRow.prototype.selectRows = function(rows){
	var self = this;

	switch(typeof rows){
		case "undefined":
		self.table.rowManager.rows.forEach(function(row){
			self._selectRow(row, false, true);
		});

		self._rowSelectionChanged();
		break;

		case "boolean":
		if(rows === true){
			self.table.rowManager.activeRows.forEach(function(row){
				self._selectRow(row, false, true);
			});

			self._rowSelectionChanged();
		}
		break;

		default:
		if(Array.isArray(rows)){
			rows.forEach(function(row){
				self._selectRow(row);
			});

			self._rowSelectionChanged();
		}else{
			self._selectRow(rows);
		}
		break;
	}
};

//select an individual row
SelectRow.prototype._selectRow = function(rowInfo, silent, force){
	var self = this,
	index;

	//handle max row count
	if(!isNaN(self.table.options.selectable) && self.table.options.selectable !== true && !force){
		if(self.selectedRows.length >= self.table.options.selectable){
			if(self.table.options.selectableRollingSelection){
				self._deselectRow(self.selectedRows[0]);
			}else{
				return false;
			}
		}
	}

	var row = self.table.rowManager.findRow(rowInfo);

	if(row){
		if(self.selectedRows.indexOf(row) == -1){
			var self = this;

			row.extensions.select.selected = true;
			row.getElement().addClass("tabulator-selected");

			self.selectedRows.push(row);

			if(!silent){
				self.table.options.rowSelected(row.getComponent());
				self._rowSelectionChanged();
			}
		}
	}else{
		if(!silent){
			console.warn("Selection Error - No such row found, ignoring selection:" + rowInfo);
		}
	}
};

//deselect a number of rows
SelectRow.prototype.deselectRows = function(rows){
	var self = this;

	if(typeof rows == "undefined"){

		let rowCount = self.selectedRows.length;

		for(let i = 0; i < rowCount; i++){
			self._deselectRow(self.selectedRows[0], true);
		}

		self._rowSelectionChanged();
	}else{
		if(Array.isArray(rows)){
			rows.forEach(function(row){
				self._deselectRow(row);
			});

			self._rowSelectionChanged();
		}else{
			self._deselectRow(rows);
		}
	}
};

//deselect an individual row
SelectRow.prototype._deselectRow = function(rowInfo, silent){
	var self = this,
	row = self.table.rowManager.findRow(rowInfo),
	index;



	if(row){
		index = self.selectedRows.findIndex(function(selectedRow){
			return selectedRow == row;
		});

		if(index > -1){

			row.extensions.select.selected = false;
			row.getElement().removeClass("tabulator-selected");
			self.selectedRows.splice(index, 1);

			if(!silent){
				self.table.options.rowDeselected(row.getComponent());
				self._rowSelectionChanged();
			}
		}
	}else{
		if(!silent){
			console.warn("Deselection Error - No such row found, ignoring selection:" + rowInfo);
		}
	}
};

SelectRow.prototype.getSelectedData = function(){
	var data = [];

	this.selectedRows.forEach(function(row){
		data.push(row.getData());
	});

	return data
};

SelectRow.prototype.getSelectedRows = function(){

	var rows = []

	this.selectedRows.forEach(function(row){
		rows.push(row.getComponent());
	})

	return rows;
};

SelectRow.prototype._rowSelectionChanged = function(){
	this.table.options.rowSelectionChanged(this.getSelectedData(), this.getSelectedRows());
};

Tabulator.registerExtension("selectRow", SelectRow);