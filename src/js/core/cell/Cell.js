import CellComponent from './CellComponent.js';

export default class Cell {
	constructor(column, row){
		this.table = column.table;
		this.column = column;
		this.row = row;
		this.element = null;
		this.value = null;
		this.initialValue;
		this.oldValue = null;
		this.modules = {};

		this.height = null;
		this.width = null;
		this.minWidth = null;

		this.component = null;

		this.loaded = false; //track if the cell has been added to the DOM yet

		this.build();
	}

	//////////////// Setup Functions /////////////////
	//generate element
	build(){
		this.generateElement();

		this.setWidth();

		this._configureCell();

		this.setValueActual(this.column.getFieldValue(this.row.data));

		this.initialValue = this.value;
	}

	generateElement(){
		this.element = document.createElement('div');
		this.element.className = "tabulator-cell";
		this.element.setAttribute("role", "gridcell");
		this.element = this.element;
	}

	_configureCell(){
		var cellEvents = this.column.cellEvents,
		element = this.element,
		field = this.column.getField(),
		vertAligns = {
			top:"flex-start",
			bottom:"flex-end",
			middle:"center",
		},
		hozAligns = {
			left:"flex-start",
			right:"flex-end",
			center:"center",
		};

		//set text alignment
		element.style.textAlign = this.column.hozAlign;

		if(this.column.vertAlign){
			element.style.display = "inline-flex";

			element.style.alignItems = vertAligns[this.column.vertAlign] || "";

			if(this.column.hozAlign){
				element.style.justifyContent = hozAligns[this.column.hozAlign] || "";
			}
		}

		if(field){
			element.setAttribute("tabulator-field", field);
		}

		//add class to cell if needed
		if(this.column.definition.cssClass){
			var classNames = this.column.definition.cssClass.split(" ")
			classNames.forEach((className) => {
				element.classList.add(className)
			});
		}

		//update tooltip on mouse enter
		if (this.table.options.tooltipGenerationMode === "hover"){
			element.addEventListener("mouseenter", (e) => {
				this._generateTooltip();
			});
		}

		this._bindClickEvents(cellEvents);

		this._bindTouchEvents(cellEvents);

		this._bindMouseEvents(cellEvents);

		this.table.eventBus.dispatch("cell-init", this);

		//hide cell if not visible
		if(!this.column.visible){
			this.hide();
		}
	}

