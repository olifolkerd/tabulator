import Module from "../../core/Module.js";
import Helpers from "../../core/tools/Helpers.js";
import Range from "./Range.js";

class Spreadsheet extends Module {
	constructor(table) {
		super(table);

		this.selecting = "cell";
		this.mousedown = false;
		this.ranges = [];
		this.rowHeaderField = "--row-header";
		this.overlay = null;

		this.registerTableOption("spreadsheet", false); //enable spreadsheet
		this.registerTableOption("rowHeader", {}); //row header definition

		this.registerTableFunction("findRangeFromCell", this.findRangeFromCell.bind(this));
		this.registerTableFunction("findRangeFromRow", this.findRangeFromRow.bind(this));
		this.registerTableFunction("findRangeFromColumn", this.findRangeFromColumn.bind(this));
		this.registerTableFunction("getActiveRange", this.getActiveRange.bind(this, true));

		this.registerColumnOption("__spreadsheet_editable");
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
		this.subscribe("column-width", this.handleColumnWidth.bind(this));
		this.subscribe("column-resized", this.layoutSelection.bind(this));
		this.subscribe("cell-mousedown", this.handleCellMouseDown.bind(this));
		this.subscribe("cell-mousemove", this.handleCellMouseMove.bind(this));
		this.subscribe("cell-dblclick", this.handleCellDblClick.bind(this));
		this.subscribe("cell-rendered", this.renderCell.bind(this));
		this.subscribe("edit-success", this.unbindEditable.bind(this));
		this.subscribe("edit-cancelled", this.unbindEditable.bind(this));
		this.subscribe("page-changed", this.handlePageChanged.bind(this));
		this.subscribe("table-layout", this.layoutElement.bind(this));

		var debouncedLayoutElement = Helpers.debounce(this.layoutElement.bind(this), 200);

		this.subscribe("render-virtual-dom", () => {
			this.overlay.style.display = 'none';
			debouncedLayoutElement();
		})
	}

