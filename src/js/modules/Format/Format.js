import Module from '../../core/Module.js';

import defaultFormatters from './defaults/formatters.js';

class Format extends Module{

	static moduleName = "format";

	//load defaults
	static formatters = defaultFormatters;

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

			if(formatter === "tick"){
				formatter = "tickCross";

				if(typeof config.params.crossElement == "undefined"){
					config.params.crossElement = false;
				}

				console.warn("DEPRECATION WARNING - the tick formatter has been deprecated, please use the tickCross formatter with the crossElement param set to false");
			}

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
			params = typeof formatter.params === "function" ? formatter.params(component) : formatter.params;

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

			return String(value).replace(/[&<>"'`=\/]/g, function (s) {
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
		var formatter;

		switch(typeof formatter){
			case "string":
			if(Format.formatters[formatter]){
				formatter = Format.formatters[formatter]
			}else{
				console.warn("Formatter Error - No such formatter found: ", formatter);
				formatter = Format.formatters.plaintext;
			}
			break;

			case "function":
			formatter = formatter;
			break;

			default:
			formatter = Format.formatters.plaintext;
			break;
		}

		return formatter;
	}
}

// Tabulator.registerModule("format", Format);
export default Format;