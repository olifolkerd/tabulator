import RangeComponent from "./RangeComponent";

class Range {
	constructor(table, row, col, element) {
		this.table = table;
		this.start = { row, col };
		this.end = { row, col };
		this._updateMinMax();
		this.element = element;
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

	atTopLeft(cell) {
		return (
			cell.row.position - 1 === this.minRow &&
			cell.column.position - 2 === this.minCol
		);
	}

	atBottomRight(cell) {
		return (
			cell.row.position - 1 === this.maxRow &&
			cell.column.position - 2 === this.maxCol
		);
	}

	occupies(cell) {
		return this.occupiesRow(cell.row) && this.occupiesColumn(cell.column);
	}

	occupiesRow(row) {
		return this.minRow <= row.position - 1 && row.position - 1 <= this.maxRow;
	}

	occupiesColumn(col) {
		return this.minCol <= col.position - 2 && col.position - 2 <= this.maxCol;
	}

	getData() {
		return this.table.modules.spreadsheet.getDataByRange(this);
	}

	getCells() {
		return this.table.modules.spreadsheet.getCellsByRange(this);
	}

	getStructuredCells() {
		return this.table.modules.spreadsheet.getCellsByRange(this, true);
	}

	getComponent() {
		if (!this.component) {
			this.component = new RangeComponent(this);
		}
		return this.component;
	}

	destroy() {
		this.element.remove();
	}
}

export default Range;
