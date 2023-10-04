import Module from "../../core/Module.js";

class Selection {
	constructor(row, col) {
		this.row = row;
		this.col = col;
	}

	set(row, col) {
		this.row = row;
		this.col = col;
	}
}

class RangeSelection {
	constructor() {
		this.start = new Selection(0, 0);
		this.end = new Selection(0, 0);
		this.updateMinMax();
	}

	setStart(row, col) {
		this.start.set(row, col);
		this.updateMinMax();
	}

	setEnd(row, col) {
		this.end.set(row, col);
		this.updateMinMax();
	}

	updateMinMax() {
		this.minRow = Math.min(this.start.row, this.end.row);
		this.maxRow = Math.max(this.start.row, this.end.row);
		this.minCol = Math.min(this.start.col, this.end.col);
		this.maxCol = Math.max(this.start.col, this.end.col);
	}

	withinSelection(row, col) {
		return (
			row >= this.minRow &&
			row <= this.maxRow &&
			col >= this.minCol &&
			col <= this.maxCol
		);
	}

	withinRow(row) {
		return row >= this.minRow && row <= this.maxRow;
	}
}

class Spreadsheet extends Module {
	constructor(table) {
		super(table);

		this.registerTableFunction(
			"getSelectedData",
			this.getSelectedData.bind(this),
		);

		this.range = new RangeSelection(this.selectStart, this.selectEnd);
		this.dragging = false;
	}

	initialize() {
		// Avoid clashing with SelectRow module
		if (this.table.modules.selectRow) {
			console.error(
				"Spreadsheet Error - Cannot use both SelectRow and Spreadsheet modules at the same time.",
			);
			return;
		}

		this.table.options.columns = [
			{
				title: "",
				headerSort: false,
				resizable: true,
				frozen: true,
				editable: false,
				cssClass: "tabulator-row-header",
			},
			...this.table.options.columns,
		];

		this.subscribe("cell-format", this.formatCell.bind(this));
		this.subscribe("cell-mousedown", this.mouseDownCell.bind(this));
		this.subscribe("cell-mousemove", this.moveCell.bind(this));
		this.subscribe("cell-layout", this.layoutCell.bind(this));
		this.subscribe("data-refreshed", this.dataRefreshed.bind(this));

		var mouseUpHandler = this.mouseUp.bind(this);
		var mouseUpHandler = document.addEventListener("mouseup", mouseUpHandler);
		this.subscribe("table-destroy", () =>
			document.removeEventListener(mouseUpHandler),
		);

		this.table.element.classList.add("tabulator-spreadsheet");

		window.table = this.table;
	}

	getSelectedData() {
		var data = [];
		var rows = this.table.getRows();
		var columns = this.table.columnManager.columnsByIndex.slice(
			// skip row header
			this.range.minCol + 1,
			this.range.maxCol + 2,
		);

		for (var r = this.range.minRow; r <= this.range.maxRow; r++) {
			var row = rows[r].getData();
			var result = {};
			columns.forEach((column) => {
				result[column.field] = row[column.field];
			});
			data.push(result);
		}

		return {
			data,
			rowCount: Math.abs(this.range.start.row - this.range.end.row) + 1,
			columnCount: Math.abs(this.range.start.col - this.range.end.col) + 1,
		};
	}

	layoutCell(cell) {
		var el = cell.getElement();
		el.classList.toggle("tabulator-cell-selected", this.isSelectedCell(cell));
		el.classList.toggle("tabulator-select-start", this.isSelectStartCell(cell));
		el.classList.toggle("tabulator-select-end", this.isSelectEndCell(cell));
	}

	layoutRow(row) {
		row
			.getElement()
			.classList.toggle(
				"tabulator-row-selected",
				this.selectingAllColumnsOfRow(row.position - 1),
			);
		row.cells.forEach((cell) => this.layoutCell(cell));
	}

	selectingAllColumnsOfRow(row) {
		return (
			this.range.start.col === 0 &&
			this.range.end.col === this.table.columnManager.columns.length - 2 &&
			this.range.withinRow(row)
		);
	}

	isSelectedCell(cell) {
		const row = cell.row.position - 1;
		const col = this.table.columnManager.findColumnIndex(cell.column) - 1;
		return this.range.withinSelection(row, col);
	}

	isSelectStartCell(cell) {
		const col = this.table.columnManager.findColumnIndex(cell.column) - 1;
		const row = cell.row.position - 1;
		return row === this.range.start.row && col === this.range.start.col;
	}

	isSelectEndCell(cell) {
		const col = this.table.columnManager.findColumnIndex(cell.column) - 1;
		const row = cell.row.position - 1;
		return row === this.range.end.row && col === this.range.end.col;
	}

	mouseDownCell(event, cell) {
		this.dragging = true;
		if (event.shiftKey) this.selectRange(cell);
		else this.selectCell(cell);
	}

	moveCell(event, cell) {
		if (this.dragging) this.selectRange(cell);
	}

	mouseUp() {
		this.dragging = false;
	}

	selectCell(cell) {
		var row = cell.row.position - 1;

		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			this.range.setStart(row, 0);
			this.range.setEnd(row, this.table.columnManager.getColumns().length - 2);
		} else {
			var col = this.table.columnManager.findColumnIndex(cell.column) - 1;
			this.range.setStart(row, col);
			this.range.setEnd(row, col);
		}

		this.layoutVisible();
	}

	selectRange(cell) {
		var col = this.table.columnManager.findColumnIndex(cell.column) - 1;
		var row = cell.row.position - 1;

		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			this.range.setEnd(row, this.table.columnManager.getColumns().length - 2);
		} else {
			this.range.setEnd(row, col);
		}

		this.layoutVisible();
	}

	layoutVisible() {
		var visibleRows = this.table.rowManager.getVisibleRows(true);
		visibleRows.forEach((row) => {
			if (row.type === "row") {
				this.layoutRow(row);
			}
		});
	}

	formatCell(cell, value) {
		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			return cell.row.position;
		}
		return value;
	}

	dataRefreshed() {
		this.layoutVisible();
	}
}

Spreadsheet.moduleName = "spreadsheet";

export default Spreadsheet;
