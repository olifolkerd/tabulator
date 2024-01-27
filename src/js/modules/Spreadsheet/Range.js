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
		this.top = Math.min(this.start.row, this.end.row);
		this.bottom = Math.max(this.start.row, this.end.row);
		this.left = Math.min(this.start.col, this.end.col);
		this.right = Math.max(this.start.col, this.end.col);
	}

	atTopLeft(cell) {
		return (
			cell.row.position - 1 === this.top &&
			cell.column.position - 2 === this.left
		);
	}

	atBottomRight(cell) {
		return (
			cell.row.position - 1 === this.bottom &&
			cell.column.position - 2 === this.right
		);
	}

	occupies(cell) {
		return this.occupiesRow(cell.row) && this.occupiesColumn(cell.column);
	}

	occupiesRow(row) {
		return this.top <= row.position - 1 && row.position - 1 <= this.bottom;
	}

	occupiesColumn(col) {
		return this.left <= col.position - 2 && col.position - 2 <= this.right;
	}

	overlaps(left, top, right, bottom) {
		if (this.left > right || left > this.right) return false;
		if (this.top > bottom || top > this.bottom) return false;
		return true;
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

	getRows() {
		return this.table.modules.spreadsheet.getRowsByRange(this);
	}

	getColumns() {
		return this.table.modules.spreadsheet.getColumnsByRange(this);
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
