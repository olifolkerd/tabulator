import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';

import defaultEditors from './defaults/editors.js';

export default class Edit extends Module{

	static moduleName = "edit";

	//load defaults
	static editors = defaultEditors;
	
	constructor(table){
		super(table);
		
		this.currentCell = false; //hold currently editing cell
		this.mouseClick = false; //hold mousedown state to prevent click binding being overridden by editor opening
		this.recursionBlock = false; //prevent focus recursion
		this.invalidEdit = false;
		this.editedCells = [];
		this.convertEmptyValues = false;
		
		this.editors = Edit.editors;
	
		this.registerTableOption("editTriggerEvent", "focus");
		this.registerTableOption("editorEmptyValue");
		this.registerTableOption("editorEmptyValueFunc", this.emptyValueCheck.bind(this));

		this.registerColumnOption("editable");
		this.registerColumnOption("editor");
		this.registerColumnOption("editorParams");
		this.registerColumnOption("editorEmptyValue");
		this.registerColumnOption("editorEmptyValueFunc");
		
		this.registerColumnOption("cellEditing");
		this.registerColumnOption("cellEdited");
		this.registerColumnOption("cellEditCancelled");
		
		this.registerTableFunction("getEditedCells", this.getEditedCells.bind(this));
		this.registerTableFunction("clearCellEdited", this.clearCellEdited.bind(this));
		this.registerTableFunction("navigatePrev", this.navigatePrev.bind(this));
		this.registerTableFunction("navigateNext", this.navigateNext.bind(this));
		this.registerTableFunction("navigateLeft", this.navigateLeft.bind(this));
		this.registerTableFunction("navigateRight", this.navigateRight.bind(this));
		this.registerTableFunction("navigateUp", this.navigateUp.bind(this));
		this.registerTableFunction("navigateDown", this.navigateDown.bind(this));
		
		this.registerComponentFunction("cell", "isEdited", this.cellIsEdited.bind(this));
		this.registerComponentFunction("cell", "clearEdited", this.clearEdited.bind(this));
		this.registerComponentFunction("cell", "edit", this.editCell.bind(this));
		this.registerComponentFunction("cell", "cancelEdit", this.cellCancelEdit.bind(this));
		
		this.registerComponentFunction("cell", "navigatePrev", this.navigatePrev.bind(this));
		this.registerComponentFunction("cell", "navigateNext", this.navigateNext.bind(this));
		this.registerComponentFunction("cell", "navigateLeft", this.navigateLeft.bind(this));
		this.registerComponentFunction("cell", "navigateRight", this.navigateRight.bind(this));
		this.registerComponentFunction("cell", "navigateUp", this.navigateUp.bind(this));
		this.registerComponentFunction("cell", "navigateDown", this.navigateDown.bind(this));
	}
	
	initialize(){
		this.subscribe("cell-init", this.bindEditor.bind(this));
		this.subscribe("cell-delete", this.clearEdited.bind(this));
		this.subscribe("cell-value-changed", this.updateCellClass.bind(this));
		this.subscribe("column-layout", this.initializeColumnCheck.bind(this));
		this.subscribe("column-delete", this.columnDeleteCheck.bind(this));
		this.subscribe("row-deleting", this.rowDeleteCheck.bind(this));
		this.subscribe("row-layout", this.rowEditableCheck.bind(this));
		this.subscribe("data-refreshing", this.cancelEdit.bind(this));
		this.subscribe("clipboard-paste", this.pasteBlocker.bind(this));
		
		this.subscribe("keybinding-nav-prev", this.navigatePrev.bind(this, undefined));
		this.subscribe("keybinding-nav-next", this.keybindingNavigateNext.bind(this));
		
		// this.subscribe("keybinding-nav-left", this.navigateLeft.bind(this, undefined));
		// this.subscribe("keybinding-nav-right", this.navigateRight.bind(this, undefined));
		this.subscribe("keybinding-nav-up", this.navigateUp.bind(this, undefined));
		this.subscribe("keybinding-nav-down", this.navigateDown.bind(this, undefined));

		if(Object.keys(this.table.options).includes("editorEmptyValue")){
			this.convertEmptyValues = true;
		}
	}
	
	
	///////////////////////////////////
	///////// Paste Negation //////////
	///////////////////////////////////
	
