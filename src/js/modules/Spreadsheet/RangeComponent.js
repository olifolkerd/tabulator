class RangeComponent {
	constructor(range) {
		this._range = range;

		return new Proxy(this, {
			get: function (target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._range.table.componentFunctionBinder.handle(
						"range",
						target._range,
						name,
					);
				}
			},
		});
	}

	getElement() {
		return this._range.element;
	}

	getData() {
		return this._range.getData();
	}

	getCells() {
		return this._range.getCells();
	}

	getStructuredCells() {
		return this._range.getStructuredCells();
	}

	getRows() {
		return this._range.getRows();
	}

	getColumns() {
		return this._range.getColumns();
	}

	getTop() {
		return this._range.top;
	}

	getBottom() {
		return this._range.bottom;
	}
}

export default RangeComponent;
