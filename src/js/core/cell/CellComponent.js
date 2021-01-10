//public cell object
export default class CellComponent {

	constructor (cell){
		this._cell = cell;
	}

	getValue(){
		return this._cell.getValue();
	}

	getOldValue(){
		return this._cell.getOldValue();
	}

	getInitialValue(){
		return this._cell.initialValue;
	}

	getElement(){
		return this._cell.getElement();
	}

	getRow(){
		return this._cell.row.getComponent();
	}

	getData(){
		return this._cell.row.getData();
	}

	getField(){
		return this._cell.column.getField();
	}

	getColumn(){
		return this._cell.column.getComponent();
	}

	setValue(value, mutate){
		if(typeof mutate == "undefined"){
			mutate = true;
		}

		this._cell.setValue(value, mutate);
	}

	restoreOldValue(){
		this._cell.setValueActual(this._cell.getOldValue());
	}

	restoreInitialValue(){
		this._cell.setValueActual(this._cell.initialValue);
	}

	edit(force){
		return this._cell.edit(force);
	}

	cancelEdit(){
		this._cell.cancelEdit();
	}

	isEdited(){
		return !! this._cell.modules.edit && this._cell.modules.edit.edited;
	}

	clearEdited(){
		if(self.table.modExists("edit", true)){
			this._cell.table.modules.edit.clearEdited(this._cell);
		}
	}

	isValid(){
		return this._cell.modules.validate ? !this._cell.modules.validate.invalid : true;
	}

	validate(){
		return this._cell.validate();
	}

	clearValidation(){
		if(this._cell.table.modExists("validate", true)){
			this._cell.table.modules.validate.clearValidation(this._cell);
		}
	}

	nav(){
		return this._cell.nav();
	}

	checkHeight(){
		this._cell.checkHeight();
	}

	getTable(){
		return this._cell.table;
	}

	_getSelf(){
		return this._cell;
	}
}