	pasteBlocker(e){
		if(this.currentCell){
			return true;
		}
	}
	
	
	///////////////////////////////////
	////// Keybinding Functions ///////
	///////////////////////////////////
	
	keybindingNavigateNext(e){
		var cell = this.currentCell,
		newRow = this.options("tabEndNewRow");

		if(cell){
			if(!this.navigateNext(cell, e)){
				if(newRow){
					cell.getElement().firstChild.blur();
					
					if(!this.invalidEdit){
						
						if(newRow === true){
							newRow = this.table.addRow({});
						}else{
							if(typeof newRow == "function"){
								newRow = this.table.addRow(newRow(cell.row.getComponent()));
							}else{
								newRow = this.table.addRow(Object.assign({}, newRow));
							}
						}
						
						newRow.then(() => {
							setTimeout(() => {
								cell.getComponent().navigateNext();
							});
						});
					}
				}
			}
		}
	}
	
	///////////////////////////////////
	///////// Cell Functions //////////
	///////////////////////////////////
	
	cellIsEdited(cell){
		return !! cell.modules.edit && cell.modules.edit.edited;
	}
	
	cellCancelEdit(cell){
		if(cell === this.currentCell){
			this.table.modules.edit.cancelEdit();
		}else{
			console.warn("Cancel Editor Error - This cell is not currently being edited ");
		}
	}
	
	
	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////
	updateCellClass(cell){
		if(this.allowEdit(cell)) {
			cell.getElement().classList.add("tabulator-editable");
		}
		else {
			cell.getElement().classList.remove("tabulator-editable");
		}
	}
	
	clearCellEdited(cells){
		if(!cells){
			cells = this.table.modules.edit.getEditedCells();
		}
		
		if(!Array.isArray(cells)){
			cells = [cells];
		}
		
		cells.forEach((cell) => {
			this.table.modules.edit.clearEdited(cell._getSelf());
		});
	}
	
	navigatePrev(cell = this.currentCell, e){
		var nextCell, prevRow;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			nextCell = this.navigateLeft();
			
			if(nextCell){
				return true;
			}else{
				prevRow = this.table.rowManager.prevDisplayRow(cell.row, true);
				
				if(prevRow){
					nextCell = this.findPrevEditableCell(prevRow, prevRow.cells.length);
					
					if(nextCell){
						nextCell.getComponent().edit();
						return true;
					}
				}
			}
		}
		
