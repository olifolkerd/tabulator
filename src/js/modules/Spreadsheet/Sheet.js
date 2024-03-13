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
		
		this.grid = new GridCalculator(this.columnCount, this.rowCount);
		
		this.defaultColumnDefinition = {width:100, headerHozAlign:"center", headerSort:false};
		this.columnDefinition = Object.assign(this.defaultColumnDefinition, this.options("spreadsheetDefinition"));
		
		this.columnDefs = [];
		this.rowDefs = [];
		this.columnFields = [];
		this.columns = [];
		this.rows = [];
		
		this.initialize();
	}

	///////////////////////////////////
	///////// Initialization //////////
	///////////////////////////////////
	
	initialize(){
		this.initializeElement();
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
		var refs = this.grid.genRows(this.data);

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
		this.data = this.getData(true);
		this.element.classList.remove("tabulator-spreadsheet-tab-active")
	}
	
	load(){
		this.table.blockRedraw();
		this.table.setData([]);
		this.table.setColumns(this.columnDefs);
		this.table.setData(this.rowDefs);
		this.table.restoreRedraw();
		
		this.element.classList.add("tabulator-spreadsheet-tab-active")
	}

	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////

	getComponent(){
		return new SheetComponent(this);
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
		this.initialize();

		if(this.spreadsheetManager.activeSheet === this){
			this.load();
		}
	}

}