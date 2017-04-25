var Download = function(table){

	var extension = {
		table:table, //hold Tabulator object

		//trigger file download
		download:function(type, filename, options){
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

		},

		//downloaders
		downloaders:{
			csv:function(columns, data, options){

				console.log(columns);

				var delimiter = options && options.delimiter ? options.delimiter : ",";

				//get field lists
				var titles = [];
				var fields = [];

				columns.forEach(function(column){
					if(column.field){
						titles.push('"' + String(column.title).split('"').join('""') + '"');
						fields.push(column.field);
					}
				})

				//generate header row
				var fileContents = [titles.join(delimiter)];

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
			}
		},
	}

	return extension;
}

Tabulator.registerExtension("download", Download);