//public row object
export default class RowComponent {

	constructor (row){
		this._row = row;
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

	getPosition(active){
		return this._row.table.rowManager.getRowPosition(this._row, active);
	}

	delete(){
		return this._row.delete();
	}

	scrollTo(){
		return this._row.table.rowManager.scrollToRow(this._row);
	}

	pageTo(){
		if(this._row.table.modExists("page", true)){
			return this._row.table.modules.page.setPageToRow(this._row);
		}
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

	select(){
		this._row.table.modules.selectRow.selectRows(this._row);
	}

	deselect(){
		this._row.table.modules.selectRow.deselectRows(this._row);
	}

	toggleSelect(){
		this._row.table.modules.selectRow.toggleRow(this._row);
	}

	isSelected(){
		return this._row.table.modules.selectRow.isRowSelected(this._row);
	}

	_getSelf(){
		return this._row;
	}

	validate(){
		return this._row.validate();
	}

	freeze(){
		if(this._row.table.modExists("frozenRows", true)){
			this._row.table.modules.frozenRows.freezeRow(this._row);
		}
	}

	unfreeze(){
		if(this._row.table.modExists("frozenRows", true)){
			this._row.table.modules.frozenRows.unfreezeRow(this._row);
		}
	}

	isFrozen(){
		if(this._row.table.modExists("frozenRows", true)){
			var index = this._row.table.modules.frozenRows.rows.indexOf(this._row);
			return index > -1;
		}

		return false;
	}

	treeCollapse(){
		if(this._row.table.modExists("dataTree", true)){
			this._row.table.modules.dataTree.collapseRow(this._row);
		}
	}

	treeExpand(){
		if(this._row.table.modExists("dataTree", true)){
			this._row.table.modules.dataTree.expandRow(this._row);
		}
	}

	treeToggle(){
		if(this._row.table.modExists("dataTree", true)){
			this._row.table.modules.dataTree.toggleRow(this._row);
		}
	}

	getTreeParent(){
		if(this._row.table.modExists("dataTree", true)){
			return this._row.table.modules.dataTree.getTreeParent(this._row);
		}

		return false;
	}

	getTreeChildren(){
		if(this._row.table.modExists("dataTree", true)){
			return this._row.table.modules.dataTree.getTreeChildren(this._row, true);
		}

		return false;
	}

	addTreeChild(data, pos, index){
		if(this._row.table.modExists("dataTree", true)){
			return this._row.table.modules.dataTree.addTreeChildRow(this._row, data, pos, index);
		}

		return false;
	}

	reformat(){
		return this._row.reinitialize();
	}

	getGroup(){
		return this._row.getGroup().getComponent();
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