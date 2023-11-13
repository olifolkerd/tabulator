export default {
	keyBlock:function(e){
		e.stopPropagation();
		e.preventDefault();
	},
	scrollPageUp:function(e){
		var rowManager = this.table.rowManager,
		newPos = rowManager.scrollTop - rowManager.element.clientHeight;

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
		newPos = rowManager.scrollTop + rowManager.element.clientHeight,
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
		this.dispatch("keybinding-nav-prev", e);
	},

	navNext:function(e){
		this.dispatch("keybinding-nav-next", e);
	},

	navLeft:function(e){
		this.dispatch("keybinding-nav-left", e);
	},

	navRight:function(e){
		this.dispatch("keybinding-nav-right", e);
	},

	navUp:function(e){
		this.dispatch("keybinding-nav-up", e);
	},

	navDown:function(e){
		this.dispatch("keybinding-nav-down", e);
	},

	spreadsheetJumpLeft: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("jump", "left");
	},
	spreadsheetJumpRight: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("jump", "right");
	},
	spreadsheetJumpUp: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("jump", "up");
	},
	spreadsheetJumpDown: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("jump", "down");
	},
	spreadsheetExpandLeft: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand", "left");
	},
	spreadsheetExpandRight: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand", "right");
	},
	spreadsheetExpandUp: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand", "up");
	},
	spreadsheetExpandDown: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand", "down");
	},
	spreadsheetExpandJumpLeft: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand-jump", "left");
	},
	spreadsheetExpandJumpRight: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand-jump", "right");
	},
	spreadsheetExpandJumpUp: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand-jump", "up");
	},
	spreadsheetExpandJumpDown: function(e){
		if (!this.table.options.spreadsheet) return;
		e.preventDefault();
		this.table.modules.spreadsheet.navigate("expand-jump", "down");
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
