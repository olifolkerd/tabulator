var Clipboard = function(table){
	this.table = table;
	this.mode = true;
	this.copySelector = false;
	this.copySelectorParams = {};
	this.copyFormatter = false;
	this.copyFormatterParams = {};
	this.pasteParser = function(){};
	this.pasteAction = function(){};

	this.blocked = true; //block copy actions not originating from this command
};

Clipboard.prototype.initialize = function(){
	var self = this;

	this.mode = this.table.options.clipboard;

	if(this.mode === true || this.mode === "copy"){
		this.table.element.on("copy", function(e){
			var data;

			if(!self.blocked){
				e.preventDefault();

				data = self.generateContent()

				if (window.clipboardData && window.clipboardData.setData) {
					window.clipboardData.setData('Text', data);
				} else if (e.clipboardData && e.clipboardData.setData) {
					e.clipboardData.setData('text/plain', data);
				} else if (e.originalEvent && e.originalEvent.clipboardData.setData) {
					e.originalEvent.clipboardData.setData('text/plain', data);
				}

				self.table.options.clipboardCopied(data);

				self.reset();
			}
		});
	}

	if(this.mode === true || this.mode === "paste"){
		this.table.element.on("paste", function(e){
			self.paste(e);
		});
	}

	this.setPasteParser(this.table.options.clipboardPasteParser);
	this.setPasteAction(this.table.options.clipboardPasteAction);
}

Clipboard.prototype.reset = function(){
	this.blocked = false;
	this.originalSelectionText = "";
}


Clipboard.prototype.setPasteAction = function(action){

	switch(typeof action){
		case "string":
		this.pasteAction = this.pasteActions[action];

		if(!this.pasteAction){
			console.warn("Clipboard Error - No such paste action found:", action)
		}
		break;

		case "function":
		this.pasteAction = action;
		break;
	}
}

Clipboard.prototype.setPasteParser = function(parser){
	switch(typeof parser){
		case "string":
		this.pasteParser = this.pasteParsers[parser];

		if(!this.pasteParser){
			console.warn("Clipboard Error - No such paste parser found:", parser)
		}
		break;

		case "function":
		this.pasteParser = parser;
		break;
	}
}


Clipboard.prototype.paste = function(e){
	var data, rowData, rows;

	if(this.checkPaseOrigin(e)){

		data = this.getPasteData(e);

		rowData = this.pasteParser.call(this, data);

		if(rowData){
			e.preventDefault();

			if(this.table.extExists("mutator")){
				rowData = this.mutateData(rowData);
			}

			rows = this.pasteAction.call(this, rowData);
			this.table.options.clipboardPasted(data, rowData, rows);
		}else{
			this.table.options.clipboardPasteError(data);
		}
	}
}

Clipboard.prototype.mutateData = function(data){
	var self = this,
	output = [];

	if(Array.isArray(data)){
		data.forEach(function(row){
			output.push(self.table.extensions.mutator.transformRow(row, "clipboard"));
		});
	}else{
		output = data;
	}

	return output;
}


Clipboard.prototype.checkPaseOrigin = function(e){
	var valid = true;

	if(e.target.tagName != "DIV" || this.table.extensions.edit.currentCell){
		valid = false;
	}

	return valid;
}

Clipboard.prototype.getPasteData = function(e){
	var data = undefined;

	if (window.clipboardData && window.clipboardData.getData) {
		data = window.clipboardData.getData('Text');
	} else if (e.clipboardData && e.clipboardData.getData) {
		data = e.clipboardData.getData('text/plain');
	} else if (e.originalEvent && e.originalEvent.clipboardData.getData) {
		data = e.originalEvent.clipboardData.getData('text/plain');
	}

	return data;
}


Clipboard.prototype.copy = function(selector, selectorParams, formatter, formatterParams, internal){
	var range, sel;
	this.blocked = false;

	if(this.mode === true || this.mode === "copy"){

		if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
			range = document.createRange();
			range.selectNodeContents(this.table.element[0]);
			sel = window.getSelection();

			if(sel.toString() && internal){
				selector = "userSelection";
				formatter = "raw";
				this.copySelectorParams = sel.toString();
			}

			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
			textRange = document.body.createTextRange();
			textRange.moveToElementText(this.table.element[0]);
			textRange.select();
		}

		this.setSelector(selector);
		this.copySelectorParams = typeof selectorParams != "undefined" && selectorParams != null ? selectorParams : this.table.options.clipboardCopyHeader;
		this.setFormatter(formatter);
		this.copyFormatterParams = typeof formatterParams != "undefined" && formatterParams != null ? formatterParams : {};

		document.execCommand('copy');

		if(sel){
			sel.removeAllRanges();
		}
	}
}