		return false;
	}
	
	navigateNext(cell = this.currentCell, e){
		var nextCell, nextRow;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			nextCell = this.navigateRight();
			
			if(nextCell){
				return true;
			}else{
				nextRow = this.table.rowManager.nextDisplayRow(cell.row, true);
				
				if(nextRow){
					nextCell = this.findNextEditableCell(nextRow, -1);
					
					if(nextCell){
						nextCell.getComponent().edit();
						return true;
					}
				}
			}
		}
		
		return false;
	}
	
	navigateLeft(cell = this.currentCell, e){
		var index, nextCell;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			index = cell.getIndex();
			nextCell = this.findPrevEditableCell(cell.row, index);
			
			if(nextCell){
				nextCell.getComponent().edit();
				return true;
			}
		}
		
		return false;
	}
	
	navigateRight(cell = this.currentCell, e){
		var index, nextCell;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			index = cell.getIndex();
			nextCell = this.findNextEditableCell(cell.row, index);
			
			if(nextCell){
				nextCell.getComponent().edit();
				return true;
			}
		}
		
		return false;
	}
	
	navigateUp(cell = this.currentCell, e){
		var index, nextRow;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			index = cell.getIndex();
			nextRow = this.table.rowManager.prevDisplayRow(cell.row, true);
			
			if(nextRow){
				nextRow.cells[index].getComponent().edit();
				return true;
			}
		}
		
		return false;
	}
	
	navigateDown(cell = this.currentCell, e){
		var index, nextRow;
		
		if(cell){
			
			if(e){
				e.preventDefault();
			}
			
			index = cell.getIndex();
			nextRow = this.table.rowManager.nextDisplayRow(cell.row, true);
			
			if(nextRow){
				nextRow.cells[index].getComponent().edit();
				return true;
			}
		}
		
		return false;
	}
	
	findNextEditableCell(row, index){
		var nextCell = false;
		
		if(index < row.cells.length-1){
			for(var i = index+1; i < row.cells.length; i++){
				let cell = row.cells[i];
				
				if(cell.column.modules.edit && Helpers.elVisible(cell.getElement())){
					let allowEdit = this.allowEdit(cell);
					
					if(allowEdit){
						nextCell = cell;
						break;
					}
				}
			}
		}
		
		return nextCell;
	}
	
	findPrevEditableCell(row, index){
		var prevCell = false;
		
		if(index > 0){
			for(var i = index-1; i >= 0; i--){
				let cell = row.cells[i];
				
				if(cell.column.modules.edit && Helpers.elVisible(cell.getElement())){
					let allowEdit = this.allowEdit(cell);
					
					if(allowEdit){
						prevCell = cell;
						break;
					}
				}
			}
		}
		
		return prevCell;
	}
	
	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////
	
	initializeColumnCheck(column){
		if(typeof column.definition.editor !== "undefined"){
			this.initializeColumn(column);
		}
	}
	
	columnDeleteCheck(column){
		if(this.currentCell && this.currentCell.column === column){
			this.cancelEdit();
		}
	}
	
	rowDeleteCheck(row){
		if(this.currentCell && this.currentCell.row === row){
			this.cancelEdit();
		}
	}
	
	rowEditableCheck(row){
		row.getCells().forEach((cell) => {
			if(cell.column.modules.edit && typeof cell.column.modules.edit.check === "function"){
				this.updateCellClass(cell);
			}
		});
	}
	
	//initialize column editor
	initializeColumn(column){
		var convertEmpty = Object.keys(column.definition).includes("editorEmptyValue");

		var config = {
			editor:false,
			blocked:false,
			check:column.definition.editable,
			params:column.definition.editorParams || {},
			convertEmptyValues:convertEmpty,
			editorEmptyValue:column.definition.editorEmptyValue,
			editorEmptyValueFunc:column.definition.editorEmptyValueFunc,
		};
		
		//set column editor
		switch(typeof column.definition.editor){
			case "string":
				if(this.editors[column.definition.editor]){
					config.editor = this.editors[column.definition.editor];
				}else{
					console.warn("Editor Error - No such editor found: ", column.definition.editor);
				}
				break;
			
			case "function":
				config.editor = column.definition.editor;
				break;
			
			case "boolean":
				if(column.definition.editor === true){
					if(typeof column.definition.formatter !== "function"){
						if(this.editors[column.definition.formatter]){
							config.editor = this.editors[column.definition.formatter];
						}else{
							config.editor = this.editors["input"];
						}
					}else{
						console.warn("Editor Error - Cannot auto lookup editor for a custom formatter: ", column.definition.formatter);
					}
				}
				break;
		}
		
		if(config.editor){
			column.modules.edit = config;
		}
	}
	
	getCurrentCell(){
		return this.currentCell ? this.currentCell.getComponent() : false;
	}
	
	clearEditor(cancel){
		var cell = this.currentCell,
		cellEl;
		
		this.invalidEdit = false;
		
		if(cell){
			this.currentCell = false;
			
			cellEl = cell.getElement();
			
			this.dispatch("edit-editor-clear", cell, cancel);
			
			cellEl.classList.remove("tabulator-editing");
			
			while(cellEl.firstChild) cellEl.removeChild(cellEl.firstChild);
			
			cell.row.getElement().classList.remove("tabulator-editing");
			
			cell.table.element.classList.remove("tabulator-editing");
		}
	}
	
	cancelEdit(){
		if(this.currentCell){
			var cell = this.currentCell;
			var component = this.currentCell.getComponent();
			
			this.clearEditor(true);
			cell.setValueActual(cell.getValue());
			cell.cellRendered();
			
			if(cell.column.definition.editor == "textarea" || cell.column.definition.variableHeight){
				cell.row.normalizeHeight(true);
			}
			
			if(cell.column.definition.cellEditCancelled){
				cell.column.definition.cellEditCancelled.call(this.table, component);
			}
			
			this.dispatch("edit-cancelled", cell);
			this.dispatchExternal("cellEditCancelled", component);
		}
	}
	
	//return a formatted value for a cell
	bindEditor(cell){
		if(cell.column.modules.edit){
			var self = this,
			element = cell.getElement(true);
			
			this.updateCellClass(cell);
			element.setAttribute("tabindex", 0);
			
			element.addEventListener("mousedown", function(e){
				if (e.button === 2) {
					e.preventDefault();
				}else{
					self.mouseClick = true;
				}
			});

			if(this.options("editTriggerEvent") === "dblclick"){
				element.addEventListener("dblclick", function(e){
					if(!element.classList.contains("tabulator-editing")){
						element.focus({preventScroll: true});
						self.edit(cell, e, false);
					}
				});
			}
			
			
			if(this.options("editTriggerEvent") === "focus" || this.options("editTriggerEvent") === "click"){
				element.addEventListener("click", function(e){
					if(!element.classList.contains("tabulator-editing")){
						element.focus({preventScroll: true});
						self.edit(cell, e, false);
					}
				});
			}
			
			if(this.options("editTriggerEvent") === "focus"){
				element.addEventListener("focus", function(e){
					if(!self.recursionBlock){
						self.edit(cell, e, false);
					}
				});
			}
		}
	}
	
	focusCellNoEvent(cell, block){
		this.recursionBlock = true;
		
		if(!(block && this.table.browser === "ie")){
			cell.getElement().focus({preventScroll: true});
		}
		
		this.recursionBlock = false;
	}
	
	editCell(cell, forceEdit){
		this.focusCellNoEvent(cell);
		this.edit(cell, false, forceEdit);
	}
	
	focusScrollAdjust(cell){
		if(this.table.rowManager.getRenderMode() == "virtual"){
			var topEdge = this.table.rowManager.element.scrollTop,
			bottomEdge = this.table.rowManager.element.clientHeight + this.table.rowManager.element.scrollTop,
			rowEl = cell.row.getElement();
			
			if(rowEl.offsetTop < topEdge){
				this.table.rowManager.element.scrollTop -= (topEdge - rowEl.offsetTop);
			}else{
				if(rowEl.offsetTop + rowEl.offsetHeight  > bottomEdge){
					this.table.rowManager.element.scrollTop += (rowEl.offsetTop + rowEl.offsetHeight - bottomEdge);
				}
			}
			
			var leftEdge = this.table.rowManager.element.scrollLeft,
			rightEdge = this.table.rowManager.element.clientWidth + this.table.rowManager.element.scrollLeft,
			cellEl = cell.getElement();
			
			if(this.table.modExists("frozenColumns")){
				leftEdge += parseInt(this.table.modules.frozenColumns.leftMargin || 0);
				rightEdge -= parseInt(this.table.modules.frozenColumns.rightMargin || 0);
			}
			
			if(this.table.options.renderHorizontal === "virtual"){
				leftEdge -= parseInt(this.table.columnManager.renderer.vDomPadLeft);
				rightEdge -= parseInt(this.table.columnManager.renderer.vDomPadLeft);
			}
			
			if(cellEl.offsetLeft < leftEdge){
				this.table.rowManager.element.scrollLeft -= (leftEdge - cellEl.offsetLeft);
			}else{
				if(cellEl.offsetLeft + cellEl.offsetWidth  > rightEdge){
					this.table.rowManager.element.scrollLeft += (cellEl.offsetLeft + cellEl.offsetWidth - rightEdge);
				}
			}
		}
	}
	
	allowEdit(cell) {
		var check = cell.column.modules.edit ? true : false;
		
		if(cell.column.modules.edit){
			switch(typeof cell.column.modules.edit.check){
				case "function":
					if(cell.row.initialized){
						check = cell.column.modules.edit.check(cell.getComponent());
					}
					break;
				
				case "string":
					check = !!cell.row.data[cell.column.modules.edit.check];
					break;
				
				case "boolean":
					check = cell.column.modules.edit.check;
					break;
			}
		}
		
		return check;
	}
	
	edit(cell, e, forceEdit){
		var self = this,
		allowEdit = true,
		rendered = function(){},
		element = cell.getElement(),
		editFinished = false,
		cellEditor, component, params;

		//prevent editing if another cell is refusing to leave focus (eg. validation fail)
		
		if(this.currentCell){
			if(!this.invalidEdit && this.currentCell !== cell){
				this.cancelEdit();
			}
			return;
		}
		
		//handle successful value change
		function success(value){
			if(self.currentCell === cell && !editFinished){
				var valid = self.chain("edit-success", [cell, value], true, true);

				if(valid === true || self.table.options.validationMode === "highlight"){

					editFinished = true;

					self.clearEditor();
					
					if(!cell.modules.edit){
						cell.modules.edit = {};
					}
					
					cell.modules.edit.edited = true;
					
					if(self.editedCells.indexOf(cell) == -1){
						self.editedCells.push(cell);
					}

					value = self.transformEmptyValues(value, cell);
					
					cell.setValue(value, true);

					return valid === true;
				}else{
					editFinished = true;
					self.invalidEdit = true;
					self.focusCellNoEvent(cell, true);
					rendered();

					setTimeout(() => {
						editFinished = false;
					}, 10);
					return false;
				}
			}else{
				// console.warn("Edit Success Error - cannot call success on a cell that is no longer being edited");
			}
		}
		
		//handle aborted edit
		function cancel(){
			// editFinished = true;

			if(self.currentCell === cell && !editFinished){
				self.cancelEdit();
			}else{
				// console.warn("Edit Success Error - cannot call cancel on a cell that is no longer being edited");
			}
		}
		
		function onRendered(callback){
			rendered = callback;
		}
		
		if(!cell.column.modules.edit.blocked){
			if(e){
				e.stopPropagation();
			}
			
			allowEdit = this.allowEdit(cell);
			
			if(allowEdit || forceEdit){
				self.cancelEdit();
				
				self.currentCell = cell;
				
				this.focusScrollAdjust(cell);
				
				component = cell.getComponent();
				
				if(this.mouseClick){
					this.mouseClick = false;
					
					if(cell.column.definition.cellClick){
						cell.column.definition.cellClick.call(this.table, e, component);
					}
				}
				
				if(cell.column.definition.cellEditing){
					cell.column.definition.cellEditing.call(this.table, component);
				}
				
				this.dispatch("cell-editing", cell);
				this.dispatchExternal("cellEditing", component);
				
				params = typeof cell.column.modules.edit.params === "function" ? cell.column.modules.edit.params(component) : cell.column.modules.edit.params;
				
				cellEditor = cell.column.modules.edit.editor.call(self, component, onRendered, success, cancel, params);
				
				//if editor returned, add to DOM, if false, abort edit
				if(this.currentCell && cellEditor !== false){
					if(cellEditor instanceof Node){
						element.classList.add("tabulator-editing");
						cell.row.getElement().classList.add("tabulator-editing");
						cell.table.element.classList.add("tabulator-editing");
						while(element.firstChild) element.removeChild(element.firstChild);
						element.appendChild(cellEditor);
						
						//trigger onRendered Callback
						rendered();
						
						//prevent editing from triggering rowClick event
						var children = element.children;
						
						for (var i = 0; i < children.length; i++) {
							children[i].addEventListener("click", function(e){
								e.stopPropagation();
							});
						}
					}else{
						console.warn("Edit Error - Editor should return an instance of Node, the editor returned:", cellEditor);
						this.blur(element);
						return false;
					}
				}else{
					this.blur(element);
					return false;
				}
				
				return true;
			}else{
				this.mouseClick = false;
				this.blur(element);
				return false;
			}
		}else{
			this.mouseClick = false;
			this.blur(element);
			return false;
		}
	}

	emptyValueCheck(value){
		return value === "" || value === null || typeof value === "undefined";
	}

	transformEmptyValues(value, cell){
		var mod = cell.column.modules.edit, 
		convert = mod.convertEmptyValues || this.convertEmptyValues,
		checkFunc;
		
		if(convert){
			checkFunc = mod.editorEmptyValueFunc || this.options("editorEmptyValueFunc");

			if(checkFunc && checkFunc(value)){
				value = mod.convertEmptyValues ? mod.editorEmptyValue : this.options("editorEmptyValue");
			}
		}
		
		return value;
	}
	
	blur(element){
		if(!this.confirm("edit-blur", [element]) ){
			element.blur();
		}
	}
	
	getEditedCells(){
		var output = [];
		
		this.editedCells.forEach((cell) => {
			output.push(cell.getComponent());
		});
		
		return output;
	}
	
	clearEdited(cell){
		var editIndex;
		
		if(cell.modules.edit && cell.modules.edit.edited){
			cell.modules.edit.edited = false;
			
			this.dispatch("edit-edited-clear", cell);
		}
		
		editIndex = this.editedCells.indexOf(cell);
		
		if(editIndex > -1){
			this.editedCells.splice(editIndex, 1);
		}
	}
}