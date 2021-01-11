import Module from '../../core/Module.js';

import defaultUndoers from './defaults/undoers.js';
import defaultRedoers from './defaults/redoers.js';

class History extends Module{

	static moduleName = "history";

	//load defaults
	static undoers = defaultUndoers;
	static redoers = defaultRedoers;

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

			History.undoers[action.type].call(this, action);

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

			History.redoers[action.type].call(this, action);

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

// Tabulator.registerModule("history", History);
export default History;