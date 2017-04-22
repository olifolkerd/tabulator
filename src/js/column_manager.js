var ColumnManager = function(table){
	var manager = {
		table:table, //hold parent table
		element:$("<div class='tabulator-header'></div>"), //containing element
		rowManager:null, //hold row manager object
		columns:[], // column definition object
		columnsByIndex:[], //columns by index
		columnsByField:[], //columns by field

		//////////////// Setup Functions /////////////////

		//link to row manager
		setRowManager:function(manager){
			this.rowManager = manager;
		},

		//return containing element
		getElement:function(){
			return this.element;
		},

		//scroll horizontally to match table body
		scrollHoz:function(left){
			var self = this;
			var hozAdjust = 0;
			var scrollWidth = self.element[0].scrollWidth - table.element.innerWidth();

			self.element(left);

			//adjust for vertical scrollbar moving table when present
			if(left > scrollWidth){
				hozAdjust = left - scrollWidth
				self.element.css("margin-left", -(hozAdjust));
			}else{
				self.element.css("margin-left", 0);
			}

			//keep frozen columns fixed in position
			//self._calcFrozenColumnsPos(hozAdjust + 3);
		},


		///////////// Column Setup Functions /////////////

		setColumns:function(cols, row){
			var self = this;

			self.element.empty();

			cols.forEach(function(def, i){
				var col = new Column(def, self, row);

				self.columns.push(col);
				self.element.append(col.getElement());
			});
		},

		registerColumnPosition:function(col){
			this.columnsByIndex.push(col);

			if(col.definition.field){
				this.columnsByField[col.definition.field] = col;
			}
		},


		//// Column Sort Arrows
		clearSort:function(){

			this.columnsByField.forEach(function(col){
				col.element.attr("sortdir", "ascending")
				.attr("aria-sort", "none");
			});

		},

		setSort:function(field, dir){

			var col = this.columnsByField[field];

			if(col){
				col.element.attr("sortdir", dir)
				.attr("aria-sort", dir == "asc" ? "ascending" : "descending");
			}

		},

		//////////////// Cell Management /////////////////

		generateCells:function(row){
			var self = this;

			var cells = [];

			self.columnsByIndex.forEach(function(column){
				cells.push(column.generateCell(row));
			});

			return cells;
		},
	}

	//initialize manager


	return manager;
}