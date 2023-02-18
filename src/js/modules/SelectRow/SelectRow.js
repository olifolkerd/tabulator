import Module from '../../core/Module.js';

class SelectRow extends Module{
	
	constructor(table){
		super(table);
		
		this.selecting = false; //flag selecting in progress
		this.lastClickedRow = false; //last clicked row
		this.selectPrev = []; //hold previously selected element for drag drop selection
		this.selectedRows = []; //hold selected rows
		this.headerCheckboxElement = null; // hold header select element
		
		this.registerTableOption("selectable", "highlight"); //highlight rows on hover
		this.registerTableOption("selectableRangeMode", "drag");  //highlight rows on hover
		this.registerTableOption("selectableRollingSelection", true); //roll selection once maximum number of selectable rows is reached
		this.registerTableOption("selectablePersistence", true); // maintain selection when table view is updated
		this.registerTableOption("selectableCheck", function(data, row){return true;}); //check whether row is selectable
		
		this.registerTableFunction("selectRow", this.selectRows.bind(this));
		this.registerTableFunction("deselectRow", this.deselectRows.bind(this));
		this.registerTableFunction("toggleSelectRow", this.toggleRow.bind(this));
		this.registerTableFunction("getSelectedRows", this.getSelectedRows.bind(this));
		this.registerTableFunction("getSelectedData", this.getSelectedData.bind(this));
		
		//register component functions
		this.registerComponentFunction("row", "select", this.selectRows.bind(this));
		this.registerComponentFunction("row", "deselect", this.deselectRows.bind(this));
		this.registerComponentFunction("row", "toggleSelect", this.toggleRow.bind(this));
		this.registerComponentFunction("row", "isSelected", this.isRowSelected.bind(this));
	}
	
	initialize(){
		if(this.table.options.selectable !== false){
			this.subscribe("row-init", this.initializeRow.bind(this));
			this.subscribe("row-deleting", this.rowDeleted.bind(this));
			this.subscribe("rows-wipe", this.clearSelectionData.bind(this));
			this.subscribe("rows-retrieve", this.rowRetrieve.bind(this));
			
			if(this.table.options.selectable && !this.table.options.selectablePersistence){
				this.subscribe("data-refreshing", this.deselectRows.bind(this));
			}
		}
	}
	
	rowRetrieve(type, prevValue){
		return type === "selected" ? this.selectedRows : prevValue;
	}
	
	rowDeleted(row){
		this._deselectRow(row, true);
	}
	
	clearSelectionData(silent){
		var prevSelected = this.selectedRows.length;

		this.selecting = false;
		this.lastClickedRow = false;
		this.selectPrev = [];
		this.selectedRows = [];
		
		if(prevSelected && silent !== true){
			this._rowSelectionChanged();
		}
	}
	
	initializeRow(row){
		var self = this,
		element = row.getElement();
		
		// trigger end of row selection
		var endSelect = function(){
			
			setTimeout(function(){
				self.selecting = false;
			}, 50);
			
			document.body.removeEventListener("mouseup", endSelect);
		};
		
		row.modules.select = {selected:false};
		
		//set row selection class
		if(self.checkRowSelectability(row)){
			element.classList.add("tabulator-selectable");
			element.classList.remove("tabulator-unselectable");
			
			if(self.table.options.selectable && self.table.options.selectable != "highlight"){
				if(self.table.options.selectableRangeMode === "click"){
					element.addEventListener("click", this.handleComplexRowClick.bind(this, row));
				}else{
					element.addEventListener("click", function(e){
						if(!self.table.modExists("edit") || !self.table.modules.edit.getCurrentCell()){
							self.table._clearSelection();
						}
						
						if(!self.selecting){
							self.toggleRow(row);
						}
					});
					
					element.addEventListener("mousedown", function(e){
						if(e.shiftKey){
							self.table._clearSelection();
							
							self.selecting = true;
							
							self.selectPrev = [];
							
							document.body.addEventListener("mouseup", endSelect);
							document.body.addEventListener("keyup", endSelect);
							
							self.toggleRow(row);
							
							return false;
						}
					});
					
					element.addEventListener("mouseenter", function(e){
						if(self.selecting){
							self.table._clearSelection();
							self.toggleRow(row);
							
							if(self.selectPrev[1] == row){
								self.toggleRow(self.selectPrev[0]);
							}
						}
					});
					
					element.addEventListener("mouseout", function(e){
						if(self.selecting){
							self.table._clearSelection();
							self.selectPrev.unshift(row);
						}
					});
				}
			}
			
		}else{
			element.classList.add("tabulator-unselectable");
			element.classList.remove("tabulator-selectable");
		}
	}
	
