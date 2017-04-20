Column = function(def, parent){

	var col = {
		table:parent.table,
		definition:def, //column definition
		parent:parent, //hold parent object
		columns:[], //child columns
		element:$("<div class='tabulator-col'></div>"), //column header element
		groupElement:false, //column group holder element

		sorter:false, //default sortable state for columns
		visible:true, //default visible state

		/// Setup ////

		//register column position with column manager
		registerColumnPosition:function(col){
			parent.registerColumnPosition(col);
		},

		//build header element
		_buildHeader:function(){
			var self = this;

			self.element.empty();

			if(self.columns.length){
				self._buildGroupHeader();
			}else{
				self._buildColumnHeader();
			}
		},

		//build header element for header
		_buildColumnHeader:function(){
			var self = this,
			def = self.definition,
			table = self.table;

			//set column sorter
			if(table.extExists(sort) && typeof def.sorter != "undefined"){
				if(typeof def.sorter == "string"){
					self.sorter = table.sort.sorters[def.sorter];
				}else{
					self.sorter = def.sorter;
				}
			}

			//set column visibility
			if(typeof def.visible != "undefined"){
				if(def.visible){
					self.show();
				}else{
					self.hide();
				}
			}

			//asign additional css classes to column header
			if(def.cssClass){
				self.element.appendClass(def.cssClass);
			}

			//set min width if needed
			self.element.css("min-width", typeof def.minWidth != "undefined" ? def.minWidth : table.options.colMinWidth);

		},

		//build header element for column group
		_buildGroupHeader:function(){
			var self = this,
			table = self.table;
		},


		//// Retreive Column Information ////

		//return column header element
		getElement:function(){
			return this.groupElement;
		},

		//return colunm group element
		getGroupElement:function(){
			return this.groupElement;
		},

		//// Actions ////

		//show column
		show:function(){
			this.visible = true;

			this.element.show();
		},

		//hide column
		hide:function(){
			this.visible = false;

			this.element.hide();
		},


	};

	//initialize column
	if(def.columns){
		def.columns.forEach(function(def, i){
			var newCol = new Column(def, col);

			col.columns.push(newCol);
		});
	}else{
		parent.registerColumnPosition(col);
	}

	col._buildHeader();

	return col;
}