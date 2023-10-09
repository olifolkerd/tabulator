import Module from "../../core/Module.js";

class Range {
	constructor(row, col) {
		this.start = { row, col };
		this.end = { row, col };
		this._updateMinMax();
	}

	setStart(row, col) {
		this.start.row = row;
		this.start.col = col;
		this._updateMinMax();
	}

	setEnd(row, col) {
		this.end.row = row;
		this.end.col = col;
		this._updateMinMax();
	}

	_updateMinMax() {
		this.minRow = Math.min(this.start.row, this.end.row);
		this.maxRow = Math.max(this.start.row, this.end.row);
		this.minCol = Math.min(this.start.col, this.end.col);
		this.maxCol = Math.max(this.start.col, this.end.col);
	}

	atTopLeft(row, col) {
		return row === this.minRow && col === this.minCol;
	}

	atBottomRight(row, col) {
		return row === this.maxRow && col === this.maxCol;
	}

	occupies(row, col) {
		return (
			this.minRow <= row &&
			row <= this.maxRow &&
			this.minCol <= col &&
			col <= this.maxCol
		);
	}

	isStartingAt(row, col) {
		return this.start.row === row && this.start.col === col;
	}

	withinRow(row) {
		return row >= this.minRow && row <= this.maxRow;
	}

	withinColumn(col) {
		return col >= this.minCol && col <= this.maxCol;
	}
}

class Spreadsheet extends Module {
	constructor(table) {
		super(table);

		this.ranges = [new Range(0, 0)];
		this.selecting = false;
	}

	initialize() {
		if (!this.table.options.spreadsheet) return;

		this.registerTableOption("rowHeaderField", "--row-position");
		this.registerTableFunction(
			"getSelectedData",
			this.getSelectedData.bind(this),
		);

		this.subscribe("column-mousedown", this.handleColumnMouseDown.bind(this));
		this.subscribe("column-mousemove", this.handleColumnMouseMove.bind(this));
		this.subscribe("column-width", this.handleColumnUpdating.bind(this));
		this.subscribe("column-resized", this.renderSelection.bind(this));
		this.subscribe("cell-mousedown", this.handleCellMouseDown.bind(this));
		this.subscribe("cell-mousemove", this.handleCellMouseMove.bind(this));
		this.subscribe("cell-dblclick", this.handleCellDblClick.bind(this));
		this.subscribe("cell-rendered", this.renderCell.bind(this));
		this.subscribe("page-changed", this.handlePageChanged.bind(this));
		this.subscribe("table-layout", this.layoutElement.bind(this));

		var mouseUpHandler = this.handleMouseUp.bind(this);
		document.addEventListener("mouseup", mouseUpHandler);
		this.subscribe("table-destroy", () =>
			document.removeEventListener(mouseUpHandler),
		);

		this.initializeTable();
	}

	initializeTable() {
		for (var column of this.table.options.columns) {
			// Disable sorting by clicking header
			column.headerSort = false;
			// Edit on double click
			if (column.editor) column.editable = false;
		}
		this.table.options.columns = [
			{
				title: "",
				field: this.options("rowHeaderField"),
				headerSort: false,
				resizable: true,
				frozen: true,
				editable: false,
				cssClass: "tabulator-row-header",
			},
			...this.table.options.columns,
		];

		this.table.options.clipboardCopyRowRange = "spreadsheet";

		this.table.element.classList.add("tabulator-spreadsheet");

		this.overlay = document.createElement("div");
		this.overlay.classList.add("tabulator-selection-overlay");

		this.table.rowManager.element.appendChild(this.overlay);
	}

	getSelectedData() {
		return this.getDataByRange(this.getActiveRange());
	}

	getDataByRange(range) {
		var data = [];
		var rows = this.getRowsByRange(range);
		var columns = this.getColumnsByRange(range).map(
			(component) => component._column,
		);

		rows.forEach((row) => {
			var rowData = row.getData();
			var result = {};
			columns.forEach((column) => {
				result[column.field] = rowData[column.field];
			});
			data.push(result);
		});

		return data;
	}

