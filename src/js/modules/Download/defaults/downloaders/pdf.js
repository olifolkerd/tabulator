export default function(list, options, setFileContents){
	var header = [],
	body = [],
	autoTableParams = {},
	rowGroupStyles = options.rowGroupStyles || {
		fontStyle: "bold",
		fontSize: 12,
		cellPadding: 6,
		fillColor: 220,
	},
	rowCalcStyles = options.rowCalcStyles || {
		fontStyle: "bold",
		fontSize: 10,
		cellPadding: 4,
		fillColor: 232,
	},
	jsPDFParams = options.jsPDF || {},
	title = options && options.title ? options.title : "";

	if(!jsPDFParams.orientation){
		jsPDFParams.orientation = options.orientation || "landscape";
	}

	if(!jsPDFParams.unit){
		jsPDFParams.unit = "pt";
	}

	//parse row list
	list.forEach((row) => {
		var item = {};

		switch(row.type){
			case "header":
			header.push(parseRow(row));
			break;

			case "group":
			body.push(parseRow(row, rowGroupStyles));
			break;

			case "calc":
			body.push(parseRow(row, rowCalcStyles));
			break;

			case "row":
			body.push(parseRow(row));
			break;
		}
	});

	function parseRow(row, styles){
		var rowData = [];

		row.columns.forEach((col) =>{
			var cell;

			if(col){
				switch(typeof col.value){
					case "object":
					col.value = col.value !== null ? JSON.stringify(col.value) : "";
					break;

					case "undefined":
					col.value = "";
					break;
				}

				cell = {
					content:col.value,
					colSpan:col.width,
					rowSpan:col.height,
				};

				if(styles){
					cell.styles = styles;
				}

				rowData.push(cell);
			}
		});

		return rowData;
	}


	//configure PDF
	var doc = new jspdf.jsPDF(jsPDFParams); //set document to landscape, better for most tables

	if(options && options.autoTable){
		if(typeof options.autoTable === "function"){
			autoTableParams = options.autoTable(doc) || {};
		}else{
			autoTableParams = options.autoTable;
		}
	}

	if(title){
		autoTableParams.didDrawPage = function(data) {
			doc.text(title, 40, 30);
		};
	}

	autoTableParams.head = header;
	autoTableParams.body = body;

	doc.autoTable(autoTableParams);

	if(options && options.documentProcessing){
		options.documentProcessing(doc);
	}

	setFileContents(doc.output("arraybuffer"), "application/pdf");
};
