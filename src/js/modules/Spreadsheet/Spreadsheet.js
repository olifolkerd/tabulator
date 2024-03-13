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
		
		this.registerTableFunction("getSheets", this.getSheets.bind(this));
		this.registerTableFunction("getSheet", this.getSheet.bind(this));
		this.registerTableFunction("getSheetData", this.getSheetData.bind(this));
		this.registerTableFunction("setSheetData", this.setSheetData.bind(this));
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
				this.loadSheets();
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
	
	loadSheets(){
		var sheets = this.options("spreadsheetSheets");
		
		if(!Array.isArray(sheets)){
			sheets = [];
		}
		
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
	
	
	///////////////////////////////////
	//////// Public Functions /////////
	///////////////////////////////////
	
	getSheets(){
		return this.sheets.map(sheet => sheet.getComponent());
	}
	
	getSheet(title){
		return this.activeSheet.getComponent();
	}
	
	getSheetData(title){
		return this.activeSheet.getData();	
	}
	
	setSheetData(data){
		return this.activeSheet.setData(data);	
	}
}