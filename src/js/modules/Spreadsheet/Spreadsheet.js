import Module from "../../core/Module.js";
import Range from "./Range.js";

class Spreadsheet extends Module {
	constructor(table) {
		super(table);

		this.selecting = false;
		this.resetRanges();

		this.registerTableOption("spreadsheet", false); //enable spreadsheet
		this.registerTableOption("spreadsheetRowHeader", {}); //row header definition
		this.registerTableOption("rowHeaderField", "--row-header"); //field name for row header
	}

	initialize() {
		if (!this.table.options.spreadsheet) return;

		this.registerTableFunction(
			"getSelectedData",
			this.getSelectedData.bind(this),
		);

		this.initializeWatchers();
		this.initializeTable();
	}

	initializeWatchers() {
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
				resizable: false,
				frozen: true,
				editable: false,
				cssClass: "tabulator-row-header",
				formatter: "rownum",
				formatterParams: { relativeToPage: true },
				...this.table.options.spreadsheetRowHeader,
			},
			...this.table.options.columns,
		];

		this.table.options.clipboardCopyRowRange = "spreadsheet";

		this.overlay = document.createElement("div");
		this.overlay.classList.add("tabulator-range-overlay");

		this.rangeContainer = document.createElement("div");
		this.rangeContainer.classList.add("tabulator-range-container");

		this.activeRangeCellElement = document.createElement("div");
		this.activeRangeCellElement.classList.add("tabulator-range-cell-active");

		this.overlay.appendChild(this.rangeContainer);
		this.overlay.appendChild(this.activeRangeCellElement);

		var resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this.overlay.style.width = entry.contentRect.width + "px";
				this.overlay.style.height = entry.contentRect.height + "px";
			}
		});

		resizeObserver.observe(this.table.rowManager.tableElement);

		var mouseUpHandler = this.handleMouseUp.bind(this);

		document.addEventListener("mouseup", mouseUpHandler);

		this.subscribe("table-destroy", () => {
			document.removeEventListener(mouseUpHandler);
			this.resizeObserver.disconnect();
		});

		this.table.rowManager.element.appendChild(this.overlay);
	}

	getSelectedData() {
		return this.getDataByRange(this.getActiveRange());
	}

	getDataByRange(range) {
		var data = [];
		var rows = this.getRowsByRange(range);
		var columns = this.getColumnsByRange(range);

		rows.forEach((row) => {
			var rowData = row.getData();
			var result = {};
			columns.forEach((column) => {
				result[column._column.field] = rowData[column._column.field];
			});
			data.push(result);
		});

		return data;
	}

	renderCell(cell) {
		var el = cell.getElement();

		el.classList.add("tabulator-spreadsheet");

		var rangeIdx = this.ranges.findIndex((range) => range.occupies(cell));

		el.classList.toggle("tabulator-range-cell", rangeIdx !== -1);

		el.classList.toggle(
			"tabulator-range-single-cell",
			this.ranges.length === 1 &&
				this.ranges[0].atTopLeft(cell) &&
				this.ranges[0].atBottomRight(cell),
		);

		el.dataset.range = rangeIdx;
	}

	handleColumnMouseDown(event, column) {
		if (column.field === this.options("rowHeaderField")) {
			this.resetRanges();
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
		if (event.button === 2 && this.getActiveRange().occupies(cell)) return;

		this._select(event, cell);
		this.layoutElement();
	}

	handleCellContextMenu(event, cell) {
		var range = this.getActiveRange();
		if (event.button === 2 && range.occupies(cell)) {
			this.dispatchExternal("rangeContextMenu", event, range, cell);
		}
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
			this.ranges.push(new Range(this.table, 0, 0));

			this.beginSelection(element);
			this.endSelection(element);
		} else {
			this.resetRanges();

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
		var rowsCount = this.table.rowManager.getDisplayRows().length;

		if (element.type === "column") {
			if (this.selecting === "column") {
				range.setEnd(rowsCount - 1, element.position - 2);
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
			range.setEnd(rowsCount - 1, col);
		} else {
			range.setEnd(row, col);
		}
	}

	layoutElement() {
		this.table.rowManager.getVisibleRows(true).forEach((row) => {
			if (row.type === "row") {
				this.layoutRow(row);
				row.cells.forEach((cell) => this.renderCell(cell));
			}
		});

		this.table.columnManager.columns.forEach((column) => {
			this.layoutColumn(column);
		});

		this.renderSelection();
	}

	layoutRow(row) {
		var el = row.getElement();

		el.classList.add("tabulator-spreadsheet");

		var selected =
			this.selecting === "all" ||
			this.ranges.some(
				(range) =>
					this.selecting === "row" &&
					range.start.col === 0 &&
					range.end.col === this.table.columnManager.columns.length - 2 &&
					range.occupiesRow(row),
			);
		var highlight = this.ranges.some((range) => range.occupiesRow(row));

		el.classList.toggle("tabulator-row-selected", selected);
		el.classList.toggle("tabulator-row-highlight", highlight);
	}

	layoutColumn(column) {
		var el = column.getElement();

		el.classList.add("tabulator-spreadsheet");

		var rowsCount = this.table.rowManager.getDisplayRows().length;
		var selected =
			this.selecting === "all" ||
			this.ranges.some(
				(range) =>
					this.selecting === "column" &&
					range.start.row === 0 &&
					range.end.row === rowsCount - 1 &&
					range.occupiesColumn(column),
			);
		var highlight = this.ranges.some((range) => range.occupiesColumn(column));

		el.classList.toggle("tabulator-col-selected", selected);
		el.classList.toggle("tabulator-col-highlight", highlight);
	}

	handleColumnUpdating() {
		this.overlay.classList.add("tabulator-column-updating");
	}

	renderSelection() {
		this.overlay.classList.remove("tabulator-column-updating");

		while (this.rangeContainer.firstChild) {
			this.rangeContainer.removeChild(this.rangeContainer.firstChild);
		}

		var activeCell = this.getActiveCell();

		this.activeRangeCellElement.style.left =
			activeCell.getElement().offsetLeft + "px";
		this.activeRangeCellElement.style.top =
			activeCell.row.getElement().offsetTop + "px";
		this.activeRangeCellElement.style.width =
			activeCell.getElement().offsetLeft +
			activeCell.getElement().offsetWidth -
			activeCell.getElement().offsetLeft +
			"px";
		this.activeRangeCellElement.style.height =
			activeCell.row.getElement().offsetTop +
			activeCell.row.getElement().offsetHeight -
			activeCell.row.getElement().offsetTop +
			"px";

		var activeRange = this.getActiveRange();

		this.ranges.forEach((range) => {
			var topLeftCell = this.getCell(range.minRow, range.minCol);
			var bottomRightCell = this.getCell(range.maxRow, range.maxCol);

			var rangeEl = document.createElement("div");
			rangeEl.classList.add("tabulator-range");
			if (range === activeRange) {
				rangeEl.classList.add("tabulator-range-active");
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

			this.rangeContainer.appendChild(rangeEl);
		});
	}

	handlePageChanged() {
		this.resetRanges();
		this.layoutElement();
	}

	findRange(cell) {
		var rangeIdx = cell.dataset.range;
		if (rangeIdx < 0) return;
		return this.ranges[rangeIdx].getComponent();
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
		return this.table.getColumns().slice(range.minCol + 1, range.maxCol + 2);
	}

	resetRanges() {
		this.ranges = [new Range(this.table, 0, 0)];
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
