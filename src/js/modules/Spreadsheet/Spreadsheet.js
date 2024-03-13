import Module from '../../core/Module.js';
import Sheet from "./Sheet";

export default class Spreadsheet extends Module{
	
	static moduleName = "spreadsheet";
	
	constructor(table){
		super(table);
		
		this.sheets = [];
		this.element = null;
		
		this.registerTableOption("spreadsheet", false); 
		this.registerTableOption("spreadsheetRows", 50); 
		this.registerTableOption("spreadsheetColumns", 50); 
		this.registerTableOption("spreadsheetDefinition", {}); 
		this.registerTableOption("spreadsheetOutputFull", false); 
		this.registerTableOption("spreadsheetData", false); 
		this.registerTableOption("spreadsheetSheets", false); 
		this.registerTableOption("spreadsheetSheetTabs", false); 
		
		this.registerTableFunction("setSheets", this.setSheets.bind(this));
		this.registerTableFunction("getSheets", this.getSheets.bind(this));
		this.registerTableFunction("setSheetData", this.setSheetData.bind(this));
		this.registerTableFunction("getSheet", this.getSheet.bind(this));
		this.registerTableFunction("getSheetData", this.getSheetData.bind(this));
	}
	
	///////////////////////////////////
	////// Module Initialization //////
	///////////////////////////////////
	
	
	initialize(){
		if(this.options("spreadsheet")){	
			this.subscribe("table-initialized", this.tableInitialized.bind(this));
			
			this.table.options.index = "_id";
			
			if(this.options("spreadsheetData") && this.options("spreadsheetSheets")){
				console.warn("You cannot use spreadsheetData and spreadsheetSheets at the same time, ignoring spreadsheetData");
				
				this.table.options.spreadsheetData = false;
			}
			
			if(this.options("spreadsheetSheetTabs")){
				this.initializeTabset();
			}
		}
	}
	
	initializeTabset(){
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-spreadsheet-tabs");
		
		this.footerAppend(this.element);
	}
	
	tableInitialized(){
		if(this.sheets.length){
			this.loadSheet(this.sheets[0]);
		}else{
			
			if(this.options("spreadsheetSheets")){
				this.loadSheets(this.options("spreadsheetSheets"));
			}else if(this.options("spreadsheetData")){
				this.loadData();
			}
		}
	}
	
	loadData(){
		var def = {
			data:this.options("spreadsheetData")
		};
		
		this.loadSheet(this.newSheet(def));
	}

	destroySheets(){
		this.sheets.forEach((sheet) => {
			sheet.destroy();
			console.log("sheettt", sheet.key)
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
		if(this.activeSheet){
			this.activeSheet.unload();
		}
		
		this.activeSheet = sheet;
		
		sheet.load();
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

	lookupSheet(key){
		if(!key){
			return this.activeSheet;
		}else{
			return this.sheets.find(sheet => sheet.key === key) || false;
		}
	}
	
	
	///////////////////////////////////
	//////// Public Functions /////////
	///////////////////////////////////

	setSheets(sheets){
		this.loadSheets(sheets);
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
}