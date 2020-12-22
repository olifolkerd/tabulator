var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* Tabulator v4.9.3 (c) Oliver Folkerd */

var ExportRow = function ExportRow(type, columns, component, indent) {
	this.type = type;
	this.columns = columns;
	this.component = component || false;
	this.indent = indent || 0;
};

var ExportColumn = function ExportColumn(value, component, width, height, depth) {
	this.value = value;
	this.component = component || false;
	this.width = width;
	this.height = height;
	this.depth = depth;
};

var Export = function Export(table) {
	this.table = table; //hold Tabulator object
	this.config = {};
	this.cloneTableStyle = true;
	this.colVisProp = "";
};

Export.prototype.generateExportList = function (config, style, range, colVisProp) {
	this.cloneTableStyle = style;
	this.config = config || {};
	this.colVisProp = colVisProp;

	var headers = this.config.columnHeaders !== false ? this.headersToExportRows(this.generateColumnGroupHeaders()) : [];
	var body = this.bodyToExportRows(this.rowLookup(range));

	return headers.concat(body);
};

Export.prototype.genereateTable = function (config, style, range, colVisProp) {
	var list = this.generateExportList(config, style, range, colVisProp);

	return this.genereateTableElement(list);
};

Export.prototype.rowLookup = function (range) {
	var _this = this;

	var rows = [];

	if (typeof range == "function") {
		range.call(this.table).forEach(function (row) {
			row = _this.table.rowManager.findRow(row);

			if (row) {
				rows.push(row);
			}
		});
	} else {
		switch (range) {
			case true:
			case "visible":
				rows = this.table.rowManager.getVisibleRows(true);
				break;

			case "all":
				rows = this.table.rowManager.rows;
				break;

			case "selected":
				rows = this.table.modules.selectRow.selectedRows;
				break;

			case "active":
			default:
				if (this.table.options.pagination) {
					rows = this.table.rowManager.getDisplayRows(this.table.rowManager.displayRows.length - 2);
				} else {
					rows = this.table.rowManager.getDisplayRows();
				}
		}
	}

	return Object.assign([], rows);
};

Export.prototype.generateColumnGroupHeaders = function () {
	var _this2 = this;

	var output = [];

	var columns = this.config.columnGroups !== false ? this.table.columnManager.columns : this.table.columnManager.columnsByIndex;

	columns.forEach(function (column) {
		var colData = _this2.processColumnGroup(column);

		if (colData) {
			output.push(colData);
		}
	});

	return output;
};

Export.prototype.processColumnGroup = function (column) {
	var _this3 = this;

	var subGroups = column.columns,
	    maxDepth = 0,
	    title = column.definition["title" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))] || column.definition.title;

	var groupData = {
		title: title,
		column: column,
		depth: 1
	};

	if (subGroups.length) {
		groupData.subGroups = [];
		groupData.width = 0;

		subGroups.forEach(function (subGroup) {
			var subGroupData = _this3.processColumnGroup(subGroup);

			if (subGroupData) {
				groupData.width += subGroupData.width;
				groupData.subGroups.push(subGroupData);

				if (subGroupData.depth > maxDepth) {
					maxDepth = subGroupData.depth;
				}
			}
		});

		groupData.depth += maxDepth;

		if (!groupData.width) {
			return false;
		}
	} else {
		if (this.columnVisCheck(column)) {
			groupData.width = 1;
		} else {
			return false;
		}
	}

	return groupData;
};

Export.prototype.columnVisCheck = function (column) {
	return column.definition[this.colVisProp] !== false && (column.visible || !column.visible && column.definition[this.colVisProp]);
};

