import Column from './Column.js';

//public column object
export default class ColumnComponent {
	constructor (column){
		this._column = column;
		this.type = "ColumnComponent";

		return new Proxy(this, {
			get: function(target, name, receiver) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				}else{
					return target._column.table.componentFunctionBinder.handle("column", target._column, name)
				}
			}
		})
	}

	getElement(){
		return this._column.getElement();
	}

	getDefinition(){
		return this._column.getDefinition();
	}

	getField(){
		return this._column.getField();
	}

	getTitleDownload() {
		return this._column.getTitleDownload();
	}

	getCells(){
		var cells = [];

		this._column.cells.forEach(function(cell){
			cells.push(cell.getComponent());
		});

		return cells;
	}

	isVisible(){
		return this._column.visible;
	}

	show(){
		if(this._column.isGroup){
			this._column.columns.forEach(function(column){
				column.show();
			});
		}else{
			this._column.show();
		}
	}

	hide(){
		if(this._column.isGroup){
			this._column.columns.forEach(function(column){
				column.hide();
			});
		}else{
			this._column.hide();
		}
	}

	toggle(){
		if(this._column.visible){
			this.hide();
		}else{
			this.show();
		}
	}

	delete(){
		return this._column.delete();
	}

	getSubColumns(){
		var output = [];

		if(this._column.columns.length){
			this._column.columns.forEach(function(column){
				output.push(column.getComponent());
			});
		}

		return output;
	}

	getParentColumn(){
		return this._column.parent instanceof Column ? this._column.parent.getComponent() : false;
	}

	_getSelf(){
		return this._column;
	}

	scrollTo(){
		return this._column.table.columnManager.scrollToColumn(this._column);
	}

	getTable(){
		return this._column.table;
	}

	move(to, after){
		var toColumn = this._column.table.columnManager.findColumn(to);

		if(toColumn){
			this._column.table.columnManager.moveColumn(this._column, toColumn, after)
		}else{
			console.warn("Move Error - No matching column found:", toColumn);
		}
	}

	getNextColumn(){
		var nextCol = this._column.nextColumn();

		return nextCol ? nextCol.getComponent() : false;
	}

	getPrevColumn(){
		var prevCol = this._column.prevColumn();

		return prevCol ? prevCol.getComponent() : false;
	}

	updateDefinition(updates){
		return this._column.updateDefinition(updates);
	}

	getWidth(){
		return this._column.getWidth();
	}

	setWidth(width){
		var result;

		if(width === true){
			result =  this._column.reinitializeWidth(true);
		}else{
			result =  this._column.setWidth(width);
		}

		this._column.table.columnManager.renderer.rerenderColumns(true);

		return result;
	}
}