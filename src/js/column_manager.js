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

			if(self.table.options.fitColumns){
				self.fitToTable();
			}
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

		//////////////// Column Management /////////////////

		//resize columns to fit data in cells
		fitToData:function(){
			var self = this;

			console.log("fit to data")

			self.columnsByIndex.forEach(function(column){
				column.fitToData();
			});
		},

		//resize columns to fill the table element
		fitToTable:function(){
			var self = this;

			var totalWidth = self.table.element.innerWidth(); //table element width
			var fixedWidth = 0; //total width of columns with a defined width
			var flexWidth = 0; //total width available to flexible columns
			var flexColWidth = 0; //desired width of flexible columns
			var flexColumns = []; //array of flexible width columns
			var gapFill=0; //number of pixels to be added to final column to close and half pixel gaps

			//adjust for vertical scrollbar if present
			if(self.rowManager.element[0].scrollHeight > self.rowManager.element.innerHeight()){
				totWidth -= self.rowManager.element[0].offsetWidth - self.rowManager.element[0].clientWidth;
			}

			self.columnsByIndex.forEach(function(column){
				var width, minWidth, colWidth;

				if(column.visible){

					width = column.definition.width;

					if(width){
						minWidth =  parseInt(column.minWidth);

						if(typeof(width) == "string"){
							if(width.indexOf("%") > -1){
								colWidth = (totWidth / 100) * parseInt(width) ;
							}else{
								colWidth = parseInt(width);
							}
						}else{
							colWidth = width;
						}

						fixedWidth += colWidth > minWidth ? colWidth : minWidth;

					}else{
						flexColumns.push(column);
					}
				}
			});

			//calculate available space
			flexWidth = totalWidth - fixedWidth;

			//calculate correctl column size
			flexColWidth = Math.floor(flexWidth / flexColumns.length)

			//calculate any sub pixel space that needs to be filed by the last column
			gapFill = totalWidth - fixedWidth - (flexColWidth * flexColumns.length);
			gapFill = gapFill > 0 ? gapFill : 0;

			flexColumns.forEach(function(column, i){
				var width = flexColWidth >= column.minWidth ? flexColWidth : column.minWidth;

				if(i == flexColumns.length -1 && gapFill){
					width += gapFill;
				}

				column.setWidth(width);
			});
		},

		//redraw columns
		redraw:function(force){
			if(this.table.options.fitColumns){
				this.fitToTable();
			}else{
				if(force){
					this.fitToData();
				}
			}
		},
	}

	//initialize manager


	return manager;
}