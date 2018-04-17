var HtmlTableImport = function(table){
	this.table = table; //hold Tabulator object
	this.hasIndex = false;
};

HtmlTableImport.prototype.parseTable = function(){
	var self = this,
	element = self.table.element,
	options = self.table.options,
	columns = options.columns,
	headers = $("th", element),
	rows = $("tbody tr", element),
	data = [];

	self.hasIndex = false;

	self.table.options.htmlImporting();

	//check for tablator inline options
	self._extractOptions(element, options);

	if(headers.length){
		self._extractHeaders(element);
	}else{
		self._generateBlankHeaders(element);
	}


	//iterate through table rows and build data set
	rows.each(function(rowIndex){
		var item = {};

		//create index if the dont exist in table
		if(!self.hasIndex){
			item[options.index] = rowIndex;
		}

		//add row data to item
		$("td", $(this)).each(function(colIndex){
			item[$(this).data("field")] = $(this).html();
		});

		data.push(item);
	});

	//create new element
	var newElement = $("<div></div>");

	//transfer attributes to new element
	var attributes = element.prop("attributes");

	// loop through attributes and apply them on div
	$.each(attributes, function(){
		newElement.attr(this.name, this.value);
	});

	// replace table with div element
	element.replaceWith(newElement);

	options.data = data;

	self.table.options.htmlImported();

	newElement.tabulator(options);
};

//extract tabluator attribute options
HtmlTableImport.prototype._extractOptions = function(element, options){
	var self = this,
	attributes = element[0].attributes;

	for(var index in attributes){
		var attrib = attributes[index];
		var name;

		if(attrib && attrib.name && attrib.name.indexOf("tabulator-") === 0){
			name = attrib.name.replace("tabulator-", "");

			for(var key in options){
				if(key.toLowerCase() == name){
					options[key] = self._attribValue(attrib.value);
				}
			}
		}
	}
};

//get value of attribute
HtmlTableImport.prototype._attribValue = function(value){
	if(value === "true"){
		return true;
	}

	if(value === "false"){
		return false;
	}

	return value;
};

//find column if it has already been defined
HtmlTableImport.prototype._findCol = function(title){
	var self = this;

	var match = self.table.options.columns.find(function(column){
		return column.title === title;
	});

	return match || false;
};

//extract column from headers
HtmlTableImport.prototype._extractHeaders = function(element){
	var self = this,
	headers = $("th", element),
	rows = $("tbody tr", element);

	headers.each(function(index){
		var header = $(this),
		exists = false,
		col = self._findCol(header.text()),
		width, attributes;

		if(col){
			exists = true;
		}else{
			col = {title:header.text().trim()};
		}

		if(!col.field) {
			col.field = header.text().trim().toLowerCase().replace(" ", "_");
		}

		width = header.attr("width");

		if(width && !col.width)	{
			col.width = width;
		}

		//check for tablator inline options
		attributes = header[0].attributes;

		// //check for tablator inline options
		self._extractOptions(header, col);

		for(var i in attributes){
			var attrib = attributes[i],
			name;

			if(attrib && attrib.name && attrib.name.indexOf("tabulator-") === 0){

				name = attrib.name.replace("tabulator-", "");

				col[name] = self._attribValue(attrib.value);
			}
		}

		$("td:eq(" + index + ")", rows).data("field", col.field);

		if(col.field == self.table.options.index){
			self.hasIndex = true;
		}

		if(!exists){
			self.table.options.columns.push(col)
		}

	});
};

//generate blank headers
HtmlTableImport.prototype._generateBlankHeaders = function(element){
	var self = this,
	headers = $("tr:first td", element),
	rows = $("tbody tr", element);

	headers.each(function(index){
		var col = {title:"", field:"col" + index};
		$("td:eq(" + index + ")", rows).data("field", col.field)

		var width = $(this).attr("width");

		if(width){
			col.width = width;
		}

		self.table.options.columns.push(col);
	});
};

Tabulator.registerExtension("htmlTableImport", HtmlTableImport);