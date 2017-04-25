var HtmlTableImport = function(table){

	var extension = {
		table:table, //hold Tabulator object

		parseTable:function(){
			var self = this,
			element = self.table.element,
			options = self.table.options,
			columns = options.columns,
			headers = $("th", element),
			hasIndex = false,
			rows = $("tbody tr", element),
			data = [];


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
				if(!hasIndex){
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

			newElement.tabulator(options);
		},

		//extract tabluator attribute options
		_extractOptions:function(element, options){
			var self = this,
			attributes = element[0].attributes

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
		},

		//get value of attribute
		_attribValue(value){
			if(value === "true"){
				return true;
			}

			if(value === "false"){
				return false;
			}

			return value;
		},

		//find column if it has already been defined
		_findCol(title){
			var self = this;

			var match = self.table.options.columns.find(function(column){
				return column.title === title;
			});

			return match || false;
		},

		//extract column from headers
		_extractHeaders:function(element){
			var self = this,
			headers = $("th", element),
			rows = $("tbody tr", element);

			headers.each(function(index){
				var header = $(this),
				exists = false,
				col = self._findCol(header.text()),
				width, attributes;

				//list of possible attributes
				var attribList = ["title", "field", "align", "width", "minWidth", "frozen", "sortable", "sorter", "formatter", "onClick", "onDblClick", "onContext", "editable", "editor", "visible", "cssClass", "tooltip", "tooltipHeader", "editableTitle", "headerFilter", "mutator", "mutateType", "accessor"];


				if(col){
					exists = true;
				}else{
					col = {title:header.text()};
				}

				if(!col.field) {
					col.field = header.text().toLowerCase().replace(" ", "_");
				}

				$("td:eq(" + index + ")", rows).data("field", col.field)

				width = header.attr("width");

				if(width && !col.width)	{
					col.width = width;
				}

				if(col.field == self.table.options.index){
					hasIndex = true;
				}

				//check for tablator inline options
				attributes = header[0].attributes;

				//check for tablator inline options
				for(var index in attributes){
					var attrib = attributes[index],
					name;

					if(attrib && attrib.name && attrib.name.indexOf("tabulator-") === 0){

						name = attrib.name.replace("tabulator-", "");

						attribList.forEach(function(key){
							if(key.toLowerCase() == name){
								col[key] = self._attribValue(attrib.value);
							}
						});
					}
				}

				if(!exists){
					self.table.options.columns.push(col)
				}

			});
		},

		//generate blank headers
		_generateBlankHeaders:function(element){
			var self = this;

			var headers = $("tr:first td", element);

			headers.each(function(index){
				var col = {title:"", field:"col" + index};
				$("td:eq(" + index + ")", rows).data("field", col.field)

				var width = $(this).attr("width");

				if(width){
					col.width = width;
				}

				self.table.options.columns.push(col);
			});
		},

	}


	return extension;
}

Tabulator.registerExtension("htmlTableImport", HtmlTableImport);