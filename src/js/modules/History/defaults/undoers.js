export default {
	cellEdit: function(action){
		action.component.setValueProcessData(action.data.oldValue);
		action.component.cellRendered();
	},

	rowAdd: function(action){
		action.component.deleteActual();
	},

	rowDelete: function(action){
		var newRow = this.table.rowManager.addRowActual(action.data.data, action.data.pos, action.data.index);

		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			this.table.modules.groupRows.updateGroupRows(true);
		}

		this._rebindRow(action.component, newRow);
	},

	rowMove: function(action){
		this.table.rowManager.moveRowActual(action.component, this.table.rowManager.rows[action.data.posFrom], !action.data.after);
		this.table.rowManager.redraw();
	},
};