import Module from '../../core/Module.js';
import extensions from './extensions/extensions.js';

export default class SelectRow extends Module{

	static moduleName = "selectRow";
	static moduleExtensions = extensions;
	
	constructor(table){
		super(table);
		
		this.selecting = false; //flag selecting in progress
		this.lastClickedRow = false; //last clicked row
		this.selectPrev = []; //hold previously selected element for drag drop selection
		this.selectedRows = []; //hold selected rows
		this.headerCheckboxElement = null; // hold header select element
		
		this.registerTableOption("selectableRows", "highlight"); //highlight rows on hover
		this.registerTableOption("selectableRowsRangeMode", "drag");  //highlight rows on hover
		this.registerTableOption("selectableRowsRollingSelection", true); //roll selection once maximum number of selectable rows is reached
		this.registerTableOption("selectableRowsPersistence", true); // maintain selection when table view is updated
		this.registerTableOption("selectableRowsCheck", function(data, row){return true;}); //check whether row is selectable
		
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

		this.deprecatedOptionsCheck();

		if(this.table.options.selectableRows === "highlight" && this.table.options.selectableRange){
			this.table.options.selectableRows = false;
		}

		if(this.table.options.selectableRows !== false){
			this.subscribe("row-init", this.initializeRow.bind(this));
			this.subscribe("row-deleting", this.rowDeleted.bind(this));
			this.subscribe("rows-wipe", this.clearSelectionData.bind(this));
			this.subscribe("rows-retrieve", this.rowRetrieve.bind(this));
			
			if(this.table.options.selectableRows && !this.table.options.selectableRowsPersistence){
				this.subscribe("data-refreshing", this.deselectRows.bind(this));
			}
		}
	}

	deprecatedOptionsCheck(){
		// this.deprecationCheck("selectable", "selectableRows", true);
		// this.deprecationCheck("selectableRollingSelection", "selectableRowsRollingSelection", true);
		// this.deprecationCheck("selectableRangeMode", "selectableRowsRangeMode", true);
		// this.deprecationCheck("selectablePersistence", "selectableRowsPersistence", true);
		// this.deprecationCheck("selectableCheck", "selectableRowsCheck", true);
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
		selectable = self.checkRowSelectability(row),
		element = row.getElement();
		
		// trigger end of row selection
		var endSelect = function(){
			
			setTimeout(function(){
				self.selecting = false;
			}, 50);
			
			document.body.removeEventListener("mouseup", endSelect);
		};
		
		row.modules.select = {selected:false};

		element.classList.toggle("tabulator-selectable", selectable);
		element.classList.toggle("tabulator-unselectable", !selectable);
		
		//set row selection class
		if(self.checkRowSelectability(row)){			
			if(self.table.options.selectableRows && self.table.options.selectableRows != "highlight"){
				if(self.table.options.selectableRowsRangeMode === "click"){
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
						
						if(this.table.options.selectableRows !== true && !this.isRowSelected(row)){
							if(this.selectedRows.length < this.table.options.selectableRows){
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
				
				if(this.table.options.selectableRows !== true){
					if(toggledRows.length > this.table.options.selectableRows){
						toggledRows = toggledRows.slice(0, this.table.options.selectableRows);
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
		if(row && row.type === "row"){
			return this.table.options.selectableRowsCheck.call(this.table, row.getComponent());
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
		var changes = [], 
		rowMatch, change;
		
		switch(typeof rows){
			case "undefined":
				rowMatch = this.table.rowManager.rows;
				break;
			
			case "number":
				rowMatch = this.table.rowManager.findRow(rows);
				break;
				
			case "string":
				rowMatch = this.table.rowManager.findRow(rows);
			
				if(!rowMatch){
					rowMatch = this.table.rowManager.getRows(rows);
				}
				break;
			
			default:
				rowMatch = rows;
				break;
		}

		if(Array.isArray(rowMatch)){
			if(rowMatch.length){
				rowMatch.forEach((row) => {
					change = this._selectRow(row, true, true);

					if(change){
						changes.push(change);
					}
				});

				this._rowSelectionChanged(false, changes);
			}
		}else{
			if(rowMatch){
				this._selectRow(rowMatch, false, true);
			}
		}	
	}
	
	//select an individual row
	_selectRow(rowInfo, silent, force){
		//handle max row count
		if(!isNaN(this.table.options.selectableRows) && this.table.options.selectableRows !== true && !force){
			if(this.selectedRows.length >= this.table.options.selectableRows){
				if(this.table.options.selectableRowsRollingSelection){
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
				
				this._rowSelectionChanged(silent, row);

				return row;
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
		var changes = [], 
		rowMatch, change;
		
		switch(typeof rows){
			case "undefined":
				rowMatch = Object.assign([], this.selectedRows);
				break;

			case "number":
				rowMatch = this.table.rowManager.findRow(rows);
				break;
			
			case "string":
				rowMatch = this.table.rowManager.findRow(rows);
			
				if(!rowMatch){
					rowMatch = this.table.rowManager.getRows(rows);
				}
				break;
			
			default:
				rowMatch = rows;
				break;
		}

		if(Array.isArray(rowMatch)){
			if(rowMatch.length){
				rowMatch.forEach((row) => {
					change = this._deselectRow(row, true, true);

					if(change){
						changes.push(change);
					}
				});

				this._rowSelectionChanged(silent, [], changes);
			}
		}else{
			if(rowMatch){
				this._deselectRow(rowMatch, silent, true);
			}
		}	
	}
	
	//deselect an individual row
	_deselectRow(rowInfo, silent){
		var self = this,
		row = self.table.rowManager.findRow(rowInfo),
		index, element;
		
		if(row){
			index = self.selectedRows.findIndex(function(selectedRow){
				return selectedRow == row;
			});
			
			if(index > -1){

				element = row.getElement();
				
				if(element){
					element.classList.remove("tabulator-selected");
				}
				
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
				
				self._rowSelectionChanged(silent, undefined, row);

				return row;
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
	
	_rowSelectionChanged(silent, selected = [], deselected = []){
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
			if(!Array.isArray(selected)){
				selected = [selected];
			}

			selected = selected.map(row => row.getComponent());

			if(!Array.isArray(deselected)){
				deselected = [deselected];
			}

			deselected = deselected.map(row => row.getComponent());

			this.dispatchExternal("rowSelectionChanged", this.getSelectedData(), this.getSelectedRows(), selected, deselected);
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
		var children = this.table.modules.dataTree.getChildren(row, true, true);
		
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