	handleComplexRowClick(row, e){
		if(e.shiftKey){
			this.table._clearSelection();
			this.lastClickedRow = this.lastClickedRow || row;
			
			var lastClickedRowIdx = this.table.rowManager.getDisplayRowIndex(this.lastClickedRow);
			var rowIdx = this.table.rowManager.getDisplayRowIndex(row);
			
			var fromRowIdx = lastClickedRowIdx <= rowIdx ? lastClickedRowIdx : rowIdx;
			var toRowIdx = lastClickedRowIdx >= rowIdx ? lastClickedRowIdx : rowIdx;
			
			var rows = this.table.rowManager.getDisplayRows().slice(0);
			var toggledRows = rows.splice(fromRowIdx, toRowIdx - fromRowIdx + 1);
			
			if(e.ctrlKey || e.metaKey){
				toggledRows.forEach((toggledRow)=>{
					if(toggledRow !== this.lastClickedRow){
						
						if(this.table.options.selectable !== true && !this.isRowSelected(row)){
							if(this.selectedRows.length < this.table.options.selectable){
								this.toggleRow(toggledRow);
							}
						}else{
							this.toggleRow(toggledRow);
						}
					}
				});
				this.lastClickedRow = row;
			}else{
				this.deselectRows(undefined, true);
				
				if(this.table.options.selectable !== true){
					if(toggledRows.length > this.table.options.selectable){
						toggledRows = toggledRows.slice(0, this.table.options.selectable);
					}
				}
				
				this.selectRows(toggledRows);
			}
			this.table._clearSelection();
		}
		else if(e.ctrlKey || e.metaKey){
			this.toggleRow(row);
			this.lastClickedRow = row;
		}else{
			this.deselectRows(undefined, true);
			this.selectRows(row);
			this.lastClickedRow = row;
		}
	}

	checkRowSelectability(row){
		if(row.type === "row"){
			return this.table.options.selectableCheck.call(this.table, row.getComponent());
		}

		return false;
	}
	
	//toggle row selection
	toggleRow(row){
		if(this.checkRowSelectability(row)){
			if(row.modules.select && row.modules.select.selected){
				this._deselectRow(row);
			}else{
				this._selectRow(row);
			}
		}
	}
	
	//select a number of rows
	selectRows(rows){
		var rowMatch;
		
		switch(typeof rows){
			case "undefined":
				this.table.rowManager.rows.forEach((row) => {
					this._selectRow(row, true, true);
				});
			
				this._rowSelectionChanged();
				break;
			
			case "string":
				rowMatch = this.table.rowManager.findRow(rows);
			
				if(rowMatch){
					this._selectRow(rowMatch, true, true);
					this._rowSelectionChanged();
				}else{
					rowMatch = this.table.rowManager.getRows(rows);
					
					rowMatch.forEach((row) => {
						this._selectRow(row, true, true);
					});

					if(rowMatch.length){
						this._rowSelectionChanged();
					}
				}
				break;
			
			default:
				if(Array.isArray(rows)){
					rows.forEach((row) => {
						this._selectRow(row, true, true);
					});
				
					this._rowSelectionChanged();
				}else{
					this._selectRow(rows, false, true);
				}
				break;
		}
	}
	
