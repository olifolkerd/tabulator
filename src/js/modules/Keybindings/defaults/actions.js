export default {
	keyBlock:function(e){
		e.stopPropagation();
		e.preventDefault();
	},
	scrollPageUp:function(e){
		var rowManager = this.table.rowManager,
		newPos = rowManager.scrollTop - rowManager.height,
		scrollMax = rowManager.element.scrollHeight;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			if(newPos >= 0){
				rowManager.element.scrollTop = newPos;
			}else{
				rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
			}
		}

		this.table.element.focus();
	},
	scrollPageDown:function(e){
		var rowManager = this.table.rowManager,
		newPos = rowManager.scrollTop + rowManager.height,
		scrollMax = rowManager.element.scrollHeight;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			if(newPos <= scrollMax){
				rowManager.element.scrollTop = newPos;
			}else{
				rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
			}
		}

		this.table.element.focus();

	},
	scrollToStart:function(e){
		var rowManager = this.table.rowManager;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
		}

		this.table.element.focus();
	},
	scrollToEnd:function(e){
		var rowManager = this.table.rowManager;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
		}

		this.table.element.focus();
	},
	navPrev:function(e){
		var cell = false;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();
				cell.nav().prev();
			}
		}
	},

	navNext:function(e){
		var cell = false;
		var newRow = this.table.options.tabEndNewRow;
		var nav;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();

				nav = cell.nav();

				if(!nav.next()){
					if(newRow){

						cell.getElement().firstChild.blur();

						if(newRow === true){
							newRow = this.table.addRow({})
						}else{
							if(typeof newRow == "function"){
								newRow = this.table.addRow(newRow(cell.row.getComponent()))
							}else{
								newRow = this.table.addRow(Object.assign({}, newRow));
							}
						}

						newRow.then(() => {
							setTimeout(() => {
								nav.next();
							})
						});
					}
				}
			}
		}
	},

	navLeft:function(e){
		var cell = false;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();
				cell.nav().left();
			}
		}
	},

	navRight:function(e){
		var cell = false;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();
				cell.nav().right();
			}
		}
	},

	navUp:function(e){
		var cell = false;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();
				cell.nav().up();
			}
		}
	},

	navDown:function(e){
		var cell = false;

		if(this.table.modExists("edit")){
			cell = this.table.modules.edit.currentCell;

			if(cell){
				e.preventDefault();
				cell.nav().down();
			}
		}
	},

	undo:function(e){
		var cell = false;
		if(this.table.options.history && this.table.modExists("history") && this.table.modExists("edit")){

			cell = this.table.modules.edit.currentCell;

			if(!cell){
				e.preventDefault();
				this.table.modules.history.undo();
			}
		}
	},

	redo:function(e){
		var cell = false;
		if(this.table.options.history && this.table.modExists("history") && this.table.modExists("edit")){

			cell = this.table.modules.edit.currentCell;

			if(!cell){
				e.preventDefault();
				this.table.modules.history.redo();
			}
		}
	},

	copyToClipboard:function(e){
		if(!this.table.modules.edit.currentCell){
			if(this.table.modExists("clipboard", true)){
				this.table.modules.clipboard.copy(false, true);
			}
		}
	},
};