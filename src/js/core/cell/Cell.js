import CoreFeature from '../CoreFeature.js';
import CellComponent from './CellComponent.js';

export default class Cell extends CoreFeature{
	constructor(column, row){
		super(column.table);

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
	}

	_configureCell(){
		var element = this.element,
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
			var classNames = this.column.definition.cssClass.split(" ");
			classNames.forEach((className) => {
				element.classList.add(className);
			});
		}

		this.dispatch("cell-init", this);

		//hide cell if not visible
		if(!this.column.visible){
			this.hide();
		}
	}

	//generate cell contents
	_generateContents(){
		var val;

		val = this.chain("cell-format", this, null, () => {
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
				this.element.innerHTML = "";
				break;
			default:
				this.element.innerHTML = val;
		}
	}

	cellRendered(){
		this.dispatch("cell-rendered", this);
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
	setValue(value, mutate, force){
		var changed = this.setValueProcessData(value, mutate, force);

		if(changed){
			this.dispatch("cell-value-updated", this);

			this.cellRendered();

			if(this.column.definition.cellEdited){
				this.column.definition.cellEdited.call(this.table, this.getComponent());
			}

			this.dispatchExternal("cellEdited", this.getComponent());

			if(this.subscribedExternal("dataChanged")){
				this.dispatchExternal("dataChanged", this.table.rowManager.getData());
			}
		}
	}

	setValueProcessData(value, mutate, force){
		var changed = false;

		if(this.value !== value || force){

			changed = true;

			if(mutate){
				value = this.chain("cell-value-changing", [this, value], null, value);
			}
		}

		this.setValueActual(value);

		if(changed){
			this.dispatch("cell-value-changed", this);
		}

		return changed;
	}

	setValueActual(value){
		this.oldValue = this.value;

		this.value = value;

		this.dispatch("cell-value-save-before", this);

		this.column.setFieldValue(this.row.data, value);

		this.dispatch("cell-value-save-after", this);

		if(this.loaded){
			this.layoutElement();
		}
	}

	layoutElement(){
		this._generateContents();

		this.dispatch("cell-layout", this);
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

		this.dispatch("cell-height", this, "");
	}

	setHeight(){
		this.height = this.row.height;
		this.element.style.height = this.row.heightStyled;

		this.dispatch("cell-height", this, this.row.heightStyled);
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

	delete(){
		this.dispatch("cell-delete", this);

		if(!this.table.rowManager.redrawBlock && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}

		this.element = false;
		this.column.deleteCell(this);
		this.row.deleteCell(this);
		this.calcs = {};
	}

	getIndex(){
		return this.row.getCellIndex(this);
	}

	//////////////// Object Generation /////////////////
	getComponent(){
		if(!this.component){
			this.component = new CellComponent(this);
		}

		return this.component;
	}
}