Export.prototype.headersToExportRows = function (columns) {
	var headers = [],
	    headerDepth = 0,
	    exportRows = [];

	function parseColumnGroup(column, level) {

		var depth = headerDepth - level;

		if (typeof headers[level] === "undefined") {
			headers[level] = [];
		}

		column.height = column.subGroups ? 1 : depth - column.depth + 1;

		headers[level].push(column);

		if (column.height > 1) {
			for (var _i = 1; _i < column.height; _i++) {

				if (typeof headers[level + _i] === "undefined") {
					headers[level + _i] = [];
				}

				headers[level + _i].push(false);
			}
		}

		if (column.width > 1) {
			for (var _i2 = 1; _i2 < column.width; _i2++) {
				headers[level].push(false);
			}
		}

		if (column.subGroups) {
			column.subGroups.forEach(function (subGroup) {
				parseColumnGroup(subGroup, level + 1);
			});
		}
	}

	//calculate maximum header debth
	columns.forEach(function (column) {
		if (column.depth > headerDepth) {
			headerDepth = column.depth;
		}
	});

	columns.forEach(function (column) {
		parseColumnGroup(column, 0);
	});

	headers.forEach(function (header) {
		var columns = [];

		header.forEach(function (col) {
			if (col) {
				columns.push(new ExportColumn(col.title, col.column.getComponent(), col.width, col.height, col.depth));
			} else {
				columns.push(null);
			}
		});

		exportRows.push(new ExportRow("header", columns));
	});

	return exportRows;
};

Export.prototype.bodyToExportRows = function (rows) {
	var _this4 = this;

	var columns = [];
	var exportRows = [];

	this.table.columnManager.columnsByIndex.forEach(function (column) {
		if (_this4.columnVisCheck(column)) {
			columns.push(column.getComponent());
		}
	});

	if (this.config.columnCalcs !== false && this.table.modExists("columnCalcs")) {
		if (this.table.modules.columnCalcs.topInitialized) {
			rows.unshift(this.table.modules.columnCalcs.topRow);
		}

		if (this.table.modules.columnCalcs.botInitialized) {
			rows.push(this.table.modules.columnCalcs.botRow);
		}
	}

	rows = rows.filter(function (row) {
		switch (row.type) {
			case "group":
				return _this4.config.rowGroups !== false;
				break;

			case "calc":
				return _this4.config.columnCalcs !== false;
				break;

			case "row":
				return !(_this4.table.options.dataTree && _this4.config.dataTree === false && row.modules.dataTree.parent);
				break;
		}

		return true;
	});

	rows.forEach(function (row, i) {
		var rowData = row.getData(_this4.colVisProp);
		var exportCols = [];
		var indent = 0;

		switch (row.type) {
			case "group":
				indent = row.level;
				exportCols.push(new ExportColumn(row.key, row.getComponent(), columns.length, 1));
				break;

			case "calc":
			case "row":
				columns.forEach(function (col) {
					exportCols.push(new ExportColumn(col._column.getFieldValue(rowData), col, 1, 1));
				});

				if (_this4.table.options.dataTree && _this4.config.dataTree !== false) {
					indent = row.modules.dataTree.index;
				}
				break;
		}

		exportRows.push(new ExportRow(row.type, exportCols, row.getComponent(), indent));
	});

	return exportRows;
};

