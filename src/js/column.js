var Column = function(def, parent){

	var col = {
		table:parent.table,
		definition:def, //column definition
		parent:parent, //hold parent object
		columns:[], //child columns
		cells:[], //cells bound to this column
		element:$("<div class='tabulator-col' role='columnheader' aria-sort='none'></div>"), //column header element
		contentElement:false,
		groupElement:$("<div class='tabulator-col-group-cols'></div>"), //column group holder element
		isGroup:false,

		extensions:{}, //hold extension variables;

		cellEvents:{
			onClick:false,
			onDblClick:false,
			onContext:false,
		},

		width:null, //column width,
		minWidth:null, //column minimum width,

		visible:true, //default visible state

		//////////////// Setup Functions /////////////////

		//register column position with column manager
		registerColumnPosition:function(col){
			parent.registerColumnPosition(col);
		},

		//build header element
		_buildHeader:function(){
			var self = this,
			def = self.definition;

			self.element.empty();

			self.contentElement = self._buildColumnHeaderContent();

			self.element.append(self.contentElement);

			if(self.isGroup){
				self._buildGroupHeader();
			}else{
				self._buildColumnHeader();
			}

			//set header tooltips
			var tooltip = self.definition.tooltipHeader || self.definition.tooltip === false  ? self.definition.tooltipHeader : self.table.options.tooltipsHeader;

			if(tooltip){
				if(tooltip === true){
					tooltip = self.definition.title;
				}else if(typeof(tooltip) == "function"){
					tooltip = tooltip(column);
				}

				self.element.attr("title", tooltip);
			}else{
				self.element.attr("title", "");
			}

			//set resizable handles
			if(self.table.options.colResizable && self.table.extExists("resizeColumns")){
				self.table.extensions.resizeColumns.initializeColumn(self, self.element);
			}

			//setup header click event bindings
			if(typeof(def.headerOnClick) == "function"){
				self.element.on("click", function(e){def.headerOnClick(e, self.element, self.definition.field, self.definition)})
			}

			if(typeof(def.headerOnDblClick) == "function"){
				self.element.on("dblclick", function(e){def.headerOnDblClick(e, self.element, self.definition.field, self.definition)});
			}

			if(typeof(def.headerOnContext) == "function"){
				self.element.on("contextmenu", function(e){def.headerOnContext(e, self.element, self.definition.field, self.definition)});
			}

			//store column cell click event bindings
			if(typeof(def.onClick) == "function"){
				self.cellEvents.onClick = def.onClick;
			}

			if(typeof(def.onDblClick) == "function"){
				self.cellEvents.onDblClick = def.onDblClick;
			}

			if(typeof(def.onContext) == "function"){
				self.cellEvents.onContext = def.onContext;
			}
		},

		//build header element for header
		_buildColumnHeader:function(){
			var self = this,
			def = self.definition,
			table = self.table,
			sortable;

			//set column sorter
			if(typeof def.sorter != "undefined" && table.extExists("sort")){
				table.extensions.sort.initializeColumn(self, self.contentElement);
			}

			//set column formatter
			if(table.extExists("format")){
				table.extensions.format.initializeColumn(self);
			}

			//set column editor
			if(typeof def.editor != "undefined" && table.extExists("edit")){
				table.extensions.edit.initializeColumn(self);
			}

			//set column mutator
			if(typeof def.mutator != "undefined" && table.extExists("mutator")){
				table.extensions.mutator.initializeColumn(self);
			}

			//set column accessor
			if(typeof def.accessor != "undefined" && table.extExists("accessor")){
				table.extensions.accessor.initializeColumn(self);
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

			//set min width if present
			self.setMinWidth(typeof def.minWidth == "undefined" ? self.table.options.colMinWidth : def.minWidth);

			//set width if present
			self.setWidth(def.width);

		},

		_buildColumnHeaderContent:function(){
			var self = this,
			def = self.definition,
			table = self.table;

			var contentElement = $("<div class='tabulator-col-content'></div>");

			contentElement.append(self._buildColumnHeaderTitle());

			return contentElement;
		},

		//build title element of column
		_buildColumnHeaderTitle:function(){
			var self = this,
			def = self.definition,
			table = self.table,
			title;

			var titleHolderElement = $("<div class='tabulator-col-title'></div>");

			// if(table.extExists("localize")){
			// 	title = table.extensions.localize.lang.columns[def.field] || (def.title ? def.title : "&nbsp");
			// }else{
				title = def.title ? def.title : "&nbsp";
			//}


			if(def.editableTitle){
				var titleElement = $("<input class='tabulator-title-editor'>");
				titleElement.val(title);

				titleElement.on("click", function(e){
					e.stopPropagation();
					$(this).focus();
				});

				titleElement.on("change", function(){
					var newTitle = $(this).val();
					def.title = newTitle;
					// table.options.colTitleChanged(newTitle, column, options.columns);
				});

				title = titleElement;
			}

			if(typeof title == "string"){
				titleHolderElement.html(title);
			}else{
				titleHolderElement.append(title);
			}

			return titleHolderElement;
		},

		//build header element for column group
		_buildGroupHeader:function(){
			var self = this,
			def = self.definition,
			table = self.table;

			self.element.addClass("tabulator-col-group")
			.attr("role", "columngroup")
			.attr("aria-title", def.title);

			self.element.append(self.groupElement);
		},

		//attach column to this group
		attachColumn(column){
			var self = this;

			if(self.groupElement){
				self.columns.push(column);
				self.groupElement.append(column.getElement());
			}else{
				console.warn("Column Warning - Column being attached to another column instead of column group");
			}
		},

		//vertically align header in column
		verticalAlign:function(alignment){

			if(this.parent.isGroup){
				this.element.css("height", this.parent.getGroupElement().innerHeight())
			}else{
				this.element.css("height", this.parent.getElement().innerHeight())
			}

			//vertically align cell contents
			if(!this.isGroup && alignment !== "top"){
				if(alignment === "bottom"){
					this.element.css({"padding-top": this.element.innerHeight() - this.contentElement.outerHeight()});
				}else{
					this.element.css({"padding-top": (this.element.innerHeight() -this.contentElement.outerHeight()) / 2 });
				}
			}

			this.columns.forEach(function(column){
				column.verticalAlign(alignment);
			});
		},

		//clear vertical alignmenet
		clearVerticalAlign:function(){
			this.element.css("padding-top","");
			this.element.css("ehight","");
		},

		//// Retreive Column Information ////

		//return column header element
		getElement:function(){
			return this.element;
		},

		//return colunm group element
		getGroupElement:function(){
			return this.groupElement;
		},

		//return field name
		getField:function(){
			return this.definition.field;
		},

		//return the first column in a group
		getFirstColumn:function(){
			if(!this.isGroup){
				return this;
			}else{
				if(this.columns.length){
					return this.columns[0].getFirstColumn();
				}else{
					return false;
				}
			}
		},

		//return the last column in a group
		getLastColumn:function(){
			if(!this.isGroup){
				return this;
			}else{
				if(this.columns.length){
					return this.columns[this.columns.length -1].getLastColumn();
				}else{
					return false;
				}
			}
		},

		//////////////////// Actions ////////////////////

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

		setWidth:function(width){
			width = Math.max(this.minWidth, width);

			this.width = width;

			if(!this.isGroup){
				this.element.css("width", width || "");

				this.cells.forEach(function(cell){
					cell.setWidth(width);
				});
			}
		},

		getWidth:function(){
			return this.element.outerWidth();
		},

		setMinWidth:function(minWidth){
			this.minWidth = minWidth;

			this.element.css("min-width", minWidth || "");

			this.cells.forEach(function(cell){
				cell.setMinWidth(minWidth);
			});
		},

		//////////////// Cell Management /////////////////

		//generate cell for this column
		generateCell:function(row){
			var self = this;

			var cell = new Cell(self, row);

			this.cells.push(cell);

			return cell;
		},

		//set column width to maximum cell width
		fitToData:function(){
			var self = this;

			var maxWidth = 0;

			if(!self.width){
				self.cells.forEach(function(cell){
					var width = cell.getWidth();

					if(width > maxWidth){
						maxWidth = width;
					}
				});

				if(maxWidth){
					self.setWidth(maxWidth);
				}

			}
		},

		//////////////// Event Bindings /////////////////
	};

	//initialize column
	if(def.columns){

		col.isGroup = true;

		def.columns.forEach(function(def, i){
			var newCol = new Column(def, col);
			col.attachColumn(newCol);
		});
	}else{
		parent.registerColumnPosition(col);
	}

	col._buildHeader();

	return col;
}