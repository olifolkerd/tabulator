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

	rangeJumpLeft: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, false, "left")) {
			e.preventDefault();
		}
	},
	rangeJumpRight: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, false, "right")) {
			e.preventDefault();
		}
	},
	rangeJumpUp: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, false, "up")) {
			e.preventDefault();
		}
	},
	rangeJumpDown: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, false, "down")) {
			e.preventDefault();
		}
	},
	rangeExpandLeft: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(false, true, "left")) {
			e.preventDefault();
		}
	},
	rangeExpandRight: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(false, true, "right")) {
			e.preventDefault();
		}
	},
	rangeExpandUp: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(false, true, "up")) {
			e.preventDefault();
		}
	},
	rangeExpandDown: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(false, true, "down")) {
			e.preventDefault();
		}
	},
	rangeExpandJumpLeft: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, true, "left")) {
			e.preventDefault();
		}
	},
	rangeExpandJumpRight: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, true, "right")) {
			e.preventDefault();
		}
	},
	rangeExpandJumpUp: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, true, "up")) {
			e.preventDefault();
		}
	},
	rangeExpandJumpDown: function(e){
		if (!this.table.options.selectableRange) return;
		if (this.table.modules.selectRange.navigate(true, true, "down")) {
			e.preventDefault();
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
