export default class SheetComponent {
	constructor(sheet) {
		this._sheet = sheet;

		return new Proxy(this, {
			get: function (target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._sheet.table.componentFunctionBinder.handle("sheet", target._sheet, name);
				}
			},
		});
	}

	getData() {
		return this._sheet.getData();
	}

	setData(data) {
		return this._sheet.setData(data);
	}
}