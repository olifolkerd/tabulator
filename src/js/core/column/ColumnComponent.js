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
					return target._column.table.componentFunctionMap("row", target._column, name)
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

	headerFilterFocus(){
		if(this._column.table.modExists("filter", true)){
			this._column.table.modules.filter.setHeaderFilterFocus(this._column);
		}
	}

	reloadHeaderFilter(){
		if(this._column.table.modExists("filter", true)){
			this._column.table.modules.filter.reloadHeaderFilter(this._column);
		}
	}

	getHeaderFilterValue(){
		if(this._column.table.modExists("filter", true)){
			return this._column.table.modules.filter.getHeaderFilterValue(this._column);
		}
	}

	setHeaderFilterValue(value){
		if(this._column.table.modExists("filter", true)){
			this._column.table.modules.filter.setHeaderFilterValue(this._column, value);
		}
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

		if(this._column.table.options.virtualDomHoz){
			this._column.table.vdomHoz.reinitialize(true);
		}

		return result;
	}

	validate(){
		return this._column.validate();
	}
}