var RowManager = function(table){

	var manager = {
		table:table,
		element:$("<div class='tabulator-tableHolder'></div>"), //containing element
		tableElement:$("<div class='tabulator-table'></div>"), //table element
		columnManager:null, //hold column manager object
		height:0, //hold height of table element

		firstRender:false, //handle first render

		rows:[], //hold row data objects
		activeRows:[], //rows currently on display in the table
		activeRowsCount:0, //count of active rows

		scrollTop:0,
		scrollLeft:0,

		vDomRowHeight:20, //approximation of row heights for padding

		vDomTop:0, //hold position for first rendered row in the virtual DOM
		vDomBottom:0, //hold possition for last rendered row in the virtual DOM

		vDomScrollPosTop:0, //last scroll position of the vDom top;
		vDomScrollPosBottom:0, //last scroll position of the vDom bottom;

		vDomTopPad:0, //hold value of padding for top of virtual DOM
		vDomBottomPad:0, //hold value of padding for bottom of virtual DOM

		vDomWindowBuffer:0, //window row buffer before removing elements, to smooth scrolling

		//////////////// Setup Functions /////////////////

		//return containing element
		getElement:function(){
			return this.element;
		},

		//link to column manager
		setColumnManager:function(manager){
			this.columnManager = manager;
		},

		_initialize(){
			var self = this;

			//initialize manager
			self.element.append(self.tableElement);

			if(!self.table.options.fitColumns){
				self.firstRender = true;
			}

			//scroll header along with table body
			self.element.scroll(function(){
				var left = self.element.scrollLeft();


				//handle horizontal scrolling
				if(self.scrollLeft != left){
					self.columnManager.scrollHorizontal(left);
				}


				self.scrollLeft = left;
			});

			//handle virtual dom scrolling
			if(self.table.options.height && self.table.options.virtualDom){

				self.element.scroll(function(){
					var top = self.element.scrollTop();

					//handle verical scrolling
					if(self.scrollTop != top){
						self.scrollTop = top;
						self.scrollVertical();
					}else{
						self.scrollTop = top;
					}

				});
			}

		},


		////////////////// Data Handling //////////////////

		setData:function(data){
			var self = this;

			self.rows = [];

			data.forEach(function(def, i){
				var row = new Row(def, self);
				self.rows.push(row);
			});

			self.refreshActiveData(true);
		},

		clearData:function(){
			this.setData([]);
		},

		getData:function(active){
			var self = this,
			output = [];

			var rows = active ? self.rows : self.activeRows;

			rows.forEach(function(row){
				output.push(row.getData(true));
			});

			return output;
		},

		//set active data set
		refreshActiveData:function(dataChanged){
			var self = this,
			filterChanged = false;

			if(self.table.extExists("filter")){
				filterChanged = table.extensions.filter.hasChanged()

				if(filterChanged || dataChanged){
					table.extensions.filter.filter();
				}

			}else{
				self.setActiveRows(self.rows);
			}

			if(self.table.extExists("sort")){
				if(table.extensions.filter.hasChanged() || filterChanged || dataChanged){
					table.extensions.sort.sort();
				}
			}

			self.renderTable();
		},

		setActiveRows:function(activeRows){
			this.activeRows = activeRows;
			this.activeRowsCount = this.activeRows.length;
		},

		///////////////// Table Rendering /////////////////

		renderTable:function(){
			var self = this;

			if(self.height && self.table.options.virtualDom){
				self._virtualRenderFill();
			}else{
				self._simpleRender();
			}

			if(self.firstRender && self.activeRows.length){
				self.firstRender = false;
				self.columnManager.fitToData();
			}
		},

		//simple render on heightless table
		_simpleRender:function(){
			var element = this.tableElement;

			this._clearVirtualDom();

			this.activeRows.forEach(function(row){
				element.append(row.getElement());
				row.initialize();
			});
		},

		_clearVirtualDom:function(){
			var element = this.tableElement;

			element.empty();

			element.css({
				"padding-top":"",
				"padding-bottom":"",
			});

			this.scrollTop = 0;
			this.scrollLeft = 0;
			this.vDomTop = 0;
			this.vDomBottom = 0;
			this.vDomTopPad = 0;
			this.vDomBottomPad = 0;
		},

		//full virtual render
		_virtualRenderFill:function(position){
			var self = this,
			element = self.tableElement,
			holder = self.element,
			topPad = 0,
			rowsHeight = 0,
			topPadHeight = 0,
			i = 0;

			position = position || 0;

			if(!position){
				self._clearVirtualDom();
			}else{

				element.empty();

				//check if position is too close to bottom of table
				let heightOccpied = (self.activeRowsCount - position) * self.vDomRowHeight

				if(heightOccpied < self.height){
					position -= Math.Ceil((self.height - heightOccpied) / self.activeRowsCount);

					if(position < 0){
						position = 0;
					}
				}

				//calculate initial pad
				topPad = Math.min(Math.floor(self.vDomWindowBuffer / self.vDomRowHeight), position);
				position -= topPad;
			}


			if(self.activeRowsCount){

				this.vDomTop = position;

				self.vDomBottom = position -1;

				while (rowsHeight <= self.height + self.vDomWindowBuffer && self.vDomBottom < self.activeRowsCount -1){

					// console.log("row");
					var row = self.activeRows[self.vDomBottom + 1]

					element.append(row.getElement());
					row.initialize();

					if(i < topPad){
						topPadHeight += row.getHeight();
					}else{
						rowsHeight += row.getHeight();
					}

					self.vDomBottom ++;
					i++;
				}

				if(!position){
					self.vDomRowHeight = self.activeRows[0].getHeight();
				}

				self.vDomTopPad = self.vDomRowHeight * this.vDomTop;

				self.vDomBottomPad = self.vDomRowHeight * (self.activeRowsCount - self.vDomBottom -1);

				element.css({
					"padding-top":self.vDomTopPad,
					"padding-bottom":self.vDomBottomPad,
				});

				this.vDomScrollPosTop = this.scrollTop;
				this.vDomScrollPosBottom = this.scrollTop;
			}
		},

		//handle vertical scrolling
		scrollVertical:function(){
			var topDiff = this.scrollTop - this.vDomScrollPosTop;
			var bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

			if(Math.abs(topDiff) > this.vDomWindowBuffer * 2 || Math.abs(bottomDiff) > this.vDomWindowBuffer){
				//if big scroll redraw table;
				this._virtualRenderFill(Math.floor((this.element.scrollTop() / this.element[0].scrollHeight) * this.activeRowsCount));
			}else{

				//handle top rows
				if(topDiff >= 0){
					//scrolling down
					this._removeTopRow(topDiff);
				}else{
					//scrolling up
					this._addTopRow(topDiff * -1)
				}

				//handle bottom rows
				if(bottomDiff >= 0){
					//scrolling down
					this._addBottomRow(bottomDiff);
				}else{
					//scrolling up
					this._removeBottomRow(bottomDiff * -1);
				}
			}

		},

		_addTopRow:function(topDiff){
			var table = this.tableElement;

			if(this.vDomTop){

				let topRow = this.activeRows[this.vDomTop -1];
				let topRowHeight = topRow.getHeight() || this.vDomRowHeight;

				//hide top row if needed
				if(topDiff >= topRowHeight){

					table.prepend(topRow.getElement());
					topRow.initialize();

					this.vDomTopPad -= topRowHeight;

					if(this.vDomTopPad < 0){
						this.vDomTopPad == (this.vDomTop -1) * this.vDomRowHeight;
					}

					table.css("padding-top", this.vDomTopPad);
					this.vDomScrollPosTop -= topRowHeight;
					this.vDomTop--;
				}

				topDiff = -(this.scrollTop - this.vDomScrollPosTop);

				if(this.vDomTop && topDiff >= (this.activeRows[this.vDomTop -1].getHeight() || this.vDomRowHeight)){
					this._addTopRow(topDiff);
				}

			}

		},

		_removeTopRow:function(topDiff){
			var table = this.tableElement,
			topRow = this.activeRows[this.vDomTop],
			topRowHeight = topRow.getHeight();

			//hide top row if needed
			if(this.scrollTop > this.vDomWindowBuffer){

				topRow.element.detach();

				this.vDomTopPad += topRowHeight;
				table.css("padding-top", this.vDomTopPad);
				this.vDomScrollPosTop += this.vDomTop ? topRowHeight : topRowHeight + this.vDomWindowBuffer;
				this.vDomTop++;

				topDiff = this.scrollTop - this.vDomScrollPosTop;

				if(topDiff >= (this.activeRows[this.vDomTop].getHeight() || this.vDomRowHeight)){
					this._removeTopRow(topDiff);
				}
			}

		},

		_addBottomRow:function(bottomDiff){
			var table = this.tableElement;

			if(this.vDomBottom < this.activeRowsCount -1){

				let bottomRow = this.activeRows[this.vDomBottom + 1];
				let bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

				//hide bottom row if needed
				if(bottomDiff >= bottomRowHeight){

					table.append(bottomRow.getElement());
					bottomRow.initialize();

					this.vDomBottomPad -= bottomRowHeight;

					if(this.vDomBottomPad < 0){
						this.vDomBottomPad == 0;
					}

					table.css("padding-bottom", this.vDomBottomPad);
					this.vDomScrollPosBottom += bottomRowHeight;
					this.vDomBottom++;
				}

				bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

				if(this.vDomBottom < this.activeRowsCount -1 && bottomDiff >= (this.activeRows[this.vDomBottom + 1].getHeight() || this.vDomRowHeight)){
					this._addBottomRow(bottomDiff);
				}
			}
		},

		_removeBottomRow:function(bottomDiff){
			var table = this.tableElement,
			bottomRow = this.activeRows[this.vDomBottom],
			bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

			//hide bottom row if needed
			if(this.scrollTop < this.element.innerHeight() -this.element[0].scrollHeight - this.vDomWindowBuffer){

				bottomRow.element.detach();

				this.vDomBottomPad += bottomRowHeight;

				if(this.vDomBottomPad < 0){
					this.vDomBottomPad == 0;
				}

				table.css("padding-bottom", this.vDomBottomPad);
				this.vDomScrollPosBottom -= bottomRowHeight;
				this.vDomBottom--;

				bottomDiff = -(this.scrollTop - this.vDomScrollPosBottom);

				if(bottomDiff >= (this.activeRows[this.vDomBottom].getHeight() || this.vDomRowHeight)){
					this._removeBottomRow(bottomDiff);
				}
			}

		},

		//normalize height of active rows
		normalizeHeight:function(){
			var self = this;

			self.activeRows.forEach(function(row){
				row.normalizeHeight();
			});
		},

		//adjust the height of the table holder to fit in the Tabulator element
		adjustTableSize:function(){
			var self = this;

			if(self.table.options.height){

				self.element.css({
					"min-height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
					"height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
					"max-height":"calc(100% - " + self.columnManager.element.outerHeight() + "px)",
				});

				self.height = self.element.innerHeight();
				self.vDomWindowBuffer = self.height;
			}
		},

	}

	manager._initialize();

	return manager;
}