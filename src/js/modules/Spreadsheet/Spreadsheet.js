import Module from '../../core/Module.js';
import Sheet from "./Sheet";
import SheetComponent from "./SheetComponent";

export default class Spreadsheet extends Module{
	
	static moduleName = "spreadsheet";
	
	constructor(table){
		super(table);
		
		this.sheets = [];
		this.element = null;
		
		this.registerTableOption("spreadsheet", false); 
		this.registerTableOption("spreadsheetRows", 50); 
		this.registerTableOption("spreadsheetColumns", 50); 
		this.registerTableOption("spreadsheetColumnDefinition", {}); 
		this.registerTableOption("spreadsheetOutputFull", false); 
		this.registerTableOption("spreadsheetData", false); 
		this.registerTableOption("spreadsheetSheets", false); 
		this.registerTableOption("spreadsheetSheetTabs", false); 
		this.registerTableOption("spreadsheetSheetTabsElement", false); 
		
		this.registerTableFunction("setSheets", this.setSheets.bind(this));
		this.registerTableFunction("addSheet", this.addSheet.bind(this));
		this.registerTableFunction("getSheets", this.getSheets.bind(this));
		this.registerTableFunction("getSheetDefinitions", this.getSheetDefinitions.bind(this));
		this.registerTableFunction("setSheetData", this.setSheetData.bind(this));
		this.registerTableFunction("getSheet", this.getSheet.bind(this));
		this.registerTableFunction("getSheetData", this.getSheetData.bind(this));
		this.registerTableFunction("clearSheet", this.clearSheet.bind(this));
		this.registerTableFunction("removeSheet", this.removeSheetFunc.bind(this));
		this.registerTableFunction("activeSheet", this.activeSheetFunc.bind(this));
	}
	
	///////////////////////////////////
	////// Module Initialization //////
	///////////////////////////////////
	
	
	initialize(){
		if(this.options("spreadsheet")){	
			this.subscribe("table-initialized", this.tableInitialized.bind(this));
			this.subscribe("data-loaded", this.loadRemoteData.bind(this));
			
			this.table.options.index = "_id";
			
			if(this.options("spreadsheetData") && this.options("spreadsheetSheets")){
				console.warn("You cannot use spreadsheetData and spreadsheetSheets at the same time, ignoring spreadsheetData");
				
				this.table.options.spreadsheetData = false;
			}
			
			this.compatibilityCheck();
			
			if(this.options("spreadsheetSheetTabs")){
				this.initializeTabset();
			}
		}
	}
	
	compatibilityCheck(){
		if(this.options("data")){
			console.warn("Do not use the data option when working with spreadsheets, use either spreadsheetData or spreadsheetSheets to pass data into the table");
		}
		
		if(this.options("pagination")){
			console.warn("The spreadsheet module is not compatible with the pagination module");
		}
		
		if(this.options("groupBy")){
			console.warn("The spreadsheet module is not compatible with the row grouping module");
		}
		
		if(this.options("responsiveCollapse")){
			console.warn("The spreadsheet module is not compatible with the responsive collapse module");
		}
	}
	initializeTabset(){
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-spreadsheet-tabs");
		var altContainer = this.options("spreadsheetSheetTabsElement");
		
		if(altContainer && !(altContainer instanceof HTMLElement)){
			altContainer = document.querySelector(altContainer);
			
			if(!altContainer){
				console.warn("Unable to find element matching spreadsheetSheetTabsElement selector:", this.options("spreadsheetSheetTabsElement"));
			}
		}
		
		if(altContainer){
			altContainer.appendChild(this.element);
		}else{
			this.footerAppend(this.element);
		}
	}
	
	tableInitialized(){
		if(this.sheets.length){
			this.loadSheet(this.sheets[0]);
		}else{
			
			if(this.options("spreadsheetSheets")){
				this.loadSheets(this.options("spreadsheetSheets"));
			}else if(this.options("spreadsheetData")){
				this.loadData(this.options("spreadsheetData"));
			}
		}
	}

	///////////////////////////////////
	/////////// Ajax Parsing //////////
	///////////////////////////////////

