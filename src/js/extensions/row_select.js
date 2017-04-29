var RowSelect = function(table){

	var extension = {
		table:table, //hold Tabulator object

		selecting:false, //flag selecting in progress
		selectPrev:[], //hold previously selected element for drag drop selection

		selectedRows:[], //hold selected rows

		initializeRow:function(row){
			var self = this,
			element = row.getElement();

			// trigger end of row selection
			var endSelect = function(){

				setTimeout(function(){
					self.selecting = false;
				}, 50)

				$("body").off("mouseup", endSelect);
			}


			row.extensions.select = {selected:false};

			//set row selection class
			if(self.table.options.selectableCheck(row.getData(), element)){
				element.addClass("tabulator-selectable").removeClass("tabulator-unselectable");

				if(self.options.selectable && self.options.selectable != "highlight"){
					element.on("click", function(e){
						if(!self.selecting){
							self.toggleRow(row);
						}
					});

					element.on("mousedown", function(e){
						if(e.shiftKey){
							self.selecting = true;

							self.selectPrev = [];

							$("body").on("mouseup", endSelect);
							$("body").on("keyup", endSelect);

							self.toggleRow(row);

							return false;
						}
					});

					element.on("mouseenter", function(e){
						if(self.selecting){
							self.toggleRow(row);

							if(self.selectPrev[1] == row){
								self.toggleRow($(self.selectPrev[0]));
							}
						}
					});

					element.on("mouseout", function(e){
						if(self.selecting){
							self.selectPrev.unshift(row);
						}
					});
				}

			}else{
				row.getElement().addClass("tabulator-unselectable").removeClass("tabulator-selectable");
			}

		},

		toggleRow:function(row){

		},

		selectRow:function(row){

		},

		deselectRow:function(row){

		},

		getSelectedData:function(){

		},

		_rowSelectionChanged:function(){

		},

		clear:function(){

		},
	}

	return extension;
}

Tabulator.registerExtension("rowSelect", RowSelect);