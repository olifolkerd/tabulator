import Module from '../../core/Module.js';

class HtmlTableImport extends Module{

	constructor(table){
		super(table);

		this.fieldIndex = [];
		this.hasIndex = false;
	}

	parseTable(){
		var element = this.table.element,
		options = this.table.options,
		columns = options.columns,
		headers = element.getElementsByTagName("th"),
		rows = element.getElementsByTagName("tbody")[0],
		data = [],
		newTable;

		this.hasIndex = false;

		this.table.options.htmlImporting.call(this.table);

		rows = rows ? rows.getElementsByTagName("tr") : [];

		//check for tablator inline options
		this._extractOptions(element, options);

		if(headers.length){
			this._extractHeaders(headers, rows);
		}else{
			this._generateBlankHeaders(headers, rows);
		}

		//iterate through table rows and build data set
		for(var index = 0; index < rows.length; index++){
			var row = rows[index],
			cells = row.getElementsByTagName("td"),
			item = {};

			//create index if the dont exist in table
			if(!this.hasIndex){
				item[options.index] = index;
			}

			for(var i = 0; i < cells.length; i++){
				var cell = cells[i];
				if(typeof this.fieldIndex[i] !== "undefined"){
					item[this.fieldIndex[i]] = cell.innerHTML;
				}
			}

			//add row data to item
			data.push(item);
		}

		//create new element
		var newElement = document.createElement("div");

		//transfer attributes to new element
		var attributes = element.attributes;

		// loop through attributes and apply them on div

		for(var i in attributes){
			if(typeof attributes[i] == "object"){
				newElement.setAttribute(attributes[i].name, attributes[i].value);
			}
		}

		// replace table with div element
		element.parentNode.replaceChild(newElement, element);

		options.data = data;

		this.table.options.htmlImported.call(this.table);

		this.table.element = newElement;
	}

	//extract tabulator attribute options
	_extractOptions(element, options, defaultOptions){
		var attributes = element.attributes;
		var optionsArr = defaultOptions ? Object.assign([], defaultOptions) : Object.keys(options);
		var optionsList = {};

		optionsArr.forEach((item) => {
			optionsList[item.toLowerCase()] = item;
		});

		for(var index in attributes){
			var attrib = attributes[index];
			var name;

			if(attrib && typeof attrib == "object" && attrib.name && attrib.name.indexOf("tabulator-") === 0){
				name = attrib.name.replace("tabulator-", "");

				if(typeof optionsList[name] !== "undefined"){
					options[optionsList[name]] = this._attribValue(attrib.value);
				}
			}
		}
	}

	//get value of attribute
	_attribValue(value){
		if(value === "true"){
			return true;
		}

		if(value === "false"){
			return false;
		}

		return value;
	}

	//find column if it has already been defined
	_findCol(title){
		var match = this.table.options.columns.find((column) => {
			return column.title === title;
		});

		return match || false;
	}

	//extract column from headers
	_extractHeaders(headers, rows){
		for(var index = 0; index < headers.length; index++){
			var header = headers[index],
			exists = false,
			col = this._findCol(header.textContent),
			width, attributes;

			if(col){
				exists = true;
			}else{
				col = {title:header.textContent.trim()};
			}

			if(!col.field) {
				col.field = header.textContent.trim().toLowerCase().replace(" ", "_");
			}

			width = header.getAttribute("width");

			if(width && !col.width)	{
				col.width = width;
			}

			//check for tablator inline options
			attributes = header.attributes;

			// //check for tablator inline options
			this._extractOptions(header, col, Column.prototype.defaultOptionList);

			this.fieldIndex[index] = col.field;

			if(col.field == this.table.options.index){
				this.hasIndex = true;
			}

			if(!exists){
				this.table.options.columns.push(col);
			}

		}
	}

	//generate blank headers
	_generateBlankHeaders(headers, rows){
		for(var index = 0; index < headers.length; index++){
			var header = headers[index],
			col = {title:"", field:"col" + index};

			this.fieldIndex[index] = col.field;

			var width = header.getAttribute("width");

			if(width){
				col.width = width;
			}

			this.table.options.columns.push(col);
		}
	}
}

HtmlTableImport.moduleName = "htmlTableImport";

export default HtmlTableImport;