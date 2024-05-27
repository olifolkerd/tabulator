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

	getTitle(){
		return this._sheet.title;
	}

	getKey(){
		return this._sheet.key;
	}

	getDefinition(){
		return this._sheet.getDefinition();
	}

	getData() {
		return this._sheet.getData();
	}

	setData(data) {
		return this._sheet.setData(data);
	}

	clear(){
		return this._sheet.clear();
	}

	remove(){
		return this._sheet.remove();
	}
	
	active(){
		return this._sheet.active();
	}

	setTitle(title){
		return this._sheet.setTitle(title);
	}

	setRows(rows){
		return this._sheet.setRows(rows);
	}

	setColumns(columns){
		return this._sheet.setColumns(columns);
	}
}