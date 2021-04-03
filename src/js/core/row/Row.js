import CoreFeature from '../CoreFeature.js';
import RowComponent from './RowComponent.js';
import Helpers from '../Helpers.js';

export default class Row extends CoreFeature{
	constructor (data, parent, type = "row"){
		super(parent.table);

		this.parent = parent;
		this.data = {};
		this.type = type; //type of element
		this.element = false;
		this.modules = {}; //hold module variables;
		this.cells = [];
		this.height = 0; //hold element height
		this.heightStyled = ""; //hold element height prestyled to improve render efficiency
		this.manualHeight = false; //user has manually set row height
		this.outerHeight = 0; //holde lements outer height
		this.initialized = false; //element has been rendered
		this.heightInitialized = false; //element has resized cells to fit

		this.component = null;

		this.created = false;

		this.setData(data);
	}

	create(){
		if(!this.created){
			this.created = true;
			this.generateElement();
		}
	}

	createElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-row");
		el.setAttribute("role", "row");

		this.element = el;
	}

	getElement(){
		this.create();
		return this.element;
	}

	detachElement(){
		if (this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
	}

	generateElement(){
		var dblTap,	tapHold, tap;

		this.createElement();

		this.dispatch("row-init", this);

		if (this.table.options.rowTap){

			tap = false;

			this.element.addEventListener("touchstart", (e) => {
				tap = true;
			}, {passive: true});

			this.element.addEventListener("touchend", (e) => {
				if(tap){
					this.table.options.rowTap(e, this.getComponent());
				}

				tap = false;
			});
		}

		if (this.table.options.rowDblTap){

			dblTap = null;

			this.element.addEventListener("touchend", (e) => {
				if(dblTap){
					clearTimeout(dblTap);
					dblTap = null;

					this.table.options.rowDblTap(e, this.getComponent());
				}else{

					dblTap = setTimeout(() => {
						clearTimeout(dblTap);
						dblTap = null;
					}, 300);
				}
			});
		}

		if (this.table.options.rowTapHold){

			tapHold = null;

			this.element.addEventListener("touchstart", (e) => {
				clearTimeout(tapHold);

				tapHold = setTimeout(() => {
					clearTimeout(tapHold);
					tapHold = null;
					tap = false;
					this.table.options.rowTapHold(e, this.getComponent());
				}, 1000);

			}, {passive: true});

			this.element.addEventListener("touchend", (e) => {
				clearTimeout(tapHold);
				tapHold = null;
			});
		}
	}

	generateCells(){
		this.cells = this.table.columnManager.generateCells(this);
	}

	//functions to setup on first render
	initialize(force){
		this.create();

		if(!this.initialized || force){

			this.deleteCells();

			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

			this.dispatch("row-layout-before", this);

			this.generateCells();

			if(this.table.options.virtualDomHoz && this.table.vdomHoz.initialized){
				this.table.vdomHoz.initializeRow(this);
			}else{
				this.cells.forEach((cell) => {
					this.element.appendChild(cell.getElement());
					cell.cellRendered();
				});
			}

			if(force){
				this.normalizeHeight();
			}

			this.dispatch("row-layout", this);

			if(this.table.options.rowFormatter){
				this.table.options.rowFormatter(this.getComponent());
			}

			this.dispatch("row-layout-after", this);

			this.initialized = true;
		}else{
			if(this.table.options.virtualDomHoz){
				this.table.vdomHoz.reinitializeRow(this);
			}
		}
	}

	reinitializeHeight(){
		this.heightInitialized = false;

		if(this.element && this.element.offsetParent !== null){
			this.normalizeHeight(true);
		}
	}

	reinitialize(children){
		this.initialized = false;
		this.heightInitialized = false;

		if(!this.manualHeight){
			this.height = 0;
			this.heightStyled = "";
		}

		if(this.element && this.element.offsetParent !== null){
			this.initialize(true);
		}

		this.dispatch("row-relayout", this);
	}

	//get heights when doing bulk row style calcs in virtual DOM
	calcHeight(force){

		var maxHeight = 0,
		minHeight = this.table.options.resizableRows ? this.element.clientHeight : 0;

		this.cells.forEach(function(cell){
			var height = cell.getHeight();
			if(height > maxHeight){
				maxHeight = height;
			}
		});

		if(force){
			this.height = Math.max(maxHeight, minHeight);
		}else{
			this.height = this.manualHeight ? this.height : Math.max(maxHeight, minHeight);
		}

		this.heightStyled = this.height ? this.height + "px" : "";
		this.outerHeight = this.element.offsetHeight;
	}

	//set of cells
	setCellHeight(){
		this.cells.forEach(function(cell){
			cell.setHeight();
		});

		this.heightInitialized = true;
	}

	clearCellHeight(){
		this.cells.forEach(function(cell){
			cell.clearHeight();
		});
	}

	//normalize the height of elements in the row
	normalizeHeight(force){

		if(force){
			this.clearCellHeight();
		}

		this.calcHeight(force);

		this.setCellHeight();
	}

	//set height of rows
	setHeight(height, force){
		if(this.height != height || force){

			this.manualHeight = true;

			this.height = height;
			this.heightStyled = height ? height + "px" : "";

			this.setCellHeight();

			// this.outerHeight = this.element.outerHeight();
			this.outerHeight = this.element.offsetHeight;
		}
	}

	//return rows outer height
	getHeight(){
		return this.outerHeight;
	}

	//return rows outer Width
	getWidth(){
		return this.element.offsetWidth;
	}

	//////////////// Cell Management /////////////////
	deleteCell(cell){
		var index = this.cells.indexOf(cell);

		if(index > -1){
			this.cells.splice(index, 1);
		}
	}

	//////////////// Data Management /////////////////
	setData(data){
		this.data = this.chain("row-data-init-before", [this, data], data);

		this.dispatch("row-data-init-after", this);
	}

	//update the rows data
	updateData(updatedData){
		var visible = this.element && Helpers.elVisible(this.element),
		tempData = {},
		newRowData;

		return new Promise((resolve, reject) => {

			if(typeof updatedData === "string"){
				updatedData = JSON.parse(updatedData);
			}

			this.dispatch("row-data-save-before", this);

			if(this.subscribed("row-data-changing")){
				tempData = Object.assign(tempData, this.data);
				tempData = Object.assign(tempData, updatedData);
			}

			newRowData = this.chain("row-data-changing", [this, tempData, updatedData], updatedData);

			//set data
			for (var attrname in newRowData) {
				this.data[attrname] = newRowData[attrname];
			}

			this.dispatch("row-data-save-after", this);

			//update affected cells only
			for (var attrname in updatedData) {

				let columns = this.table.columnManager.getColumnsByFieldRoot(attrname);

				columns.forEach((column) => {
					let cell = this.getCell(column.getField());

					if(cell){
						let value = column.getFieldValue(newRowData);
						if(cell.getValue() != value){
							cell.setValueProcessData(value);

							if(visible){
								cell.cellRendered();
							}
						}
					}
				});
			}

			//Partial reinitialization if visible
			if(visible){
				this.normalizeHeight(true);

				if(this.table.options.rowFormatter){
					this.table.options.rowFormatter(this.getComponent());
				}
			}else{
				this.initialized = false;
				this.height = 0;
				this.heightStyled = "";
			}

			this.dispatch("row-data-changed", this, visible, updatedData);

			//this.reinitialize();

			this.dispatchExternal("rowUpdated", this.getComponent());

			if(this.subscribedExternal.subscribed("dataChanged")){
				this.dispatchExternal("dataChanged", this.table.rowManager.getData());
			}

			resolve();
		});
	}

	getData(transform){
		if(transform){
			return this.chain("row-data-retrieve", [this, transform], this.data);
		}

		return this.data;
	}

	getCell(column){
		var match = false;

		column = this.table.columnManager.findColumn(column);

		match = this.cells.find(function(cell){
			return cell.column === column;
		});

		return match;
	}

	getCellIndex(findCell){
		return this.cells.findIndex(function(cell){
			return cell === findCell;
		});
	}

	findCell(subject){
		return this.cells.find((cell) => {
			return cell.element === subject;
		});
	}

	findNextEditableCell(index){
		var nextCell = false;

		if(index < this.cells.length-1){
			for(var i = index+1; i < this.cells.length; i++){
				let cell = this.cells[i];

				if(cell.column.modules.edit && Helpers.elVisible(cell.getElement())){
					let allowEdit = true;

					if(typeof cell.column.modules.edit.check == "function"){
						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if(allowEdit){
						nextCell = cell;
						break;
					}
				}
			}
		}

		return nextCell;
	}

	findPrevEditableCell(index){
		var prevCell = false;

		if(index > 0){
			for(var i = index-1; i >= 0; i--){
				let cell = this.cells[i],
				allowEdit = true;

				if(cell.column.modules.edit && Helpers.elVisible(cell.getElement())){
					if(typeof cell.column.modules.edit.check == "function"){
						allowEdit = cell.column.modules.edit.check(cell.getComponent());
					}

					if(allowEdit){
						prevCell = cell;
						break;
					}
				}
			}
		}

		return prevCell;
	}

	getCells(){
		return this.cells;
	}

	nextRow(){
		var row = this.table.rowManager.nextDisplayRow(this, true);
		return row || false;
	}

	prevRow(){
		var row = this.table.rowManager.prevDisplayRow(this, true);
		return row || false;
	}

	moveToRow(to, before){
		var toRow = this.table.rowManager.findRow(to);

		if(toRow){
			this.table.rowManager.moveRowActual(this, toRow, !before);
			this.table.rowManager.refreshActiveData("display", false, true);
		}else{
			console.warn("Move Error - No matching row found:", to);
		}
	}

	validate(){
		var invalid = [];

		this.cells.forEach(function(cell){
			if(!cell.validate()){
				invalid.push(cell.getComponent());
			}
		});

		return invalid.length ? invalid : true;
	}

	///////////////////// Actions  /////////////////////
	delete(){
		return new Promise((resolve, reject) => {
			this.dispatch("row-delete", this);

			this.deleteActual();

			resolve();
		});
	}

	deleteActual(blockRedraw){
		var index = this.table.rowManager.getRowIndex(this);

		this.detatchModules();

		this.table.rowManager.deleteRow(this, blockRedraw);

		this.deleteCells();

		this.initialized = false;
		this.heightInitialized = false;
		this.element = false;

		this.dispatch("row-deleted", this);
	}

	detatchModules(){
		this.dispatch("row-deleting", this);
	}

	deleteCells(){
		var cellCount = this.cells.length;

		for(let i = 0; i < cellCount; i++){
			this.cells[0].delete();
		}
	}

	wipe(){
		this.detatchModules();
		this.deleteCells();

		if(this.element){
			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

			if(this.element.parentNode){
				this.element.parentNode.removeChild(this.element);
			}
		}

		this.element = false;
		this.modules = {};
	}

	getGroup(){
		return this.modules.group || false;
	}

	//////////////// Object Generation /////////////////
	getComponent(){
		if(!this.component){
			this.component = new RowComponent(this);
		}

		return this.component;
	}
}