	renderCell(cell) {
		var el = cell.getElement();
		var row = cell.row.position - 1;
		var col = cell.column.position - 2;

		el.classList.toggle(
			"tabulator-cell-selected",
			this.ranges.some((range) => range.occupies(row, col)),
		);

		el.classList.toggle(
			"tabulator-only-cell-selected",
			this.ranges.length === 1 &&
				this.ranges[0].atTopLeft(row, col) &&
				this.ranges[0].atBottomRight(row, col),
		);

		if (cell.column.field === this.options("rowHeaderField")) {
			var n = cell.row.position;
			if (this.table.initialized && this.table.getPage) {
				n += (this.table.getPage() - 1) * this.table.getPageSize();
			}
			el.innerText = n;
		}
	}

	selectingAllColumnsOfRow(row) {
		if (this.selecting === "all") return true;

		return this.ranges.some(
			(range) =>
				this.selecting === "row" &&
				range.start.col === 0 &&
				range.end.col === this.table.columnManager.columns.length - 2 &&
				range.withinRow(row),
		);
	}

	selectingAllRowsOfColumn(col) {
		if (this.selecting === "all") return true;

		return this.ranges.some(
			(range) =>
				this.selecting === "column" &&
				range.start.row === 0 &&
				range.end.row === this.rowsPerPage - 1 &&
				range.withinColumn(col),
		);
	}

	handleColumnMouseDown(event, column) {
		if (column.field === this.options("rowHeaderField")) {
			this.ranges = [new Range(0, 0)];
			this.selecting = "all";

			const topLeftCell = this.table.rowManager
				.getRowFromPosition(1)
				.getCells()[1];
			const bottomRightCell = this.table.columnManager.columns
				.slice(-1)[0]
				.getCells()
				.slice(-1)[0];

			this.beginSelection(topLeftCell);
			this.endSelection(bottomRightCell);
		} else {
			this._select(event, column);
		}

		this.layoutElement();
	}

	handleColumnMouseMove(_, column) {
		if (column.field === this.options("rowHeaderField")) return;
		if (!this.selecting || this.selecting === "all") return;

		this.endSelection(column);
		this.layoutElement();
	}

	handleCellMouseDown(event, cell) {
		this._select(event, cell);
		this.layoutElement();
	}

	_select(event, element) {
		if (element.type === "column") {
			this.selecting = "column";
		} else if (element.column.field === this.options("rowHeaderField")) {
			this.selecting = "row";
		} else {
			this.selecting = "cell";
		}

		if (event.shiftKey) {
			if (this.ranges.length > 1) {
				this.ranges = this.ranges.slice(-1);
			}

			this.endSelection(element);
		} else if (event.ctrlKey) {
			this.ranges.push(new Range(0, 0));

			this.beginSelection(element);
			this.endSelection(element);
		} else {
			this.ranges = [new Range(0, 0)];

			this.beginSelection(element);
			this.endSelection(element);
		}
	}

	handleCellMouseMove(_, cell) {
		if (!this.selecting || this.selecting === "all") return;

		this.endSelection(cell);
		this.layoutElement();
	}

	handleMouseUp() {
		this.selecting = false;
	}

	handleCellDblClick(_, cell) {
		if (
			cell.column.field !== this.options("rowHeaderField") &&
			cell.column.definition.editor
		) {
			cell.getComponent().edit(true);
		}
	}

