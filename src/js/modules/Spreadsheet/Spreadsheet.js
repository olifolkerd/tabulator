import Module from '../../core/Module.js';
import Sheet from "./Sheet";

export default class Spreadsheet extends Module{
	
	static moduleName = "spreadsheet";
	
	constructor(table){
		super(table);
		
		this.sheets = [];
		
		this.registerTableOption("spreadsheet", false); 
		this.registerTableOption("spreadsheetRows", 50); 
		this.registerTableOption("spreadsheetColumns", 50); 
		this.registerTableOption("spreadsheetDefinition", {}); 
		this.registerTableOption("spreadsheetOutputFull", false); 

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
		}
	}
	
	tableInitialized(){
		var def = {};
		
		if(this.sheets.length){
			this.loadSheet(this.sheets[0]);
		}else{
			
			if(this.options("spreadsheetData")){
				def.data = this.options("spreadsheetData");
			}

			this.loadSheet(this.newSheet(def));
		}
	}
	
	loadSheet(sheet){
		if(this.activeSheet){
			this.activeSheet.hide();
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
		
		return sheet;
	}


	///////////////////////////////////
	//////// Public Functions /////////
	///////////////////////////////////

	getSheet(title){
		return this.sheets[0].getComponent();
	}

	getSheetData(title){
		return this.sheets[0].getData();	
	}
}