	_bindClickEvents(cellEvents){
		var element = this.element;

		//set event bindings
		if (cellEvents.cellClick || this.table.options.cellClick){
			element.addEventListener("click", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellClick){
					cellEvents.cellClick.call(this.table, e, component);
				}

				if(this.table.options.cellClick){
					this.table.options.cellClick.call(this.table, e, component);
				}
			});
		}

		if (cellEvents.cellDblClick || this.table.options.cellDblClick){
			element.addEventListener("dblclick", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellDblClick){
					cellEvents.cellDblClick.call(this.table, e, component);
				}

				if(this.table.options.cellDblClick){
					this.table.options.cellDblClick.call(this.table, e, component);
				}
			});
		}else{
			element.addEventListener("dblclick", (e) => {
				if(this.table.modExists("edit")){
					if (this.table.modules.edit.currentCell === this){
						return; //prevent instant selection of editor content
					}
				}

				e.preventDefault();

				try{
					if (document.selection) { // IE
						var range = document.body.createTextRange();
						range.moveToElementText(this.element);
						range.select();
					} else if (window.getSelection) {
						var range = document.createRange();
						range.selectNode(this.element);
						window.getSelection().removeAllRanges();
						window.getSelection().addRange(range);
					}
				}catch(e){}
			});
		}

		if (cellEvents.cellContext || this.table.options.cellContext){
			element.addEventListener("contextmenu", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellContext){
					cellEvents.cellContext.call(this.table, e, component);
				}

				if(this.table.options.cellContext){
					this.table.options.cellContext.call(this.table, e, component);
				}
			});
		}
	}

	_bindMouseEvents(cellEvents){
		var element = this.element;

		if (cellEvents.cellMouseEnter || this.table.options.cellMouseEnter){
			element.addEventListener("mouseenter", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellMouseEnter){
					cellEvents.cellMouseEnter.call(this.table, e, component);
				}

				if(this.table.options.cellMouseEnter){
					this.table.options.cellMouseEnter.call(this.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseLeave || this.table.options.cellMouseLeave){
			element.addEventListener("mouseleave", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellMouseLeave){
					cellEvents.cellMouseLeave.call(this.table, e, component);
				}

				if(this.table.options.cellMouseLeave){
					this.table.options.cellMouseLeave.call(this.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseOver || this.table.options.cellMouseOver){
			element.addEventListener("mouseover", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellMouseOver){
					cellEvents.cellMouseOver.call(this.table, e, component);
				}

				if(this.table.options.cellMouseOver){
					this.table.options.cellMouseOver.call(this.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseOut || this.table.options.cellMouseOut){
			element.addEventListener("mouseout", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellMouseOut){
					cellEvents.cellMouseOut.call(this.table, e, component);
				}

				if(this.table.options.cellMouseOut){
					this.table.options.cellMouseOut.call(this.table, e, component);
				}
			});
		}

		if (cellEvents.cellMouseMove || this.table.options.cellMouseMove){
			element.addEventListener("mousemove", (e) => {
				var component = this.getComponent();

				if(cellEvents.cellMouseMove){
					cellEvents.cellMouseMove.call(this.table, e, component);
				}

				if(this.table.options.cellMouseMove){
					this.table.options.cellMouseMove.call(this.table, e, component);
				}
			});
		}
	}

	_bindTouchEvents(cellEvents){
		var element = this.element,
		dblTap,	tapHold, tap;

		if (cellEvents.cellTap || this.table.options.cellTap){
			tap = false;

			element.addEventListener("touchstart", (e) => {
				tap = true;
			}, {passive: true});

			element.addEventListener("touchend", (e) => {
				if(tap){
					var component = this.getComponent();

					if(cellEvents.cellTap){
						cellEvents.cellTap.call(this.table, e, component);
					}

					if(this.table.options.cellTap){
						this.table.options.cellTap.call(this.table, e, component);
					}
				}

				tap = false;
			});
		}

		if (cellEvents.cellDblTap || this.table.options.cellDblTap){
			dblTap = null;

			element.addEventListener("touchend", (e) => {
				if(dblTap){
					clearTimeout(dblTap);
					dblTap = null;

					var component = this.getComponent();

					if(cellEvents.cellDblTap){
						cellEvents.cellDblTap.call(this.table, e, component);
					}

					if(this.table.options.cellDblTap){
						this.table.options.cellDblTap.call(this.table, e, component);
					}
				}else{

					dblTap = setTimeout(() => {
						clearTimeout(dblTap);
						dblTap = null;
					}, 300);
				}
			});
		}

		if (cellEvents.cellTapHold || this.table.options.cellTapHold){
			tapHold = null;

			element.addEventListener("touchstart", (e) => {
				clearTimeout(tapHold);

				tapHold = setTimeout(() => {
					clearTimeout(tapHold);
					tapHold = null;
					tap = false;
					var component = this.getComponent();

					if(cellEvents.cellTapHold){
						cellEvents.cellTapHold.call(this.table, e, component);
					}

					if(this.table.options.cellTapHold){
						this.table.options.cellTapHold.call(this.table, e, component);
					}
				}, 1000);

			}, {passive: true});

			element.addEventListener("touchend", (e) => {
				clearTimeout(tapHold);
				tapHold = null;
			});
		}
	}

	//generate cell contents
	_generateContents(){
		var val;

		val = this.table.eventBus.chain("cell-format", this, () => {
			return this.element.innerHTML = this.value;
		});

		switch(typeof val){
			case "object":
			if(val instanceof Node){

				//clear previous cell contents
				while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

				this.element.appendChild(val);
			}else{
				this.element.innerHTML = "";

				if(val != null){
					console.warn("Format Error - Formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", val);
				}
			}
			break;
			case "undefined":
			case "null":
			this.element.innerHTML = "";
			break;
			default:
			this.element.innerHTML = val;
		}
	}

	cellRendered(){
		this.table.eventBus.dispatch("cell-rendered", this);
	}

	//generate tooltip text
	_generateTooltip(){
		var tooltip = this.column.tooltip;

		if(tooltip){
			if(tooltip === true){
				tooltip = this.value;
			}else if(typeof(tooltip) == "function"){
				tooltip = tooltip(this.getComponent());

				if(tooltip === false){
					tooltip = "";
				}
			}

			if(typeof tooltip === "undefined"){
				tooltip = "";
			}

			this.element.setAttribute("title", tooltip);
		}else{
			this.element.setAttribute("title", "");
		}
	}

	//////////////////// Getters ////////////////////
	getElement(containerOnly){
		if(!this.loaded){
			this.loaded = true;
			if(!containerOnly){
				this.layoutElement();
			}
		}

		return this.element;
	}

	getValue(){
		return this.value;
	}

	getOldValue(){
		return this.oldValue;
	}

	//////////////////// Actions ////////////////////
	setValue(value, mutate){
		var changed = this.setValueProcessData(value, mutate),
		component;

		if(changed){
			this.table.eventBus.dispatch("cell-value-updated", this);

			component = this.getComponent();

			if(this.column.cellEvents.cellEdited){
				this.column.cellEvents.cellEdited.call(this.table, component);
			}

			this.cellRendered();

			this.table.externalEvents.dispatch("cellEdited", component);

			if(this.table.externalEvents.subscribed("dataChanged")){
				this.table.externalEvents.dispatch("dataChanged", this.table.rowManager.getData());
			}
		}
	}

	setValueProcessData(value, mutate){
		var changed = false;

		if(this.value != value){

			changed = true;

			if(mutate){
				value = this.table.eventBus.chain("cell-value-changing", [this, value], value);
			}
		}

		this.setValueActual(value);

		if(changed){
			this.table.eventBus.dispatch("cell-value-changed", this);
		}

		return changed;
	}

	setValueActual(value){
		this.oldValue = this.value;

		this.value = value;

		this.table.eventBus.dispatch("cell-value-save-before", this);

		this.column.setFieldValue(this.row.data, value);

		this.table.eventBus.dispatch("cell-value-save-after", this);

		if(this.loaded){
			this.layoutElement();
		}
	}

	layoutElement(){
		this._generateContents();
		this._generateTooltip();

		this.table.eventBus.dispatch("cell-layout", this);
	}

	setWidth(){
		this.width = this.column.width;
		this.element.style.width = this.column.widthStyled;
	}

	clearWidth(){
		this.width = "";
		this.element.style.width = "";
	}

	getWidth(){
		return this.width || this.element.offsetWidth;
	}

	setMinWidth(){
		this.minWidth = this.column.minWidth;
		this.element.style.minWidth = this.column.minWidthStyled;
	}

	setMaxWidth(){
		this.maxWidth = this.column.maxWidth;
		this.element.style.maxWidth = this.column.maxWidthStyled;
	}

	checkHeight(){
		// var height = this.element.css("height");
		this.row.reinitializeHeight();
	}

	clearHeight(){
		this.element.style.height = "";
		this.height = null;
	}

	setHeight(){
		this.height = this.row.height;
		this.element.style.height =  this.row.heightStyled;
	}

	getHeight(){
		return this.height || this.element.offsetHeight;
	}

	show(){
		this.element.style.display = this.column.vertAlign ? "inline-flex" : "";
	}

	hide(){
		this.element.style.display = "none";
	}

	edit(force){
		if(this.table.modExists("edit", true)){
			return this.table.modules.edit.editCell(this, force);
		}
	}

	cancelEdit(){
		if(this.table.modExists("edit", true)){
			var editing = this.table.modules.edit.getCurrentCell();

			if(editing && editing._getSelf() === this){
				this.table.modules.edit.cancelEdit();
			}else{
				console.warn("Cancel Editor Error - This cell is not currently being edited ");
			}
		}
	}

	validate(){
		if(this.column.modules.validate && this.table.modExists("validate", true)){
			var valid = this.table.modules.validate.validate(this.column.modules.validate, this, this.getValue());

			return valid === true;
		}else{
			return true;
		}
	}

	delete(){
		if(!this.table.rowManager.redrawBlock && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}

		if(this.modules.validate && this.modules.validate.invalid){
			this.table.modules.validate.clearValidation(this);
		}

		if(this.modules.edit && this.modules.edit.edited){
			this.table.modules.edit.clearEdited(this);
		}

		if(this.table.options.history){
			this.table.modules.history.clearComponentHistory(this);
		}

		this.element = false;
		this.column.deleteCell(this);
		this.row.deleteCell(this);
		this.calcs = {};
	}

	//////////////// Navigation /////////////////
	nav(){
		var self = this,
		nextCell = false,
		index = this.row.getCellIndex(this);

		return {
			next:function(){
				var nextCell = this.right(),
				nextRow;

				if(!nextCell){
					nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

					if(nextRow){
						nextCell = nextRow.findNextEditableCell(-1);

						if(nextCell){
							nextCell.edit();
							return true;
						}
					}
				}else{
					return true;
				}

				return false;
			},
			prev:function(){
				var nextCell = this.left(),
				prevRow;

				if(!nextCell){
					prevRow = self.table.rowManager.prevDisplayRow(self.row, true);

					if(prevRow){
						nextCell = prevRow.findPrevEditableCell(prevRow.cells.length);

						if(nextCell){
							nextCell.edit();
							return true;
						}
					}

				}else{
					return true;
				}

				return false;
			},
			left:function(){

				nextCell = self.row.findPrevEditableCell(index);

				if(nextCell){
					nextCell.edit();
					return true;
				}else{
					return false;
				}
			},
			right:function(){
				nextCell = self.row.findNextEditableCell(index);

				if(nextCell){
					nextCell.edit();
					return true;
				}else{
					return false;
				}
			},
			up:function(){
				var nextRow = self.table.rowManager.prevDisplayRow(self.row, true);

				if(nextRow){
					nextRow.cells[index].edit();
				}
			},
			down:function(){
				var nextRow = self.table.rowManager.nextDisplayRow(self.row, true);

				if(nextRow){
					nextRow.cells[index].edit();
				}
			},

		};
	}

	getIndex(){
		this.row.getCellIndex(this);
	}

	//////////////// Object Generation /////////////////
	getComponent(){
		if(!this.component){
			this.component = new CellComponent(this);
		}

		return this.component;
	}
}