	initializeTable() {
		for (var column of this.table.options.columns) {
			// Disable sorting by clicking header
			column.headerSort = false;

			// Edit on double click
			var editable = column.editable !== undefined ? column.editable : true;
			column.__spreadsheet_editable = editable;
			column.editable = false;
		}

		var rowHeaderDef = {
			title: "",
			field: this.rowHeaderField,
			headerSort: false,
			resizable: false,
			frozen: true,
			editable: false,
			cssClass: "tabulator-row-header",
			formatter: "rownum",
			formatterParams: { relativeToPage: true },
			...this.options("rowHeader"),
		};

		this.rowHeaderField = rowHeaderDef.field;

		this.table.options.columns = [
			rowHeaderDef,
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
				this.overlay.style.padding = entry.target.style.padding;
			}
		});

		resizeObserver.observe(this.table.rowManager.tableElement);

		var mouseUpHandler = this.handleMouseUp.bind(this);

		document.addEventListener("mouseup", mouseUpHandler);

		this.subscribe("table-destroy", () => {
			document.removeEventListener(mouseUpHandler);
			this.resizeObserver.disconnect();
		});

		this.resetRanges();

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
				result[column.field] = rowData[column.field];
			});
			data.push(result);
		});

		return data;
	}

	getCellsByRange(range, structured) {
		var cells = [];
		var rows = this.getRowsByRange(range);
		var columns = this.getColumnsByRange(range);

		if (structured) {
			cells = rows.map((row) => {
				var arr = [];
				row.getCells().forEach((cell) => {
					if (columns.includes(cell.column)) {
						arr.push(cell.getComponent());
					}
				});
				return arr;
			});
		} else {
			rows.forEach((row) => {
				row.getCells().forEach((cell) => {
					if (columns.includes(cell.column)) {
						cells.push(cell.getComponent());
					}
				});
			});
		}

		return cells;
	}

	renderCell(cell) {
		var el = cell.getElement();

		el.classList.add("tabulator-spreadsheet");

		var rangeIdx = this.ranges.findIndex((range) => range.occupies(cell));

		el.classList.toggle("tabulator-cell-selected", rangeIdx !== -1);

		el.classList.toggle(
			"tabulator-only-cell-selected",
			this.ranges.length === 1 &&
				this.ranges[0].atTopLeft(cell) &&
				this.ranges[0].atBottomRight(cell),
		);

		el.dataset.range = rangeIdx;
	}

	handleColumnMouseDown(event, column) {
		if (
			event.button === 2 &&
			(this.selecting === "column" || this.selecting === "all") &&
			this.getActiveRange().occupiesColumn(column)
		) {
			return;
		}

		this.mousedown = true;

		this._select(event, column);
		this.layoutElement();
	}

	handleColumnMouseMove(_, column) {
		if (column.field === this.rowHeaderField) return;
		if (!this.mousedown) return;
		if (this.selecting === 'all') return;

		this.endSelection(column);
		this.layoutElement();
	}

	handleCellMouseDown(event, cell) {
		if (
			event.button === 2 &&
			(this.getActiveRange().occupies(cell) ||
				((this.selecting === "row" || this.selecting === "all") &&
					this.getActiveRange().occupiesRow(cell.row)))
		) {
			return;
		}

		this.mousedown = true;

		this._select(event, cell);
		this.layoutElement();
	}

	_select(event, element) {
		if (element.type === "column") {
			if (element.field === this.rowHeaderField) {
				this.resetRanges();
				this.selecting = "all";

				const topLeftCell = this.getCell(0, 0);
				const bottomRightCell = this.getCell(-1, -1);

				this.beginSelection(topLeftCell);
				this.endSelection(bottomRightCell);

				return;
			} else {
				this.selecting = "column";
			}
		} else if (element.column.field === this.rowHeaderField) {
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
			this.addRange();

			this.beginSelection(element);
			this.endSelection(element);
		} else {
			this.resetRanges();

			this.beginSelection(element);
			this.endSelection(element);
		}
	}

	handleCellMouseMove(_, cell) {
		if (!this.mousedown) return;
		if (this.selecting === "all") return;

		this.endSelection(cell);
		this.layoutElement();
	}

	handleMouseUp() {
		this.mousedown = false;
	}

	handleCellDblClick(_, cell) {
		if (cell.column.field === this.rowHeaderField) return;

		cell.column.definition.editable =
			cell.column.definition.__spreadsheet_editable;
		this.table.modules.edit.initializeColumnCheck(cell.column);

		cell.getComponent().edit();
	}

	unbindEditable(cell) {
		cell.column.definition.editable = false;
		this.table.modules.edit.initializeColumnCheck(cell.column);
	}

	beginSelection(element) {
		var range = this.getActiveRange();

		if (element.type === "column") {
			range.setStart(0, element.position - 2);
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;

		if (element.column.field === this.rowHeaderField) {
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
				range.setEnd(0, element.position - 2);
			}
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;
		var isRowHeader = element.column.field === this.rowHeaderField;

		if (this.selecting === "row") {
			range.setEnd(
				row,
				this.table.columnManager.getVisibleColumnsByIndex().length - 2,
			);
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

		this.table.columnManager.getVisibleColumnsByIndex().forEach((column) => {
			this.layoutColumn(column);
		});

		this.layoutSelection();
	}

	layoutRow(row) {
		var el = row.getElement();

		var selected = false;
		var occupied = this.ranges.some((range) => range.occupiesRow(row));

		if (this.selecting === "row") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}

		el.classList.add("tabulator-spreadsheet");
		el.classList.toggle("tabulator-row-selected", selected);
		el.classList.toggle("tabulator-row-highlight", occupied);
	}

	layoutColumn(column) {
		var el = column.getElement();

		var selected = false;
		var occupied = this.ranges.some((range) => range.occupiesColumn(column));

		if (this.selecting === "column") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}

		el.classList.add("tabulator-spreadsheet");
		el.classList.toggle("tabulator-col-selected", selected);
		el.classList.toggle("tabulator-col-highlight", occupied);
	}

	handleColumnWidth() {
		if (!this.table.initialized) return;
		this.layoutSelection();
	}

	layoutSelection() {
		this.overlay.style.display = null;

		var activeCell = this.getActiveCell();

		if (!activeCell) return;

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

		this.ranges.forEach((range) => this.layoutRange(range));
	}

	layoutRange(range) {
		var _vDomTop = this.table.rowManager.renderer.vDomTop ?? 0;
		var _vDomBottom = this.table.rowManager.renderer.vDomBottom ?? Infinity;
		var _vDomLeft = this.table.columnManager.renderer.leftCol ?? 0;
		var _vDomRight = this.table.columnManager.renderer.rightCol ?? Infinity;

		var top = range.top < _vDomTop ? _vDomTop : range.top;
		var bottom = range.bottom > _vDomBottom ? _vDomBottom : range.bottom;
		var left = range.left < _vDomLeft ? _vDomLeft : range.left;
		var right = range.right > _vDomRight ? _vDomRight : range.right;

		var topLeftCell = this.getCell(top, left);
		var bottomRightCell = this.getCell(bottom, right);

		range.element.classList.toggle(
			"tabulator-range-active",
			range === this.getActiveRange(),
		);

		range.element.style.left = topLeftCell.getElement().offsetLeft + "px";
		range.element.style.top = topLeftCell.row.getElement().offsetTop + "px";
		range.element.style.width =
			bottomRightCell.getElement().offsetLeft +
			bottomRightCell.getElement().offsetWidth -
			topLeftCell.getElement().offsetLeft +
			"px";
		range.element.style.height =
			bottomRightCell.row.getElement().offsetTop +
			bottomRightCell.row.getElement().offsetHeight -
			topLeftCell.row.getElement().offsetTop +
			"px";
	}

	handlePageChanged() {
		this.resetRanges();
		this.layoutElement();
	}

	findRangeFromColumn(column) {
		return this.ranges.find((range) => range.occupiesColumn(column._column));
	}

	findRangeFromRow(row) {
		return this.ranges.find((range) => range.occupiesRow(row._row));
	}

	findRangeFromCell(cell) {
		return this.ranges.find((range) => range.occupies(cell._cell));
	}

	findRangeByCellElement(cell) {
		var rangeIdx = cell.dataset.range;
		if (rangeIdx < 0) return;
		return this.ranges[rangeIdx].getComponent();
	}

	getCell(rowIdx, colIdx) {
		if (rowIdx < 0) {
			rowIdx = this.table.rowManager.getDisplayRows().length + rowIdx;
		}

		var row = this.table.rowManager.getRowFromPosition(rowIdx + 1);

		if (!row) return;

		if (colIdx < 0) {
			colIdx =
				this.table.columnManager.getVisibleColumnsByIndex().length + colIdx - 1;
		}

		if (colIdx < 0) return;

		return row.getCells().filter((cell) => cell.column.visible)[colIdx + 1];
	}

	getActiveRange(component) {
		const range = this.ranges[this.ranges.length - 1];
		if (component) return range?.getComponent();
		return range
	}

	getActiveCell() {
		var activeRange = this.getActiveRange();
		return this.getCell(activeRange.start.row, activeRange.start.col);
	}

	getRowsByRange(range) {
		return this.table.rowManager
			.getDisplayRows()
			.slice(range.top, range.bottom + 1);
	}

	getColumnsByRange(range) {
		return this.table.columnManager
			.getVisibleColumnsByIndex()
			.slice(range.left + 1, range.right + 2);
	}

	addRange() {
		var element = document.createElement("div");
		element.classList.add("tabulator-range");

		var range = new Range(this.table, 0, 0, element);

		this.ranges.push(range);
		this.rangeContainer.appendChild(element);
	}

	resetRanges() {
		this.ranges.forEach((range) => range.destroy());
		this.ranges = [];
		this.addRange(0, 0);
	}

	get selectedRows() {
		return this.getRowsByRange(this.getActiveRange());
	}

	get selectedColumns() {
		return this.getColumnsByRange(this.getActiveRange()).map((col) =>
			col.getComponent(),
		);
	}
}

Spreadsheet.moduleName = "spreadsheet";

export default Spreadsheet;
