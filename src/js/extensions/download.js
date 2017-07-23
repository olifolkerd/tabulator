var Download = function(table){
	this.table = table; //hold Tabulator object
	this.fields = {}; //hold filed multi dimension arrays
};

//trigger file download
Download.prototype.download = function(type, filename, options){
	var self = this,
	downloadFunc = false;

	function buildLink(data, mime){
		self.triggerDownload(data, mime, type, filename);
	}

	if(typeof type == "function"){
		downloadFunc = type;
	}else{
		if(self.downloaders[type]){
			downloadFunc = self.downloaders[type];
		}else{
			console.warn("Download Error - No such download type found: ", type);
		}
	}

	if(downloadFunc){
		downloadFunc.call(this, self.processDefinitions(), self.processData() , options, buildLink);
	}
};


Download.prototype.processDefinitions = function(){
	var self = this,
	definitions = self.table.columnManager.getDefinitions(),
	processedDefinitions = [];

	self.fields = {};

	definitions.forEach(function(column){
		if(column.field){
			self.fields[column.field] = column.field.split(".");

			if(column.download !== false){
				processedDefinitions.push(column);
			}
		}
	})

	return  processedDefinitions;
};

Download.prototype.processData = function(){
	var self = this,
	data = self.table.rowManager.getData(true);

	//add user data processing step;
	if(typeof self.table.options.downloadDataMutator == "function"){
		data = self.table.options.downloadDataMutator(data);
	}

	return data;
};

Download.prototype.triggerDownload = function(data, mime, type, filename){
	var element = document.createElement('a'),
	blob = new Blob([data],{type:mime}),
	filename = filename || "Tabulator." + (typeof type === "function" ? "txt" : type);

	if(navigator.msSaveOrOpenBlob){
		navigator.msSaveOrOpenBlob(blob, filename);
	}else{
		element.setAttribute('href', window.URL.createObjectURL(blob));

		//set file title
		element.setAttribute('download', filename);

		//trigger download
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();

		//remove temporary link element
		document.body.removeChild(element);
	}
};

//nested field lookup
Download.prototype.getFieldValue = function(field, data){
	var dataObj = data,
	structure = this.fields[field],
	length = structure.length,
	output;

	for(let i = 0; i < length; i++){

		dataObj = dataObj[structure[i]];

		output = dataObj;

		if(!dataObj){
			break;
		}
	}

	return output;
};


//downloaders
Download.prototype.downloaders = {
	csv:function(columns, data, options, setFileContents){
		var self = this,
		titles = [],
		fields = [],
		delimiter = options && options.delimiter ? options.delimiter : ",",
		fileContents;

		//get field lists
		columns.forEach(function(column){
			if(column.field){
				titles.push('"' + String(column.title).split('"').join('""') + '"');
				fields.push(column.field);
			}
		})

		//generate header row
		fileContents = [titles.join(delimiter)];

		//generate each row of the table
		data.forEach(function(row){
			var rowData = [];

			fields.forEach(function(field){
				var value = self.getFieldValue(field, row);

				switch(typeof value){
					case "object":
					value = JSON.stringify(value);
					break;

					case "undefined":
					case "null":
					value = "";
					break;

					default:
					value = value;
				}

				//escape uotation marks
				rowData.push('"' + String(value).split('"').join('""') + '"');
			})

			fileContents.push(rowData.join(delimiter));
		});

		setFileContents(fileContents.join("\n"), "text/csv");
	},

	json:function(columns, data, options, setFileContents){
		var fileContents = JSON.stringify(data, null, '\t');

		setFileContents(fileContents, "application/json");
	},

	xlsx:function(columns, data, options, setFileContents){
		var self = this,
		titles = [],
		fields = [],
		rows = [],
		workbook = { SheetNames:["Sheet1"], Sheets:{} },
		worksheet, output;

		//convert rows to worksheet
		function rowsToSheet(){
			var sheet = {};
			var range = {s: {c:0, r:0}, e: {c:fields.length, r:rows.length }};

			rows.forEach(function(row, i){
				row.forEach(function(value, j){
					var cell = {v: typeof value == "undefined" || value === null ? "" : value};

					if(cell != null){
						switch(typeof cell.v){
							case "number":
							cell.t = 'n';
							break;
							case "boolean":
							cell.t = 'b';
							break;
							default:
							cell.t = 's';
							break;
						}

						sheet[XLSX.utils.encode_cell({c:j,r:i})] = cell
					}
				});
			});

			sheet['!ref'] = XLSX.utils.encode_range(range);

			return sheet;
		}

		//convert workbook to binary array
		function s2ab(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
				return buf;
		}

		//get field lists
		columns.forEach(function(column){
			if(column.field){
				titles.push(column.title);
				fields.push(column.field);
			}
		});

		rows.push(titles);

		//generate each row of the table
		data.forEach(function(row){
			var rowData = [];

			fields.forEach(function(field){
				rowData.push(self.getFieldValue(field, row));
			});

			rows.push(rowData);
		});


		worksheet = rowsToSheet();
		workbook.Sheets["Sheet1"] = worksheet;

		output = XLSX.write(workbook, {bookType:'xlsx', bookSST:true, type: 'binary'});

		setFileContents(s2ab(output), "application/octet-stream");
	}
};

Tabulator.registerExtension("download", Download);