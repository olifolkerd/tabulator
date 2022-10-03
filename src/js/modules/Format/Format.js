import Module from '../../core/Module.js';

import defaultFormatters from './defaults/formatters.js';

class Format extends Module{
	
	constructor(table){
		super(table);
		
		this.registerColumnOption("formatter");
		this.registerColumnOption("formatterParams");
		
		this.registerColumnOption("formatterPrint");
		this.registerColumnOption("formatterPrintParams");
		this.registerColumnOption("formatterClipboard");
		this.registerColumnOption("formatterClipboardParams");
		this.registerColumnOption("formatterHtmlOutput");
		this.registerColumnOption("formatterHtmlOutputParams");
		this.registerColumnOption("titleFormatter");
		this.registerColumnOption("titleFormatterParams");
	}
	
	initialize(){
		this.subscribe("cell-format", this.formatValue.bind(this));
		this.subscribe("cell-rendered", this.cellRendered.bind(this));
		this.subscribe("column-layout", this.initializeColumn.bind(this));
		this.subscribe("column-format", this.formatHeader.bind(this));
	}
	
	//initialize column formatter
	initializeColumn(column){
		column.modules.format = this.lookupFormatter(column, "");
		
		if(typeof column.definition.formatterPrint !== "undefined"){
			column.modules.format.print = this.lookupFormatter(column, "Print");
		}
		
		if(typeof column.definition.formatterClipboard !== "undefined"){
			column.modules.format.clipboard = this.lookupFormatter(column, "Clipboard");
		}
		
		if(typeof column.definition.formatterHtmlOutput !== "undefined"){
			column.modules.format.htmlOutput = this.lookupFormatter(column, "HtmlOutput");
		}
	}
	
	lookupFormatter(column, type){
		var config = {params:column.definition["formatter" + type + "Params"] || {}},
		formatter = column.definition["formatter" + type];
		
		//set column formatter
		switch(typeof formatter){
			case "string":
				if(Format.formatters[formatter]){
					config.formatter = Format.formatters[formatter];
				}else{
					console.warn("Formatter Error - No such formatter found: ", formatter);
					config.formatter = Format.formatters.plaintext;
				}
				break;
			
			case "function":
				config.formatter = formatter;
				break;
			
			default:
				config.formatter = Format.formatters.plaintext;
				break;
		}
		
		return config;
	}
	
	cellRendered(cell){
		if(cell.modules.format && cell.modules.format.renderedCallback && !cell.modules.format.rendered){
			cell.modules.format.renderedCallback();
			cell.modules.format.rendered = true;
		}
	}
	
	//return a formatted value for a column header
	formatHeader(column, title, el){
		var formatter, params, onRendered, mockCell;
		
		if(column.definition.titleFormatter){
			formatter = this.getFormatter(column.definition.titleFormatter);
			
			onRendered = (callback) => {
				column.titleFormatterRendered = callback;
			};
			
			mockCell = {
				getValue:function(){
					return title;
				},
				getElement:function(){
					return el;
				},
				getColumn:function(){
					return column.getComponent();
				},
				getTable:() => {
					return this.table;
				}
			};
			
			params = column.definition.titleFormatterParams || {};
			
			params = typeof params === "function" ? params() : params;
			
			return formatter.call(this, mockCell, params, onRendered);
		}else{
			return title;
		}
	}
	
	
	//return a formatted value for a cell
	formatValue(cell){
		var component = cell.getComponent(),
		params = typeof cell.column.modules.format.params === "function" ? cell.column.modules.format.params(component) : cell.column.modules.format.params;
		
		function onRendered(callback){
			if(!cell.modules.format){
				cell.modules.format = {};
			}
			
			cell.modules.format.renderedCallback = callback;
			cell.modules.format.rendered = false;
		}
		
		return cell.column.modules.format.formatter.call(this, component, params, onRendered);
	}
	
	formatExportValue(cell, type){
		var formatter = cell.column.modules.format[type],
		params;
		
		if(formatter){
			params = typeof formatter.params === "function" ? formatter.params(cell.getComponent()) : formatter.params;
			
			function onRendered(callback){
				if(!cell.modules.format){
					cell.modules.format = {};
				}
				
				cell.modules.format.renderedCallback = callback;
				cell.modules.format.rendered = false;
			}
			
			return formatter.formatter.call(this, cell.getComponent(), params, onRendered);
			
		}else{
			return this.formatValue(cell);
		}
	}
	
	sanitizeHTML(value){
		if(value){
			var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
			};
			
			return String(value).replace(/[&<>"'`=/]/g, function (s) {
				return entityMap[s];
			});
		}else{
			return value;
		}
	}
	
	emptyToSpace(value){
		return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
	}
	
	//get formatter for cell
	getFormatter(formatter){
		switch(typeof formatter){
			case "string":
				if(Format.formatters[formatter]){
					formatter = Format.formatters[formatter];
				}else{
					console.warn("Formatter Error - No such formatter found: ", formatter);
					formatter = Format.formatters.plaintext;
				}
				break;
			
			case "function":
			//Custom formatter Function, do nothing
				break;
			
			default:
				formatter = Format.formatters.plaintext;
				break;
		}
		
		return formatter;
	}
}

Format.moduleName = "format";

//load defaults
Format.formatters = defaultFormatters;

export default Format;