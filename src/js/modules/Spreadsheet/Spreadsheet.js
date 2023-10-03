import Module from "../../core/Module.js";

class Spreadsheet extends Module {
	constructor(table) {
		super(table);
		this.registerTableOption("spreadsheet", false); //enable Spreadsheet mode
		this.registerTableOption("spreadsheetRowHeader", "row-id"); //table header field to identify row
		this.rowCounter = 1;
		this.selectStart = { row: 1, col: 1 };
		this.selectEnd = { row: 1, col: 1 };
	}

	initialize() {
		if (!this.table.options.spreadsheet) return;

		// Avoid clashing with SelectRow module
		if (this.table.options.spreadsheet && this.table.options.selectable) {
			console.warn(
				"Spreadsheet Warning - disable SelectRow module to use spreadsheet.",
				"Tips: Add this to your table options `selectable: false`.",
			);
			return;
		}

		this.table.options.columns = [
			{
				title: "",
				field: this.options("spreadsheetRowHeader"),
				headerSort: false,
				resizable: false,
				frozen: true,
				editable: false,
				cssClass: "tabulator-row-header",
			},
			...this.table.options.columns,
		];

		this.subscribe("row-init", this.initializeRow.bind(this));
		this.subscribe("cell-format", this.formatCell.bind(this));
		this.subscribe("cell-click", this.clickCell.bind(this));
		this.subscribe("cell-layout", this.layoutCell.bind(this));

		this.table.element.classList.add("tabulator-spreadsheet");
	}

	layoutCell(cell) {
		var el = cell.getElement();
		el.classList.toggle("tabulator-cell-selected", this.isSelectedCell(cell));
		el.classList.toggle(
			"tabulator-select-range-start",
			this.isSelectedStartCell(cell),
		);
		el.classList.toggle(
			"tabulator-select-range-end",
			this.isSelectedEndCell(cell),
		);
	}

	layoutRow(row) {
		row
			.getElement()
			.classList.toggle("tabulator-row-selected", this.selectingRow(row.id));
		row.cells.forEach((cell) => {
			this.layoutCell(cell);
		});
	}

	selectingRow(index) {
		return (
			this.selectStart.col === 1 &&
			this.selectEnd.col === this.table.columnManager.columns.length - 1 &&
			index >= this.selectStart.row &&
			index <= this.selectEnd.row
		);
	}

	isSelectedCell(cell) {
		const columnIndex = this.table.columnManager.findColumnIndex(cell.column);
		const rowIndex = cell.row.id;
		return (
			rowIndex >= this.selectStart.row &&
			rowIndex <= this.selectEnd.row &&
			columnIndex >= this.selectStart.col &&
			columnIndex <= this.selectEnd.col
		);
	}

	isSelectedStartCell(cell) {
		const columnIndex = this.table.columnManager.findColumnIndex(cell.column);
		const rowIndex = cell.row.id;
		return (
			rowIndex === this.selectStart.row && columnIndex === this.selectStart.col
		);
	}

	isSelectedEndCell(cell) {
		const columnIndex = this.table.columnManager.findColumnIndex(cell.column);
		const rowIndex = cell.row.id;
		return (
			rowIndex === this.selectEnd.row && columnIndex === this.selectEnd.col
		);
	}

	clickCell(event, cell) {
		if (event.shiftKey) this.selectRange(cell);
		else this.selectCell(cell);
	}

	selectCell(cell) {
		var col = this.table.columnManager.findColumnIndex(cell.column);
		var row = cell.row.id;
		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			this.selectStart = { col: col + 1, row };
			this.selectEnd = {
				col: this.table.columnManager.getColumns().length - 1,
				row,
			};
		} else {
			this.selectStart = { col, row };
			this.selectEnd = { col, row };
		}
		this.layoutVisible();
	}

	selectRange(cell) {
		var col = this.table.columnManager.findColumnIndex(cell.column);
		var row = cell.row.id;
		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			this.selectEnd = {
				col: this.table.columnManager.getColumns().length - 1,
				row,
			};
		} else {
			this.selectEnd = { col, row };
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

	initializeRow(row) {
		row.id = this.rowCounter++;
	}

	formatCell(cell, value) {
		if (cell.column.field === this.options("spreadsheetRowHeader")) {
			return cell.row.id;
		}
		return value;
	}
}

Spreadsheet.moduleName = "spreadsheet";

export default Spreadsheet;
