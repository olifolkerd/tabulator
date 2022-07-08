class CalcComponent{
	constructor (row){
		this._row = row;

		return new Proxy(this, {
			get: function(target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				}else{
					return target._row.table.componentFunctionBinder.handle("row", target._row, name);
				}
			}
		});
	}

	getData(transform){
		return this._row.getData(transform);
	}

	getElement(){
		return this._row.getElement();
	}

	getTable(){
		return this._row.table;
	}

	getCells(){
		var cells = [];

		this._row.getCells().forEach(function(cell){
			cells.push(cell.getComponent());
		});

		return cells;
	}

	getCell(column){
		var cell = this._row.getCell(column);
		return cell ? cell.getComponent() : false;
	}

	_getSelf(){
		return this._row;
	}
}

export default CalcComponent;