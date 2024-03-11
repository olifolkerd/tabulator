import Module from '../../core/Module.js';

export default class HtmlTableImport extends Module{

	static moduleName = "htmlTableImport";

	constructor(table){
		super(table);

		this.fieldIndex = [];
		this.hasIndex = false;
	}

	initialize(){
		this.tableElementCheck();
	}

	tableElementCheck(){
		if(this.table.originalElement && this.table.originalElement.tagName === "TABLE"){
			if(this.table.originalElement.childNodes.length){
				this.parseTable();
			}else{
				console.warn("Unable to parse data from empty table tag, Tabulator should be initialized on a div tag unless importing data from a table element.");
			}
		}
	}

	parseTable(){
		var element = this.table.originalElement,
		options = this.table.options,
		headers = element.getElementsByTagName("th"),
		rows = element.getElementsByTagName("tbody")[0],
		data = [];

		this.hasIndex = false;

		this.dispatchExternal("htmlImporting");

		rows = rows ? rows.getElementsByTagName("tr") : [];

		//check for Tabulator inline options
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

			//create index if the don't exist in table
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

		options.data = data;

		this.dispatchExternal("htmlImported");
	}

	//extract tabulator attribute options
	_extractOptions(element, options, defaultOptions){
		var attributes = element.attributes;
		var optionsArr = defaultOptions ? Object.keys(defaultOptions) : Object.keys(options);
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
			width;

			if(col){
				exists = true;
			}else{
				col = {title:header.textContent.trim()};
			}

			if(!col.field) {
				col.field = header.textContent.trim().toLowerCase().replaceAll(" ", "_");
			}

			width = header.getAttribute("width");

			if(width && !col.width)	{
				col.width = width;
			}

			//check for Tabulator inline options
			this._extractOptions(header, col, this.table.columnManager.optionsList.registeredDefaults);

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