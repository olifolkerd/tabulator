import CoreFeature from '../../core/CoreFeature.js';
import RangeComponent from "./RangeComponent";

class Range extends CoreFeature{
	constructor(table, rangeManager, row, col, element) {
		super(table);

		this.rangeManager = rangeManager;

		this.initialized = false;
		this.initializing = {
			start:false,
			end:false,
		};

		this.table = table;
		this.start = { row, col };
		this.end = { row, col };
		this._updateMinMax();
		this.element = element;
	}

	setStart(row, col) {
		if(this.start.row !== row || this.start.col !== col){
			this.start.row = row;
			this.start.col = col;
			
			this.initializing.start = true;
			this._updateMinMax();
		}
	}

	setEnd(row, col) {
		if(this.end.row !== row || this.end.col !== col){
			this.end.row = row;
			this.end.col = col;

			this.initializing.end = true;
			this._updateMinMax();
		}
	}

	_updateMinMax() {
		this.top = Math.min(this.start.row, this.end.row);
		this.bottom = Math.max(this.start.row, this.end.row);
		this.left = Math.min(this.start.col, this.end.col);
		this.right = Math.max(this.start.col, this.end.col);

		// console.log("update", this.initialized, this.initializing.start, this.initializing.end)

		if(this.initialized){
			this.dispatchExternal("rangeChanged", this.getComponent());
		}else{
			if(this.initializing.start && this.initializing.end){
				this.initialized = true;
				this.dispatchExternal("rangeAdded", this.getComponent());
			}
		}
	}

	atTopLeft(cell) {
		return (
			cell.row.position - 1 === this.top &&
			cell.column.getPosition() - 2 === this.left
		);
	}

	atBottomRight(cell) {
		return (
			cell.row.position - 1 === this.bottom &&
			cell.column.getPosition() - 2 === this.right
		);
	}

	occupies(cell) {
		return this.occupiesRow(cell.row) && this.occupiesColumn(cell.column);
	}

	occupiesRow(row) {
		return this.top <= row.position - 1 && row.position - 1 <= this.bottom;
	}

	occupiesColumn(col) {
		return this.left <= col.getPosition() - 2 && col.getPosition() - 2 <= this.right;
	}

	overlaps(left, top, right, bottom) {
		if (this.left > right || left > this.right) return false;
		if (this.top > bottom || top > this.bottom) return false;
		return true;
	}

	getData() {
		return this.rangeManager.getDataByRange(this);
	}

	getCells() {
		return this.rangeManager.getCellsByRange(this);
	}

	getStructuredCells() {
		return this.rangeManager.getCellsByRange(this, true);
	}

	getRows() {
		return this.rangeManager.getRowsByRange(this);
	}

	getColumns() {
		return this.rangeManager.getColumnsByRange(this);
	}

	getComponent() {
		if (!this.component) {
			this.component = new RangeComponent(this);
		}
		return this.component;
	}

	destroy() {
		this.element.remove();

		if(this.initialized){
			this.dispatchExternal("rangeRemoved", this.getComponent());
		}
	}
}

export default Range;
