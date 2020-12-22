var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* Tabulator v4.9.3 (c) Oliver Folkerd */

var Download = function Download(table) {
	this.table = table; //hold Tabulator object
};

//trigger file download
Download.prototype.download = function (type, filename, options, range, interceptCallback) {
	var self = this,
	    downloadFunc = false;

	function buildLink(data, mime) {
		if (interceptCallback) {
			if (interceptCallback === true) {
				self.triggerDownload(data, mime, type, filename, true);
			} else {
				interceptCallback(data);
			}
		} else {
			self.triggerDownload(data, mime, type, filename);
		}
	}

	if (typeof type == "function") {
		downloadFunc = type;
	} else {
		if (self.downloaders[type]) {
			downloadFunc = self.downloaders[type];
		} else {
			console.warn("Download Error - No such download type found: ", type);
		}
	}

	if (downloadFunc) {
		var list = this.generateExportList(range);

		downloadFunc.call(this.table, list, options || {}, buildLink);
	}
};

Download.prototype.generateExportList = function (range) {
	var list = this.table.modules.export.generateExportList(this.table.options.downloadConfig, false, range || this.table.options.downloadRowRange, "download");

	//assign group header formatter
	var groupHeader = this.table.options.groupHeaderDownload;

	if (groupHeader && !Array.isArray(groupHeader)) {
		groupHeader = [groupHeader];
	}

	list.forEach(function (row) {
		var group;

		if (row.type === "group") {
			group = row.columns[0];

			if (groupHeader && groupHeader[row.indent]) {
				group.value = groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
			}
		}
	});

	return list;
};

