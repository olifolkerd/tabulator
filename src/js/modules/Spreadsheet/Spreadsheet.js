import Module from '../../core/Module.js';


export default class Spreadsheet extends Module{
	
	static moduleName = "spreadsheet";
	
	constructor(table){
		super(table);
		
		this.registerTableOption("spreadsheet", false); 
	}
	
	
	initialize(){
		
		if(this.options("spreadsheet")){
			console.log("Woop! Spreadsheets");
		}
	}
}