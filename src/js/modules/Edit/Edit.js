import Module from '../../core/Module.js';

import defaultEditors from './defaults/editors.js';

class Edit extends Module{

	constructor(table){
		super(table);

		this.currentCell = false; //hold currently editing cell
		this.mouseClick = false; //hold mousedown state to prevent click binding being overriden by editor opening
		this.recursionBlock = false; //prevent focus recursion
		this.invalidEdit = false;
		this.editedCells = [];

		this.editors = Edit.editors;
	}

	initialize(){
		this.subscribe("cell-init", this.bindEditor.bind(this));
		this.subscribe("cell-delete", this.clearEdited.bind(this));
		this.subscribe("column-layout", this.initializeColumnCheck.bind(this));
		this.subscribe("column-delete", this.columnDeleteCheck.bind(this));
		this.subscribe("row-deleting", this.rowDeleteCheck.bind(this));
	}

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

	//initialize column editor
	initializeColumn(column){
		var self = this,
		config = {
			editor:false,
			blocked:false,
			check:column.definition.editable,
			params:column.definition.editorParams || {}
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

			if(cancel){
				cell.validate();
			}else{
				cellEl.classList.remove("tabulator-validation-fail");
			}

			cellEl.classList.remove("tabulator-editing");
			while(cellEl.firstChild) cellEl.removeChild(cellEl.firstChild);

			cell.row.getElement().classList.remove("tabulator-row-editing");
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

			if(cell.column.cellEvents.cellEditCancelled){
				cell.column.cellEvents.cellEditCancelled.call(this.table, component);
			}

			this.dispatchExternal("cellEditCancelled", component);
		}
	}