Clipboard.prototype.setSelector = function(selector){

	selector = selector || this.table.options.clipboardCopySelector;

	switch(typeof selector){
		case "string":
		if(this.copySelectors[selector]){
			this.copySelector = this.copySelectors[selector];
		}else{
			console.warn("Clipboard Error - No such selector found:", selector)
		}
		break;

		case "function":
		this.copySelector = selector
		break;
	}
}

Clipboard.prototype.setFormatter = function(formatter){

	formatter = formatter || this.table.options.clipboardCopyFormatter;

	switch(typeof formatter){
		case "string":
		if(this.copyFormatters[formatter]){
			this.copyFormatter = this.copyFormatters[formatter];
		}else{
			console.warn("Clipboard Error - No such formatter found:", formatter)
		}
		break;

		case "function":
		this.copyFormatter = formatter;
		break;
	}
}


Clipboard.prototype.generateContent = function(){
	var data = this.copySelector.call(this, this.copySelectorParams);
	return this.copyFormatter.call(this, data, this.copyFormatterParams);
}

Clipboard.prototype.rowsToData = function(rows, params){
	var columns = this.table.columnManager.columnsByIndex,
	headers = [],
	data = [];

	if(params){
		columns.forEach(function(column){
			headers.push(column.definition.title);
		});

		data.push(headers);
	}

	rows.forEach(function(row){
		var rowArray = [],
		rowData = row.getData("clipboard");

		columns.forEach(function(column){
			var value = column.getFieldValue(rowData);
			rowArray.push(value);
		});

		data.push(rowArray);
	});

	return data;
}


Clipboard.prototype.copySelectors = {
	userSelection: function(params){
		return params;
	},
	selected: function(params){
		var rows = [];

		if(this.table.extExists("selectRow", true)){
			rows = this.table.extensions.selectRow.getSelectedRows();
		}

		return this.rowsToData(rows, params);
	},
	table: function(params){
		return this.rowsToData(this.table.rowManager.getComponents(), params);
	},
	active: function(params){
		return this.rowsToData(this.table.rowManager.getComponents(true), params);
	},
}

Clipboard.prototype.copyFormatters = {
	raw: function(data, params){
		return data;
	},
	table: function(data, params){
		var output = [];

		data.forEach(function(row){
			row.forEach(function(value){
				if(typeof value == "undefined"){
					value = ""
				}

				value = typeof value == "undefined" ? "" : value.toString();

				if(value.match(/\r|\n/)){
					value = value.split('"').join('""');
					value = '"' + value + '"';
				}
			});

			output.push(row.join("\t"));
		});

		return output.join("\n");
	}
}

Clipboard.prototype.pasteParsers = {
	table:function(clipboard){
		var data = [],
		success = false,
		headerFindSuccess = true,
		columns = this.table.columnManager.columns,
		columnMap = [],
		rows = [];

		//get data from clipboard into array of columns and rows.
		clipboard = clipboard.split("\n");

		clipboard.forEach(function(row){
			data.push(row.split("\t"));
		});

		if(data.length && !(data.length === 1 && data[0].length < 2)){
			success = true;

			//check if headers are present by title
			data[0].forEach(function(value){
				var column = columns.find(function(column){
					return value.trim() && column.definition.title.trim() === value.trim();
				});

				if(column){
					columnMap.push(column);
				}else{
					headerFindSuccess = false;
				}
			});

			//check if column headers are present by field
			if(!headerFindSuccess){
				headerFindSuccess = true;
				columnMap = [];

				data[0].forEach(function(value){
					var column = columns.find(function(column){
						return value.trim() && column.field.trim() === value.trim();
					});

					if(column){
						columnMap.push(column);
					}else{
						headerFindSuccess = false;
					}
				});

				if(!headerFindSuccess){
					columnMap = this.table.columnManager.columnsByIndex;
				}
			}

			//remove header row if found
			if(headerFindSuccess){
				data.shift();
			}

			data.forEach(function(item){
				var row = {};

				item.forEach(function(value, i){
					if(columnMap[i]){
						row[columnMap[i].field] = value;
					}
				});

				rows.push(row);
			});

			return rows;
		}else{
			return false;
		}
	}
}

Clipboard.prototype.pasteActions = {
	replace:function(rows){
		return this.table.setData(rows);
	},
	update:function(rows){
		return this.table.updateOrAddData(rows);
	},
	insert:function(rows){
		return this.table.addData(rows);
	},
}



Tabulator.registerExtension("clipboard", Clipboard);