Download.prototype.triggerDownload = function (data, mime, type, filename, newTab) {
	var element = document.createElement('a'),
	    blob = new Blob([data], { type: mime }),
	    filename = filename || "Tabulator." + (typeof type === "function" ? "txt" : type);

	blob = this.table.options.downloadReady.call(this.table, data, blob);

	if (blob) {

		if (newTab) {
			window.open(window.URL.createObjectURL(blob));
		} else {
			if (navigator.msSaveOrOpenBlob) {
				navigator.msSaveOrOpenBlob(blob, filename);
			} else {
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
		}

		if (this.table.options.downloadComplete) {
			this.table.options.downloadComplete();
		}
	}
};

Download.prototype.commsReceived = function (table, action, data) {
	switch (action) {
		case "intercept":
			this.download(data.type, "", data.options, data.active, data.intercept);
			break;
	}
};

//downloaders
Download.prototype.downloaders = {
	csv: function csv(list, options, setFileContents) {
		var delimiter = options && options.delimiter ? options.delimiter : ",",
		    fileContents = [],
		    headers = [];

		list.forEach(function (row) {
			var item = [];

			switch (row.type) {
				case "group":
					console.warn("Download Warning - CSV downloader cannot process row groups");
					break;

				case "calc":
					console.warn("Download Warning - CSV downloader cannot process column calculations");
					break;

				case "header":
					row.columns.forEach(function (col, i) {
						if (col && col.depth === 1) {
							headers[i] = typeof col.value == "undefined" || col.value === null ? "" : '"' + String(col.value).split('"').join('""') + '"';
						}
					});
					break;

				case "row":
					row.columns.forEach(function (col) {

						if (col) {

							switch (_typeof(col.value)) {
								case "object":
									col.value = JSON.stringify(col.value);
									break;

								case "undefined":
								case "null":
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

		if (headers.length) {
			fileContents.unshift(headers.join(delimiter));
		}

		fileContents = fileContents.join("\n");

		if (options.bom) {
			fileContents = "\uFEFF" + fileContents;
		}

		setFileContents(fileContents, "text/csv");
	},

	json: function json(list, options, setFileContents) {
		var fileContents = [];

		list.forEach(function (row) {
			var item = {};

			switch (row.type) {
				case "header":
					break;

				case "group":
					console.warn("Download Warning - JSON downloader cannot process row groups");
					break;

				case "calc":
					console.warn("Download Warning - JSON downloader cannot process column calculations");
					break;

				case "row":
					row.columns.forEach(function (col) {
						if (col) {
							item[col.component.getField()] = col.value;
						}
					});

					fileContents.push(item);
					break;
			}
		});

		fileContents = JSON.stringify(fileContents, null, '\t');

		setFileContents(fileContents, "application/json");
	},

	pdf: function pdf(list, options, setFileContents) {
		var header = [],
		    body = [],
		    autoTableParams = {},
		    rowGroupStyles = options.rowGroupStyles || {
			fontStyle: "bold",
			fontSize: 12,
			cellPadding: 6,
			fillColor: 220
		},
		    rowCalcStyles = options.rowCalcStyles || {
			fontStyle: "bold",
			fontSize: 10,
			cellPadding: 4,
			fillColor: 232
		},
		    jsPDFParams = options.jsPDF || {},
		    title = options && options.title ? options.title : "";

		if (!jsPDFParams.orientation) {
			jsPDFParams.orientation = options.orientation || "landscape";
		}

		if (!jsPDFParams.unit) {
			jsPDFParams.unit = "pt";
		}

		//parse row list
		list.forEach(function (row) {
			var item = {};

			switch (row.type) {
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

		function parseRow(row, styles) {
			var rowData = [];

			row.columns.forEach(function (col) {
				var cell;

				if (col) {
					switch (_typeof(col.value)) {
						case "object":
							col.value = JSON.stringify(col.value);
							break;

						case "undefined":
						case "null":
							col.value = "";
							break;
					}

					cell = {
						content: col.value,
						colSpan: col.width,
						rowSpan: col.height
					};

					if (styles) {
						cell.styles = styles;
					}

					rowData.push(cell);
				} else {
					rowData.push("");
				}
			});

			return rowData;
		}

		//configure PDF
		var doc = new jsPDF(jsPDFParams); //set document to landscape, better for most tables

		if (options && options.autoTable) {
			if (typeof options.autoTable === "function") {
				autoTableParams = options.autoTable(doc) || {};
			} else {
				autoTableParams = options.autoTable;
			}
		}

		if (title) {
			autoTableParams.addPageContent = function (data) {
				doc.text(title, 40, 30);
			};
		}

		autoTableParams.head = header;
		autoTableParams.body = body;

		doc.autoTable(autoTableParams);

		if (options && options.documentProcessing) {
			options.documentProcessing(doc);
		}

		setFileContents(doc.output("arraybuffer"), "application/pdf");
	},

	xlsx: function xlsx(list, options, setFileContents) {
		var self = this,
		    sheetName = options.sheetName || "Sheet1",
		    workbook = XLSX.utils.book_new(),
		    output;

		workbook.SheetNames = [];
		workbook.Sheets = {};

		function generateSheet() {
			var rows = [],
			    merges = [],
			    worksheet = {},
			    range = { s: { c: 0, r: 0 }, e: { c: list[0] ? list[0].columns.reduce(function (a, b) {
						return a + (b && b.width ? b.width : 1);
					}, 0) : 0, r: list.length } };

			//parse row list
			list.forEach(function (row, i) {
				var rowData = [];

				row.columns.forEach(function (col, j) {

					if (col) {
						rowData.push(!(col.value instanceof Date) && _typeof(col.value) === "object" ? JSON.stringify(col.value) : col.value);

						if (col.width > 1 || col.height > -1) {
							merges.push({ s: { r: i, c: j }, e: { r: i + col.height - 1, c: j + col.width - 1 } });
						}
					} else {
						rowData.push("");
					}
				});

				rows.push(rowData);
			});

			//convert rows to worksheet
			XLSX.utils.sheet_add_aoa(worksheet, rows);

			worksheet['!ref'] = XLSX.utils.encode_range(range);

			if (merges.length) {
				worksheet["!merges"] = merges;
			}

			return worksheet;
		}

		if (options.sheetOnly) {
			setFileContents(generateSheet());
			return;
		}

		if (options.sheets) {
			for (var sheet in options.sheets) {

				if (options.sheets[sheet] === true) {
					workbook.SheetNames.push(sheet);
					workbook.Sheets[sheet] = generateSheet();
				} else {

					workbook.SheetNames.push(sheet);

					this.modules.comms.send(options.sheets[sheet], "download", "intercept", {
						type: "xlsx",
						options: { sheetOnly: true },
						active: self.active,
						intercept: function intercept(data) {
							workbook.Sheets[sheet] = data;
						}
					});
				}
			}
		} else {
			workbook.SheetNames.push(sheetName);
			workbook.Sheets[sheetName] = generateSheet();
		}

		if (options.documentProcessing) {
			workbook = options.documentProcessing(workbook);
		}

		//convert workbook to binary array
		function s2ab(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i = 0; i != s.length; ++i) {
				view[i] = s.charCodeAt(i) & 0xFF;
			}return buf;
		}

		output = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });

		setFileContents(s2ab(output), "application/octet-stream");
	},

	html: function html(list, options, setFileContents) {
		if (this.modExists("export", true)) {
			setFileContents(this.modules.export.genereateHTMLTable(list), "text/html");
		}
	}

};

Tabulator.prototype.registerModule("download", Download);