	beginSelection(element) {
		var range = this.getActiveRange();

		if (element.type === "column") {
			range.setStart(0, element.position - 2);
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;

		if (element.column.field === this.options("rowHeaderField")) {
			range.setStart(row, 0);
		} else {
			range.setStart(row, col);
		}
	}

	endSelection(element) {
		var range = this.getActiveRange();

		if (element.type === "column") {
			if (this.selecting === "column") {
				range.setEnd(this.rowsPerPage - 1, element.position - 2);
			} else if (this.selecting === "cell") {
				range.setEnd(0, element.position - 1);
			}
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;
		var isRowHeader = element.column.field === this.options("rowHeaderField");

		if (this.selecting === "row") {
			range.setEnd(row, this.table.columnManager.getColumns().length - 2);
		} else if (this.selecting !== "row" && isRowHeader) {
			range.setEnd(row, 0);
		} else if (this.selecting === "column") {
			range.setEnd(this.rowsPerPage - 1, col);
		} else {
			range.setEnd(row, col);
		}
	}

	layoutElement() {
		this.table.rowManager.getVisibleRows(true).forEach((row) => {
			if (row.type === "row") {
				this.layoutRow(row);
			}
		});

		this.table.columnManager.columns.forEach((column) => {
			this.layoutColumn(column);
		});

		this.renderSelection();
	}

	layoutRow(row) {
		row
			.getElement()
			.classList.toggle(
				"tabulator-row-selected",
				this.selectingAllColumnsOfRow(row.position - 1),
			);

		row.getElement().classList.toggle(
			"tabulator-row-highlight",
			this.ranges.some((range) => range.withinRow(row.position - 1)),
		);

		row.cells.forEach((cell) => this.renderCell(cell));
	}

	layoutColumn(column) {
		column
			.getElement()
			.classList.toggle(
				"tabulator-col-selected",
				this.selectingAllRowsOfColumn(column.position - 2),
			);

		column.getElement().classList.toggle(
			"tabulator-col-highlight",
			this.ranges.some((range) => range.withinColumn(column.position - 2)),
		);
	}

	handleColumnUpdating() {
		this.overlay.classList.add("tabulator-column-updating");
	}

	renderSelection() {
		this.overlay.classList.remove("tabulator-column-updating");

		var tableElement = this.table.rowManager.tableElement;

		this.overlay.style.left = tableElement.scrollLeft + "px";
		this.overlay.style.top = tableElement.scrollTop + "px";
		this.overlay.style.width = tableElement.clientWidth + "px";
		this.overlay.style.height = tableElement.clientHeight + "px";

		while (this.overlay.firstChild) {
			this.overlay.removeChild(this.overlay.firstChild);
		}

		var activeCell = this.getActiveCell();
		var activeEl = document.createElement("div");
		activeEl.classList.add("tabulator-selection-active-cell");
		activeEl.style.left = activeCell.getElement().offsetLeft + "px";
		activeEl.style.top = activeCell.row.getElement().offsetTop + "px";
		activeEl.style.width =
			activeCell.getElement().offsetLeft +
			activeCell.getElement().offsetWidth -
			activeCell.getElement().offsetLeft +
			"px";
		activeEl.style.height =
			activeCell.row.getElement().offsetTop +
			activeCell.row.getElement().offsetHeight -
			activeCell.row.getElement().offsetTop +
			"px";

		this.overlay.appendChild(activeEl);

		var activeRange = this.getActiveRange();

		this.ranges.forEach((range) => {
			var topLeftCell = this.getCell(range.minRow, range.minCol);
			var bottomRightCell = this.getCell(range.maxRow, range.maxCol);

			var rangeEl = document.createElement("div");
			rangeEl.classList.add("tabulator-selection-range");
			if (range === activeRange) {
				rangeEl.classList.add("tabulator-selection-range-active");
			}

			rangeEl.style.left = topLeftCell.getElement().offsetLeft + "px";
			rangeEl.style.top = topLeftCell.row.getElement().offsetTop + "px";
			rangeEl.style.width =
				bottomRightCell.getElement().offsetLeft +
				bottomRightCell.getElement().offsetWidth -
				topLeftCell.getElement().offsetLeft +
				"px";
			rangeEl.style.height =
				bottomRightCell.row.getElement().offsetTop +
				bottomRightCell.row.getElement().offsetHeight -
				topLeftCell.row.getElement().offsetTop +
				"px";

			this.overlay.appendChild(rangeEl);
		});
	}

	tableBuilt() {
		this.layoutElement();
	}

	handlePageChanged() {
		this.ranges = [new Range(0, 0)];
		this.layoutElement();
	}

	getCell(row, col) {
		return this.table.rowManager.getRowFromPosition(row + 1).getCells()[
			col + 1
		];
	}

	getActiveRange() {
		return this.ranges[this.ranges.length - 1];
	}

	getActiveCell() {
		var activeRange = this.getActiveRange();
		return this.getCell(activeRange.start.row, activeRange.start.col);
	}

	getRowsByRange(range) {
		return this.table.rowManager.activeRows.slice(
			range.minRow,
			range.maxRow + 1,
		);
	}

	getColumnsByRange(range) {
		return this.table.getColumns().slice(
			// skip row header
			range.minCol + 1,
			range.maxCol + 2,
		);
	}

	get rowsPerPage() {
		return this.table.rowManager.getVisibleRows().length;
	}

	get selectedRows() {
		return this.getRowsByRange(this.getActiveRange());
	}

	get selectedColumns() {
		return this.getColumnsByRange(this.getActiveRange());
	}
}

Spreadsheet.moduleName = "spreadsheet";

export default Spreadsheet;
