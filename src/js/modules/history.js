import Module from './module.js';

class History extends Module{

	constructor(table){
		super(table);

		this.history = [];
		this.index = -1;
	}

	clear(){
		this.history = [];
		this.index = -1;
	}

	action(type, component, data){
		this.history = this.history.slice(0, this.index + 1);

		this.history.push({
			type:type,
			component:component,
			data:data,
		});

		this.index ++;
	}

	getHistoryUndoSize(){
		return this.index + 1;
	}

	getHistoryRedoSize(){
		return this.history.length - (this.index + 1);
	}

	clearComponentHistory(component){
		var index = this.history.findIndex(function(item){
			return item.component === component;
		});

		if(index > -1){
			this.history.splice(index, 1);
	 		if(index <= this.index){
	 			this.index--;
	 		}

	 		this.clearComponentHistory(component);
		}
	}

	undo(){
		if(this.index > -1){
			let action = this.history[this.index];

			this.undoers[action.type].call(this, action);

			this.index--;

			this.table.options.historyUndo.call(this.table, action.type, action.component.getComponent(), action.data);

			return true;
		}else{
			console.warn("History Undo Error - No more history to undo");
			return false;
		}
	}

	redo(){
		if(this.history.length-1 > this.index){

			this.index++;

			let action = this.history[this.index];

			this.redoers[action.type].call(this, action);

			this.table.options.historyRedo.call(this.table, action.type, action.component.getComponent(), action.data);

			return true;
		}else{
			console.warn("History Redo Error - No more history to redo");
			return false;
		}
	}

	//rebind rows to new element after deletion
	_rebindRow(oldRow, newRow){
		this.history.forEach(function(action){
			if(action.component instanceof Row){
				if(action.component === oldRow){
					action.component = newRow;
				}
			}else if(action.component instanceof Cell){
				if(action.component.row === oldRow){
					var field = action.component.column.getField();

					if(field){
						action.component = newRow.getCell(field);
					}

				}
			}
		});
	}
}

History.prototype.undoers = {
	cellEdit: function(action){
		action.component.setValueProcessData(action.data.oldValue);
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


History.prototype.redoers = {
	cellEdit: function(action){
		action.component.setValueProcessData(action.data.newValue);
	},

	rowAdd: function(action){
		var newRow = this.table.rowManager.addRowActual(action.data.data, action.data.pos, action.data.index);

		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			this.table.modules.groupRows.updateGroupRows(true);
		}

		this._rebindRow(action.component, newRow);
	},

	rowDelete:function(action){
		action.component.deleteActual();
	},

	rowMove: function(action){
		this.table.rowManager.moveRowActual(action.component, this.table.rowManager.rows[action.data.posTo], action.data.after);
		this.table.rowManager.redraw();
	},
};


// Tabulator.prototype.registerModule("history", History);
module.exports = History;