Export.prototype.genereateTableElement = function (list) {
	var _this5 = this;

	var table = document.createElement("table"),
	    headerEl = document.createElement("thead"),
	    bodyEl = document.createElement("tbody"),
	    styles = this.lookupTableStyles(),
	    rowFormatter = this.table.options["rowFormatter" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))],
	    setup = {};

	setup.rowFormatter = rowFormatter !== null ? rowFormatter : this.table.options.rowFormatter;

	if (this.table.options.dataTree && this.config.dataTree !== false && this.table.modExists("columnCalcs")) {
		setup.treeElementField = this.table.modules.dataTree.elementField;
	}

	//assign group header formatter
	setup.groupHeader = this.table.options["groupHeader" + (this.colVisProp.charAt(0).toUpperCase() + this.colVisProp.slice(1))];

	if (setup.groupHeader && !Array.isArray(setup.groupHeader)) {
		setup.groupHeader = [setup.groupHeader];
	}

	table.classList.add("tabulator-print-table");

	this.mapElementStyles(this.table.columnManager.getHeadersElement(), headerEl, ["border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);

	if (list.length > 1000) {
		console.warn("It may take a long time to render an HTML table with more than 1000 rows");
	}

	list.forEach(function (row, i) {
		switch (row.type) {
			case "header":
				headerEl.appendChild(_this5.genereateHeaderElement(row, setup, styles));
				break;

			case "group":
				bodyEl.appendChild(_this5.genereateGroupElement(row, setup, styles));
				break;

			case "calc":
				bodyEl.appendChild(_this5.genereateCalcElement(row, setup, styles));
				break;

			case "row":
				var rowEl = _this5.genereateRowElement(row, setup, styles);
				_this5.mapElementStyles(i % 2 && styles.evenRow ? styles.evenRow : styles.oddRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
				bodyEl.appendChild(rowEl);
				break;
		}
	});

	if (headerEl.innerHTML) {
		table.appendChild(headerEl);
	}

	table.appendChild(bodyEl);

	this.mapElementStyles(this.table.element, table, ["border-top", "border-left", "border-right", "border-bottom"]);
	return table;
};

Export.prototype.lookupTableStyles = function () {
	var styles = {};

	//lookup row styles
	if (this.cloneTableStyle && window.getComputedStyle) {
		styles.oddRow = this.table.element.querySelector(".tabulator-row-odd:not(.tabulator-group):not(.tabulator-calcs)");
		styles.evenRow = this.table.element.querySelector(".tabulator-row-even:not(.tabulator-group):not(.tabulator-calcs)");
		styles.calcRow = this.table.element.querySelector(".tabulator-row.tabulator-calcs");
		styles.firstRow = this.table.element.querySelector(".tabulator-row:not(.tabulator-group):not(.tabulator-calcs)");
		styles.firstGroup = this.table.element.getElementsByClassName("tabulator-group")[0];

		if (styles.firstRow) {
			styles.styleCells = styles.firstRow.getElementsByClassName("tabulator-cell");
			styles.firstCell = styles.styleCells[0];
			styles.lastCell = styles.styleCells[styles.styleCells.length - 1];
		}
	}

	return styles;
};

Export.prototype.genereateHeaderElement = function (row, setup, styles) {
	var _this6 = this;

	var rowEl = document.createElement("tr");

	row.columns.forEach(function (column) {
		if (column) {
			var cellEl = document.createElement("th");
			var classNames = column.component._column.definition.cssClass ? column.component._column.definition.cssClass.split(" ") : [];

			cellEl.colSpan = column.width;
			cellEl.rowSpan = column.height;

			cellEl.innerHTML = column.value;

			if (_this6.cloneTableStyle) {
				cellEl.style.boxSizing = "border-box";
			}

			classNames.forEach(function (className) {
				cellEl.classList.add(className);
			});

			_this6.mapElementStyles(column.component.getElement(), cellEl, ["text-align", "border-top", "border-left", "border-right", "border-bottom", "background-color", "color", "font-weight", "font-family", "font-size"]);
			_this6.mapElementStyles(column.component._column.contentElement, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);

			if (column.component._column.visible) {
				_this6.mapElementStyles(column.component.getElement(), cellEl, ["width"]);
			} else {
				if (column.component._column.definition.width) {
					cellEl.style.width = column.component._column.definition.width + "px";
				}
			}

			if (column.component._column.parent) {
				_this6.mapElementStyles(column.component._column.parent.groupElement, cellEl, ["border-top"]);
			}

			rowEl.appendChild(cellEl);
		}
	});

	return rowEl;
};

Export.prototype.genereateGroupElement = function (row, setup, styles) {

	var rowEl = document.createElement("tr"),
	    cellEl = document.createElement("td"),
	    group = row.columns[0];

	rowEl.classList.add("tabulator-print-table-row");

	if (setup.groupHeader && setup.groupHeader[row.indent]) {
		group.value = setup.groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
	} else {
		if (setup.groupHeader === false) {
			group.value = group.value;
		} else {
			group.value = row.component._group.generator(group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
		}
	}

	cellEl.colSpan = group.width;
	cellEl.innerHTML = group.value;

	rowEl.classList.add("tabulator-print-table-group");
	rowEl.classList.add("tabulator-group-level-" + row.indent);

	if (group.component.isVisible()) {
		rowEl.classList.add("tabulator-group-visible");
	}

	this.mapElementStyles(styles.firstGroup, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);
	this.mapElementStyles(styles.firstGroup, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom"]);

	rowEl.appendChild(cellEl);

	return rowEl;
};

Export.prototype.genereateCalcElement = function (row, setup, styles) {
	var rowEl = this.genereateRowElement(row, setup, styles);

	rowEl.classList.add("tabulator-print-table-calcs");
	this.mapElementStyles(styles.calcRow, rowEl, ["border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size", "background-color"]);

	return rowEl;
};

Export.prototype.genereateRowElement = function (row, setup, styles) {
	var _this7 = this;

	var rowEl = document.createElement("tr");

	rowEl.classList.add("tabulator-print-table-row");

	row.columns.forEach(function (col) {

		if (col) {
			var cellEl = document.createElement("td"),
			    column = col.component._column,
			    value = col.value;

			var cellWrapper = {
				modules: {},
				getValue: function getValue() {
					return value;
				},
				getField: function getField() {
					return column.definition.field;
				},
				getElement: function getElement() {
					return cellEl;
				},
				getColumn: function getColumn() {
					return column.getComponent();
				},
				getData: function getData() {
					return row.component.getData();
				},
				getRow: function getRow() {
					return row.component;
				},
				getComponent: function getComponent() {
					return cellWrapper;
				},
				column: column
			};

			var classNames = column.definition.cssClass ? column.definition.cssClass.split(" ") : [];

			classNames.forEach(function (className) {
				cellEl.classList.add(className);
			});

			if (_this7.table.modExists("format") && _this7.config.formatCells !== false) {
				value = _this7.table.modules.format.formatExportValue(cellWrapper, _this7.colVisProp);
			} else {
				switch (typeof value === "undefined" ? "undefined" : _typeof(value)) {
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
			}

			if (value instanceof Node) {
				cellEl.appendChild(value);
			} else {
				cellEl.innerHTML = value;
			}

			if (styles.firstCell) {
				_this7.mapElementStyles(styles.firstCell, cellEl, ["padding-top", "padding-left", "padding-right", "padding-bottom", "border-top", "border-left", "border-right", "border-bottom", "color", "font-weight", "font-family", "font-size"]);

				if (column.definition.align) {
					cellEl.style.textAlign = column.definition.align;
				}
			}

			if (_this7.table.options.dataTree && _this7.config.dataTree !== false) {
				if (setup.treeElementField && setup.treeElementField == column.field || !setup.treeElementField && i == 0) {
					if (row.component._row.modules.dataTree.controlEl) {
						cellEl.insertBefore(row.component._row.modules.dataTree.controlEl.cloneNode(true), cellEl.firstChild);
					}
					if (row.component._row.modules.dataTree.branchEl) {
						cellEl.insertBefore(row.component._row.modules.dataTree.branchEl.cloneNode(true), cellEl.firstChild);
					}
				}
			}

			rowEl.appendChild(cellEl);

			if (cellWrapper.modules.format && cellWrapper.modules.format.renderedCallback) {
				cellWrapper.modules.format.renderedCallback();
			}

			if (setup.rowFormatter && _this7.config.formatCells !== false) {
				setup.rowFormatter(row.component);
			}
		}
	});

	return rowEl;
};

Export.prototype.genereateHTMLTable = function (list) {
	var holder = document.createElement("div");

	holder.appendChild(this.genereateTableElement(list));

	return holder.innerHTML;
};

Export.prototype.getHtml = function (visible, style, config, colVisProp) {
	var list = this.generateExportList(config || this.table.options.htmlOutputConfig, style, visible, colVisProp || "htmlOutput");

	return this.genereateHTMLTable(list);
};

Export.prototype.mapElementStyles = function (from, to, props) {
	if (this.cloneTableStyle && from && to) {

		var lookup = {
			"background-color": "backgroundColor",
			"color": "fontColor",
			"width": "width",
			"font-weight": "fontWeight",
			"font-family": "fontFamily",
			"font-size": "fontSize",
			"text-align": "textAlign",
			"border-top": "borderTop",
			"border-left": "borderLeft",
			"border-right": "borderRight",
			"border-bottom": "borderBottom",
			"padding-top": "paddingTop",
			"padding-left": "paddingLeft",
			"padding-right": "paddingRight",
			"padding-bottom": "paddingBottom"
		};

		if (window.getComputedStyle) {
			var fromStyle = window.getComputedStyle(from);

			props.forEach(function (prop) {
				to.style[lookup[prop]] = fromStyle.getPropertyValue(prop);
			});
		}
	}
};

Tabulator.prototype.registerModule("export", Export);