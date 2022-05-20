export default function(list, options, setFileContents){
	var delimiter = options && options.delimiter ? options.delimiter : ",",
	fileContents = [],
	headers = [];

	list.forEach((row) => {
		var item = [];

		switch(row.type){
			case "group":
			console.warn("Download Warning - CSV downloader cannot process row groups");
			break;

			case "calc":
			console.warn("Download Warning - CSV downloader cannot process column calculations");
			break;

			case "header":
			row.columns.forEach((col, i) => {
				if(col && col.depth === 1){
					headers[i] = typeof col.value == "undefined"  || col.value === null ? "" : ('"' + String(col.value).split('"').join('""') + '"');
				}
			});
			break;

			case "row":
			row.columns.forEach((col) => {

				if(col){

					switch(typeof col.value){
						case "object":
						col.value = col.value !== null ? JSON.stringify(col.value) : "";
						break;

						case "undefined":
						col.value = "";
						break;
					}

					item.push('"' + String(col.value).split('"').join('""') + '"');
				}
			});

			fileContents.push(item.join(delimiter));
			break;
		}
	});

	if(headers.length){
		fileContents.unshift(headers.join(delimiter));
	}

	fileContents = fileContents.join("\n");

	if(options.bom){
		fileContents = "\ufeff" + fileContents;
	}

	setFileContents(fileContents, "text/csv");
};
