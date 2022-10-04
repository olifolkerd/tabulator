import CoreFeature from '../CoreFeature.js';
import RowComponent from './RowComponent.js';
import Helpers from '../tools/Helpers.js';

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
		this.heightStyled = ""; //hold element height pre-styled to improve render efficiency
		this.manualHeight = false; //user has manually set row height
		this.outerHeight = 0; //hold elements outer height
		this.initialized = false; //element has been rendered
		this.heightInitialized = false; //element has resized cells to fit
		this.position = 0; //store position of element in row list
		this.positionWatchers = [];
		
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
		this.createElement();
		this.dispatch("row-init", this);
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
			
			this.initialized = true;
			
			this.table.columnManager.renderer.renderRowCells(this);
			
			if(force){
				this.normalizeHeight();
			}
			
			this.dispatch("row-layout", this);
			
			if(this.table.options.rowFormatter){
				this.table.options.rowFormatter(this.getComponent());
			}
			
			this.dispatch("row-layout-after", this);
		}else{
			this.table.columnManager.renderer.rerenderRowCells(this);
		}
	}
	
	reinitializeHeight(){
		this.heightInitialized = false;
		
		if(this.element && this.element.offsetParent !== null){
			this.normalizeHeight(true);
		}
	}

	deinitialize(){
		this.initialized = false;
	}
	
	deinitializeHeight(){
		this.heightInitialized = false;
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
		minHeight;
		
		if(this.table.options.rowHeight){
			this.height = this.table.options.rowHeight;
		}else{
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
		if(force && !this.table.options.rowHeight){
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
		this.data = this.chain("row-data-init-before", [this, data], undefined, data);
		
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
			
			newRowData = this.chain("row-data-changing", [this, tempData, updatedData], null, updatedData);
			
			//set data
			for (let attrname in newRowData) {
				this.data[attrname] = newRowData[attrname];
			}
			
			this.dispatch("row-data-save-after", this);
			
			//update affected cells only
			for (let attrname in updatedData) {
				
				let columns = this.table.columnManager.getColumnsByFieldRoot(attrname);
				
				columns.forEach((column) => {
					let cell = this.getCell(column.getField());
					
					if(cell){
						let value = column.getFieldValue(newRowData);
						if(cell.getValue() !== value){
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
			
			if(this.subscribedExternal("dataChanged")){
				this.dispatchExternal("dataChanged", this.table.rowManager.getData());
			}
			
			resolve();
		});
	}
	
	getData(transform){
		if(transform){
			return this.chain("row-data-retrieve", [this, transform], null, this.data);
		}
		
		return this.data;
	}
	
	getCell(column){
		var match = false;
		
		column = this.table.columnManager.findColumn(column);
		
		if(!this.initialized){
			this.generateCells();
		}
		
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
	
	getCells(){
		if(!this.initialized){
			this.generateCells();
		}
		
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
	
	///////////////////// Actions  /////////////////////
	delete(){
		this.dispatch("row-delete", this);
		
		this.deleteActual();
		
		return Promise.resolve();
	}
	
	deleteActual(blockRedraw){
		this.detachModules();
		
		this.table.rowManager.deleteRow(this, blockRedraw);
		
		this.deleteCells();
		
		this.initialized = false;
		this.heightInitialized = false;
		this.element = false;
		
		this.dispatch("row-deleted", this);
	}
	
	detachModules(){
		this.dispatch("row-deleting", this);
	}
	
	deleteCells(){
		var cellCount = this.cells.length;
		
		for(let i = 0; i < cellCount; i++){
			this.cells[0].delete();
		}
	}
	
	wipe(){
		this.detachModules();
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

	isDisplayed(){
		return this.table.rowManager.getDisplayRows().includes(this);
	}

	getPosition(){
		return this.isDisplayed() ? this.position : false;
	}

	setPosition(position){
		if(position != this.position){
			this.position = position;

			this.positionWatchers.forEach((callback) => {
				callback(this.position);
			});
		}
	}

	watchPosition(callback){
		this.positionWatchers.push(callback);

		callback(this.position);
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