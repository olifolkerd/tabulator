var ColumnManager = function(table){
	var manager = {
		table:table, //hold parent table
		element:$("<div class='tabulator-header'></div>"), //containing element
		rowManager:null, //hold row manager object
		columns:[], // column definition object
		columnsByIndex:[], //columns by index
		columnsByField:[], //columns by field

		scrollLeft:0,

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
		scrollHorizontal:function(left){
			var self = this;
			var hozAdjust = 0;
			var scrollWidth = self.element[0].scrollWidth - table.element.innerWidth();

			self.element.scrollLeft(left);

			//adjust for vertical scrollbar moving table when present
			if(left > scrollWidth){
				hozAdjust = left - scrollWidth
				self.element.css("margin-left", -(hozAdjust));
			}else{
				self.element.css("margin-left", 0);
			}

			//keep frozen columns fixed in position
			//self._calcFrozenColumnsPos(hozAdjust + 3);

			this.scrollLeft = left;

			if(this.table.extExists("frozenColumns")){
				this.table.extensions.frozenColumns.layout();
			}
		},


		///////////// Column Setup Functions /////////////

		setColumns:function(cols, row){
			var self = this;

			self.element.empty();

			self.columns = [];
			self.columnsByIndex = [];
			self.columnsByField = [];

			//reset frozen columns
			if(self.table.extExists("frozenColumns")){
				self.table.extensions.frozenColumns.reset();
			}

			cols.forEach(function(def, i){
				self._addColumn(def);
			});

			self._reIndexColumns();

			if(self.table.options.responsiveLayout && self.table.extExists("responsiveLayout", true)){
				self.table.extensions.responsiveLayout.initialize();
			}

			self.redraw();

			self._verticalAlignHeaders();

			self.table.rowManager.reinitialize();

			if(self.table.options.persistentLayout && self.table.extExists("persistentLayout", true)){
				self.table.extensions.persistentLayout.save();
			}
		},

		_addColumn:function(definition, before, nextToColumn){
			var column = new Column(definition, this);
			var index = nextToColumn ? this.findColumnIndex(nextToColumn) : nextToColumn;

			if(nextToColumn && index > -1){

				let parentIndex = this.columns.indexOf(nextToColumn.getTopColumn());

				if(before){
					this.columns.splice(parentIndex, 0, column);
					nextToColumn.getElement().before(column.getElement());
				}else{
					this.columns.splice(parentIndex + 1, 0, column);
					nextToColumn.getElement().after(column.getElement());
				}

			}else{
				if(before){
					this.columns.unshift(column);
					this.element.prepend(column.getElement());
				}else{
					this.columns.push(column);
					this.element.append(column.getElement());
				}
			}
		},

		registerColumnField:function(col){
			if(col.definition.field){
				this.columnsByField[col.definition.field] = col;
			}
		},

		registerColumnPosition:function(col){
			this.columnsByIndex.push(col);
		},

		_reIndexColumns:function(){
			this.columnsByIndex = [];

			this.columns.forEach(function(column){
				column.reRegisterPosition();
			});
		},

		//ensure column headers take up the correct amount of space in column groups
		_verticalAlignHeaders(){
			var self = this;

			self.columns.forEach(function(column){
				column.clearVerticalAlign();
			});

			self.columns.forEach(function(column){
				column.verticalAlign(self.table.options.colVertAlign);
			});

			self.rowManager.adjustTableSize();
		},

		//////////////// Column Details /////////////////

		findColumn:function(subject){
			var self = this;

			if(typeof subject == "object"){
				if(subject.table === this.table){
					//subject is a column element
					return subject;
				}else if(subject instanceof jQuery){
					//subject is a jquery element of the column header
					let match = self.columns.find(function(column){
						return column.element === subject;
					});

					return match || false;
				}
			}else{
				//subject should be treated as the field name of the column
				return this.columnsByField[subject] || false;
			}

			//catch all for any other type of input

			return false;
		},

		getColumnByField:function(field){
			return this.columnsByField[field];
		},

		getColumnByIndex:function(index){
			return this.columnsByIndex[index];
		},

		getColumns:function(){
			return this.columns;
		},

		findColumnIndex:function(column){
			return this.columnsByIndex.findIndex(function(col){
				return column === col;
			});
		},

		//return all columns that are not groups
		getRealColumns:function(){
			return this.columnsByIndex;
		},

		//travers across columns and call action
		traverse:function(callback){
			var self = this;

			self.columnsByIndex.forEach(function(column,i){
				callback(column, i);
			});
		},

		//get defintions of actual columns
		getDefinitions:function(active){
			var self = this,
			output = [];

			self.columnsByIndex.forEach(function(column){
				if(!active || (active && column.visible)){
					output.push(column.getDefinition());
				}
			});

			return output;
		},

		//get full nested definition tree
		getDefinitionTree:function(){
			var self = this,
			output = [];

			self.columns.forEach(function(column){
				output.push(column.getDefinition(true));
			});

			return output;
		},

		getObjects(){
			var self = this,
			output = [];

			self.columnsByIndex.forEach(function(column){
				output.push(column.getObject());
			});

			return output;
		},

		getWidth:function(){
			var width = 0;

			this.columnsByIndex.forEach(function(column){
				if(column.visible){
					width += column.getWidth();
				}
			});

			return width;
		},

		moveColumn:function(from, to, after){

			this._moveColumnInArray(this.columns, from, to, after);
			this._moveColumnInArray(this.columnsByIndex, from, to, after);

			this.table.options.columnMoved(from.getObject());

			if(this.table.options.persistentLayout && this.table.extExists("persistentLayout", true)){
				this.table.extensions.persistentLayout.save();
			}
		},

		_moveColumnInArray:function(columns, from, to, after){
			var	fromIndex = columns.indexOf(from),
			toIndex;

			if (fromIndex > -1) {

				columns.splice(fromIndex, 1);

				toIndex = columns.indexOf(to);

				if (toIndex > -1) {

					if(after){
						columns.splice(toIndex+1, 0, from);
					}else{
						columns.splice(toIndex, 0, from);
					}

				}else{
					columns.splice(fromIndex, 0, from);
				}
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
				totalWidth -= self.rowManager.element[0].offsetWidth - self.rowManager.element[0].clientWidth;
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

		addColumn:function(definition, before, nextToColumn){
			this._addColumn(definition, before, nextToColumn);

			this._reIndexColumns();

			if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
				this.table.extensions.responsiveLayout.initialize();
			}

			self.redraw();

			this._verticalAlignHeaders();

			this.table.rowManager.reinitialize();
		},

		//remove column from system
		deregisterColumn:function(column){
			var field = column.getField(),
			index;

			//remove from field list
			if(field){
				delete this.columnsByField[field];
			}

			//remove from index list
			index = this.columnsByIndex.indexOf(column);

			if(index > -1){
				this.columnsByIndex.splice(index, 1);
			}

			//remove from column list
			index = this.columns.indexOf(column);

			if(index > -1){
				this.columns.splice(index, 1);
			}

			if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
				this.table.extensions.responsiveLayout.initialize();
			}

			self.redraw();
		},

		//redraw columns
		redraw:function(force){
			if(this.table.options.fitColumns){
				this.fitToTable();
			}else{
				if(force){
					this.fitToData();
				}

				if(this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
					this.table.extensions.responsiveLayout.update();
				}
			}

			if(this.table.extExists("frozenColumns")){
				this.table.extensions.frozenColumns.layout();
			}
		},
	}

	//initialize manager


	return manager;
}