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

	getData() {
		return this._range.getData();
	}
}

export default RangeComponent;
