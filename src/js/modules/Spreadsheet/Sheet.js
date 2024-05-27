import CoreFeature from '../../core/CoreFeature.js';
import GridCalculator from "./GridCalculator";
import SheetComponent from "./SheetComponent";

export default class Sheet extends CoreFeature{
	constructor(spreadsheetManager, definition) {
		super(spreadsheetManager.table);
		
		this.spreadsheetManager = spreadsheetManager;
		this.definition = definition;
		
		this.title = this.definition.title || "";
		this.key = this.definition.key || this.definition.title;
		this.rowCount = this.definition.rows;
		this.columnCount = this.definition.columns;
		this.data = this.definition.data || [];
		this.element = null;
		this.isActive = false;
		
		this.grid = new GridCalculator(this.columnCount, this.rowCount);
		
		this.defaultColumnDefinition = {width:100, headerHozAlign:"center", headerSort:false};
		this.columnDefinition = Object.assign(this.defaultColumnDefinition, this.options("spreadsheetColumnDefinition"));
		
		this.columnDefs = [];
		this.rowDefs = [];
		this.columnFields = [];
		this.columns = [];
		this.rows = [];
		
		this.scrollTop = null;
		this.scrollLeft = null;
		
		this.initialize();
		
		this.dispatchExternal("sheetAdded", this.getComponent());
	}
	
	///////////////////////////////////
	///////// Initialization //////////
	///////////////////////////////////
	
	initialize(){
		this.initializeElement();
		this.initializeColumns();
		this.initializeRows();
	}
	
	reinitialize(){
		this.initializeColumns();
		this.initializeRows();
	}
	
	initializeElement(){
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-spreadsheet-tab");
		this.element.innerText = this.title;
		
		this.element.addEventListener("click", () => {
			this.spreadsheetManager.loadSheet(this);
		});
	}
	
	initializeColumns(){
		this.grid.setColumnCount(this.columnCount);
		this.columnFields = this.grid.genColumns(this.data);
		
		this.columnDefs = [];
		
		this.columnFields.forEach((ref) => {
			var def = Object.assign({}, this.columnDefinition);
			def.field = ref;
			def.title = ref;
			
			this.columnDefs.push(def);
		});
	}
	
	initializeRows(){
		var refs;
		
		this.grid.setRowCount(this.rowCount);
		
		refs = this.grid.genRows(this.data);
		
		this.rowDefs = [];
		
		refs.forEach((ref, i) => {
			var def = {"_id":ref};
			var data = this.data[i];
			
			if(data){
				data.forEach((val, j) => {
					var field = this.columnFields[j];
					
					if(field){
						def[field] = val;
					}
				});
			}
			
			this.rowDefs.push(def);
		});
	}
	
	unload(){
		this.isActive = false;
		this.scrollTop = this.table.rowManager.scrollTop;
		this.scrollLeft = this.table.rowManager.scrollLeft;
		this.data = this.getData(true);
		this.element.classList.remove("tabulator-spreadsheet-tab-active");
	}
	
	load(){
		
		var wasInactive = !this.isActive;
		
		this.isActive = true;
		this.table.blockRedraw();
		this.table.setData([]);
		this.table.setColumns(this.columnDefs);
		this.table.setData(this.rowDefs);
		this.table.restoreRedraw();
		
		if(wasInactive && this.scrollTop !== null){
			this.table.rowManager.element.scrollLeft = this.scrollLeft;
			this.table.rowManager.element.scrollTop = this.scrollTop;
		}
		
		this.element.classList.add("tabulator-spreadsheet-tab-active");
		
		this.dispatchExternal("sheetLoaded", this.getComponent());
	}
	
	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////
	
	getComponent(){
		return new SheetComponent(this);
	}
	
	getDefinition(){
		return {
			title:this.title,
			key:this.key,
			rows:this.rowCount,
			columns:this.columnCount,
			data:this.getData(),
		};
	}
	
	getData(full){
		var output = [], 
		rowWidths,
		outputWidth, outputHeight;
		
		//map data to array format
		this.rowDefs.forEach((rowData) => {
			var row = [];
			
			this.columnFields.forEach((field) => {
				row.push(rowData[field]);
			});
			
			output.push(row);
		});
		
		//trim output
		if(!full && !this.options("spreadsheetOutputFull")){
			
			//calculate used area of data
			rowWidths = output.map(row => row.findLastIndex(val => typeof val !== 'undefined') + 1);
			outputWidth = Math.max(...rowWidths);
			outputHeight = rowWidths.findLastIndex(width => width > 0) + 1;
			
			output = output.slice(0, outputHeight);
			output = output.map(row => row.slice(0, outputWidth));
		}
		
		return output;
	}
	
	setData(data){
		this.data = data;
		this.reinitialize();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	clear(){
		this.setData([]);
	}
	
	setTitle(title){
		this.title = title;
		this.element.innerText = title;
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
	}
	
	setRows(rows){
		this.rowCount = rows;
		this.initializeRows();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	setColumns(columns){
		this.columnCount = columns;
		this.reinitialize();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	remove(){
		this.spreadsheetManager.removeSheet(this);
	}
	
	destroy(){
		if(this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
		
		this.dispatchExternal("sheetRemoved", this.getComponent());
	}
	
	active(){
		this.spreadsheetManager.loadSheet(this);
	}
}