	//select an individual row
	_selectRow(rowInfo, silent, force){
		//handle max row count
		if(!isNaN(this.table.options.selectable) && this.table.options.selectable !== true && !force){
			if(this.selectedRows.length >= this.table.options.selectable){
				if(this.table.options.selectableRollingSelection){
					this._deselectRow(this.selectedRows[0]);
				}else{
					return false;
				}
			}
		}
		
		var row = this.table.rowManager.findRow(rowInfo);
		
		if(row){
			if(this.selectedRows.indexOf(row) == -1){
				row.getElement().classList.add("tabulator-selected");
				if(!row.modules.select){
					row.modules.select = {};
				}
				
				row.modules.select.selected = true;
				if(row.modules.select.checkboxEl){
					row.modules.select.checkboxEl.checked = true;
				}
				
				this.selectedRows.push(row);
				
				if(this.table.options.dataTreeSelectPropagate){
					this.childRowSelection(row, true);
				}
				
				this.dispatchExternal("rowSelected", row.getComponent());
				
				this._rowSelectionChanged(silent);
			}
		}else{
			if(!silent){
				console.warn("Selection Error - No such row found, ignoring selection:" + rowInfo);
			}
		}
	}
	
	isRowSelected(row){
		return this.selectedRows.indexOf(row) !== -1;
	}
	
	//deselect a number of rows
	deselectRows(rows, silent){
		var self = this,
		rowCount;
		
		if(typeof rows == "undefined"){
			
			rowCount = self.selectedRows.length;
			
			for(let i = 0; i < rowCount; i++){
				self._deselectRow(self.selectedRows[0], true);
			}
			
			if(rowCount){
				self._rowSelectionChanged(silent);
			}
			
		}else{
			if(Array.isArray(rows)){
				rows.forEach(function(row){
					self._deselectRow(row, true);
				});
				
				self._rowSelectionChanged(silent);
			}else{
				self._deselectRow(rows, silent);
			}
		}
	}
	
	//deselect an individual row
	_deselectRow(rowInfo, silent){
		var self = this,
		row = self.table.rowManager.findRow(rowInfo),
		index;
		
		if(row){
			index = self.selectedRows.findIndex(function(selectedRow){
				return selectedRow == row;
			});
			
			if(index > -1){
				
				row.getElement().classList.remove("tabulator-selected");
				if(!row.modules.select){
					row.modules.select = {};
				}
				
				row.modules.select.selected = false;
				if(row.modules.select.checkboxEl){
					row.modules.select.checkboxEl.checked = false;
				}
				self.selectedRows.splice(index, 1);
				
				if(this.table.options.dataTreeSelectPropagate){
					this.childRowSelection(row, false);
				}
				
				this.dispatchExternal("rowDeselected", row.getComponent());
				
				self._rowSelectionChanged(silent);
			}
		}else{
			if(!silent){
				console.warn("Deselection Error - No such row found, ignoring selection:" + rowInfo);
			}
		}
	}
	
	getSelectedData(){
		var data = [];
		
		this.selectedRows.forEach(function(row){
			data.push(row.getData());
		});
		
		return data;
	}
	
	getSelectedRows(){
		
		var rows = [];
		
		this.selectedRows.forEach(function(row){
			rows.push(row.getComponent());
		});
		
		return rows;
	}
	
	_rowSelectionChanged(silent){
		if(this.headerCheckboxElement){
			if(this.selectedRows.length === 0){
				this.headerCheckboxElement.checked = false;
				this.headerCheckboxElement.indeterminate = false;
			} else if(this.table.rowManager.rows.length === this.selectedRows.length){
				this.headerCheckboxElement.checked = true;
				this.headerCheckboxElement.indeterminate = false;
			} else {
				this.headerCheckboxElement.indeterminate = true;
				this.headerCheckboxElement.checked = false;
			}
		}
		
		if(!silent){
			this.dispatchExternal("rowSelectionChanged", this.getSelectedData(), this.getSelectedRows());
		}
	}
	
	registerRowSelectCheckbox (row, element) {
		if(!row._row.modules.select){
			row._row.modules.select = {};
		}
		
		row._row.modules.select.checkboxEl = element;
	}
	
	registerHeaderSelectCheckbox (element) {
		this.headerCheckboxElement = element;
	}
	
	childRowSelection(row, select){
		var children = this.table.modules.dataTree.getChildren(row, true);
		
		if(select){
			for(let child of children){
				this._selectRow(child, true);
			}
		}else{
			for(let child of children){
				this._deselectRow(child, true);
			}
		}
	}
}

SelectRow.moduleName = "selectRow";

export default SelectRow;