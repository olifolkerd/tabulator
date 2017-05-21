var Download = function(table){
	this.table = table; //hold Tabulator object
};

//trigger file download
Download.prototype.download = function(type, filename, options){
	var self = this,
	downloadFunc = false,
	href;

	//create temporary link element to trigger download
	var element = document.createElement('a');

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
		href = downloadFunc(self.table.columnManager.getDefinitions(), self.table.rowManager.getData(true), options);

		element.setAttribute('href',href);

		//set file title
		element.setAttribute('download', filename || "Tabulator." + (typeof type === "function" ? "txt" : type));

		//trigger download
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();

		//remove temporary link element
		document.body.removeChild(element);
	}

};


//downloaders
Download.prototype.downloaders = {
	csv:function(columns, data, options){
		var titles = [],
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
				var value = typeof row[field] == "object" ? JSON.stringify(row[field]) : row[field];

				//escape uotation marks
				rowData.push('"' + String(value).split('"').join('""') + '"');
			})

			fileContents.push(rowData.join(delimiter));
		});

		return 'data:text/csv;charset=utf-8,' + encodeURIComponent(fileContents.join("\n"));
	},

	json:function(columns, data, options){
		var fileContents = JSON.stringify(data, null, '\t');
		return 'data:application/json;charset=utf-8,' + encodeURIComponent(fileContents);
	},

	xlsx:function(columns, data, options){
		var titles = [],
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
					var cell = {v: typeof value == "undefined" ? "" : value};

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

			sheet['!ref'] = XLSX.utils.encode_range(range)

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

		rows.push(fields);

		//generate each row of the table
		data.forEach(function(row){
			var rowData = [];

			fields.forEach(function(field){
				rowData.push(row[field]);
			})

			rows.push(rowData);
		});


		worksheet = rowsToSheet();
		workbook.Sheets["Sheet1"] = worksheet;

		output = XLSX.write(workbook, {bookType:'xlsx', bookSST:true, type: 'binary'});

		return window.URL.createObjectURL(new Blob([s2ab(output)],{type:"application/octet-stream"}))
	}
};

Tabulator.registerExtension("download", Download);