	//return a formatted value for a cell
	bindEditor(cell){
		if(cell.column.modules.edit){
			var self = this,
			element = cell.getElement(true);

			element.setAttribute("tabindex", 0);

			element.addEventListener("click", function(e){
				if(!element.classList.contains("tabulator-editing")){
					element.focus({preventScroll: true});
				}
			});

			element.addEventListener("mousedown", function(e){
				if (e.button === 2) {
					e.preventDefault();
				}else{
					self.mouseClick = true;
				}
			});

			element.addEventListener("focus", function(e){
				if(!self.recursionBlock){
					self.edit(cell, e, false);
				}
			});
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
			rowEl = cell.row.getElement(),
			offset = rowEl.offsetTop;

			if(rowEl.offsetTop < topEdge){
				this.table.rowManager.element.scrollTop -= (topEdge - rowEl.offsetTop);
			}else{
				if(rowEl.offsetTop + rowEl.offsetHeight  > bottomEdge){
					this.table.rowManager.element.scrollTop += (rowEl.offsetTop + rowEl.offsetHeight - bottomEdge);
				}
			}

			var leftEdge = this.table.rowManager.element.scrollLeft,
			rightEdge = this.table.rowManager.element.clientWidth + this.table.rowManager.element.scrollLeft,
			cellEl = cell.getElement(),
			offset = cellEl.offsetLeft;

			if(this.table.modExists("frozenColumns")){
				leftEdge += parseInt(this.table.modules.frozenColumns.leftMargin);
				rightEdge -= parseInt(this.table.modules.frozenColumns.rightMargin);
			}

			if(this.table.options.virtualDomHoz){
				leftEdge -= parseInt(this.table.vdomHoz.vDomPadLeft);
				rightEdge -= parseInt(this.table.vdomHoz.vDomPadLeft);
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

	edit(cell, e, forceEdit){
		var self = this,
		allowEdit = true,
		rendered = function(){},
		element = cell.getElement(),
		cellEditor, component, params;

		//prevent editing if another cell is refusing to leave focus (eg. validation fail)
		if(this.currentCell){
			if(!this.invalidEdit){
				this.cancelEdit();
			}
			return;
		}

		//handle successfull value change
		function success(value){
			if(self.currentCell === cell){
				var valid = true;

				if(cell.column.modules.validate && self.table.modExists("validate") && self.table.options.validationMode != "manual"){
					valid = self.table.modules.validate.validate(cell.column.modules.validate, cell, value);
				}

				if(valid === true || self.table.options.validationMode === "highlight"){
					self.clearEditor();


					if(!cell.modules.edit){
						cell.modules.edit = {};
					}

					cell.modules.edit.edited = true;

					if(self.editedCells.indexOf(cell) == -1){
						self.editedCells.push(cell);
					}

					cell.setValue(value, true);

					if(self.table.options.dataTree && self.table.modExists("dataTree")){
						self.table.modules.dataTree.checkForRestyle(cell);
					}

					if(valid !== true){
						element.classList.add("tabulator-validation-fail");
						self.table.externalEvents.dispatch("validationFailed", cell.getComponent(), value, valid);
						return false;
					}

					return true;
				}else{
					self.invalidEdit = true;
					element.classList.add("tabulator-validation-fail");
					self.focusCellNoEvent(cell, true);
					rendered();
					self.table.externalEvents.dispatch("validationFailed", cell.getComponent(), value, valid);
					return false;
				}
			}else{
				// console.warn("Edit Success Error - cannot call success on a cell that is no longer being edited");
			}
		}

		//handle aborted edit
		function cancel(){
			if(self.currentCell === cell){
				self.cancelEdit();

				if(self.table.options.dataTree && self.table.modExists("dataTree")){
					self.table.modules.dataTree.checkForRestyle(cell);
				}
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

			switch(typeof cell.column.modules.edit.check){
				case "function":
				allowEdit = cell.column.modules.edit.check(cell.getComponent());
				break;

				case "boolean":
				allowEdit = cell.column.modules.edit.check;
				break;
			}

			if(allowEdit || forceEdit){

				self.cancelEdit();

				self.currentCell = cell;

				this.focusScrollAdjust(cell);

				component = cell.getComponent();

				if(this.mouseClick){
					this.mouseClick = false;

					if(cell.column.cellEvents.cellClick){
						cell.column.cellEvents.cellClick.call(this.table, e, component);
					}
				}

				if(cell.column.cellEvents.cellEditing){
					cell.column.cellEvents.cellEditing.call(this.table, component);
				}

				this.dispatchExternal("cellEditing", component);

				params = typeof cell.column.modules.edit.params === "function" ? cell.column.modules.edit.params(component) : cell.column.modules.edit.params;

				cellEditor = cell.column.modules.edit.editor.call(self, component, onRendered, success, cancel, params);

				//if editor returned, add to DOM, if false, abort edit
				if(cellEditor !== false){

					if(cellEditor instanceof Node){
						element.classList.add("tabulator-editing");
						cell.row.getElement().classList.add("tabulator-row-editing");
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
						element.blur();
						return false;
					}

				}else{
					element.blur();
					return false;
				}

				return true;
			}else{
				this.mouseClick = false;
				element.blur();
				return false;
			}
		}else{
			this.mouseClick = false;
			element.blur();
			return false;
		}
	}

	maskInput(el, options){
		var mask = options.mask,
		maskLetter = typeof options.maskLetterChar !== "undefined" ? options.maskLetterChar : "A",
		maskNumber = typeof options.maskNumberChar !== "undefined" ? options.maskNumberChar : "9",
		maskWildcard = typeof options.maskWildcardChar !== "undefined" ? options.maskWildcardChar : "*",
		success = false;

		function fillSymbols(index){
			var symbol = mask[index];
			if(typeof symbol !== "undefined" && symbol !== maskWildcard && symbol !== maskLetter && symbol !== maskNumber){
				el.value = el.value + "" + symbol;
				fillSymbols(index+1);
			}
		}

		el.addEventListener("keydown", (e) => {
			var index = el.value.length,
			char = e.key;

			if(e.keyCode > 46){
				if(index >= mask.length){
					e.preventDefault();
					e.stopPropagation();
					success = false;
					return false;
				}else{
					switch(mask[index]){
						case maskLetter:
						if(char.toUpperCase() == char.toLowerCase()){
							e.preventDefault();
							e.stopPropagation();
							success = false;
							return false;
						}
						break;

						case maskNumber:
						if(isNaN(char)){
							e.preventDefault();
							e.stopPropagation();
							success = false;
							return false;
						}
						break;

						case maskWildcard:
						break;

						default:
						if(char !== mask[index]){
							e.preventDefault();
							e.stopPropagation();
							success = false;
							return false;
						}
					}
				}

				success = true;
			}

			return;
		});

		el.addEventListener("keyup", (e) => {
			if(e.keyCode > 46){
				if(options.maskAutoFill){
					fillSymbols(el.value.length);
				}
			}
		});


		if(!el.placeholder){
			el.placeholder = mask;
		}

		if(options.maskAutoFill){
			fillSymbols(el.value.length);
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

			if(cell.modules.validate){
				cell.modules.validate.invalid = false;
			}
		}

		editIndex = this.editedCells.indexOf(cell);

		if(editIndex > -1){
			this.editedCells.splice(editIndex, 1);
		}
	}
}

Edit.moduleName = "edit";

//load defaults
Edit.editors = defaultEditors;


export default Edit;