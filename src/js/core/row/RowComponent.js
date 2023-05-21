//public row object
export default class RowComponent {

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

	getIndex(){
		return this._row.getData("data")[this._row.table.options.index];
	}

	getPosition(){
		return this._row.getPosition();
	}

	watchPosition(callback){
		return this._row.watchPosition(callback);
	}

	delete(){
		return this._row.delete();
	}

	scrollTo(position, ifVisible){
		return this._row.table.rowManager.scrollToRow(this._row, position, ifVisible);
	}

	move(to, after){
		this._row.moveToRow(to, after);
	}

	update(data){
		return this._row.updateData(data);
	}

	normalizeHeight(){
		this._row.normalizeHeight(true);
	}

	_getSelf(){
		return this._row;
	}

	reformat(){
		return this._row.reinitialize();
	}

	getTable(){
		return this._row.table;
	}

	getNextRow(){
		var row = this._row.nextRow();
		return row ? row.getComponent() : row;
	}

	getPrevRow(){
		var row = this._row.prevRow();
		return row ? row.getComponent() : row;
	}
}