	loadRemoteData(data, data1, data2){
		console.log("data", data, data1, data2);

		if(Array.isArray(data)){

			this.table.dataLoader.clearAlert();
			this.dispatchExternal("dataLoaded", data);

			if(!data.length || Array.isArray(data[0])){
				this.loadData(data);
			}else{
				this.loadSheets(data);
			}
		}else{
			console.error("Spreadsheet Loading Error - Unable to process remote data due to invalid data type \nExpecting: array \nReceived: ", typeof data, "\nData:     ", data);
		}

		return false;
	}

	///////////////////////////////////
	///////// Sheet Management ////////
	///////////////////////////////////
	
	
	loadData(data){
		var def = {
			data:data,
		};
		
		this.loadSheet(this.newSheet(def));
	}
	
	destroySheets(){
		this.sheets.forEach((sheet) => {
			sheet.destroy();
		});
		
		this.sheets = [];
		this.activeSheet = null;
	}
	
	loadSheets(sheets){	
		if(!Array.isArray(sheets)){
			sheets = [];
		}
		
		this.destroySheets();
		
		sheets.forEach((def) => {
			this.newSheet(def);
		});
		
		this.loadSheet(this.sheets[0]);
	}
	
	loadSheet(sheet){
		if(this.activeSheet !== sheet){
			if(this.activeSheet){
				this.activeSheet.unload();
			}
			
			this.activeSheet = sheet;
			
			sheet.load();
		}
	}
	
	newSheet(definition = {}){
		var sheet;
		
		if(!definition.rows){
			definition.rows = this.options("spreadsheetRows");
		}
		
		if(!definition.columns){
			definition.columns = this.options("spreadsheetColumns");
		}
		
		sheet = new Sheet(this, definition);
		
		this.sheets.push(sheet);
		
		if(this.element){
			this.element.appendChild(sheet.element);
		}
		
		return sheet;
	}
	
	removeSheet(sheet){
		var index = this.sheets.indexOf(sheet),
		prevSheet;
		
		if(this.sheets.length > 1){
			if(index > -1){
				this.sheets.splice(index, 1);
				sheet.destroy();
				
				if(this.activeSheet === sheet){
					
					prevSheet = this.sheets[index - 1] || this.sheets[0];
					
					if(prevSheet){
						this.loadSheet(prevSheet);
					}else{
						this.activeSheet = null;
					}
				}
			}
		}else{
			console.warn("Unable to remove sheet, at least one sheet must be active");
		}
	}
	
	lookupSheet(key){
		if(!key){
			return this.activeSheet;
		}else if(key instanceof Sheet){
			return key;
		}else if(key instanceof SheetComponent){
			return key._sheet;
		}else{
			return this.sheets.find(sheet => sheet.key === key) || false;
		}
	}
	
	
	///////////////////////////////////
	//////// Public Functions /////////
	///////////////////////////////////
	
	setSheets(sheets){
		this.loadSheets(sheets);

		return this.getSheets();
	}

	addSheet(sheet){
		return this.newSheet(sheet).getComponent();
	}
	
	getSheetDefinitions(){
		return this.sheets.map(sheet => sheet.getDefinition());
	}
	
	getSheets(){
		return this.sheets.map(sheet => sheet.getComponent());
	}
	
	getSheet(key){
		var sheet = this.lookupSheet(key);
		
		return sheet ? sheet.getComponent() : false;
	}
	
	setSheetData(key, data){
		if (key && !data){
			data = key;
			key = false;
		}
		
		var sheet = this.lookupSheet(key);
		
		return sheet ? sheet.setData(data) : false;	
	}
	
	getSheetData(key){
		var sheet = this.lookupSheet(key);
		
		return sheet ? sheet.getData() : false;	
	}
	
	clearSheet(key){
		var sheet = this.lookupSheet(key);
		
		return sheet ? sheet.clear() : false;
	}
	
	removeSheetFunc(key){
		var sheet = this.lookupSheet(key);
		
		if(sheet){
			this.removeSheet(sheet);
		}
	}
	
	activeSheetFunc(key){
		var sheet = this.lookupSheet(key);
		
		return sheet ? this.loadSheet(sheet) : false;
	}
}