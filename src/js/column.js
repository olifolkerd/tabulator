
//public column object
var ColumnComponent = function (column){
	this.column = column;
	this.type = "ColumnComponent";
};

ColumnComponent.prototype.getElement = function(){
	return this.column.getElement();
};

ColumnComponent.prototype.getDefinition = function(){
	return this.column.getDefinition();
};

ColumnComponent.prototype.getField = function(){
	return this.column.getField();
};

ColumnComponent.prototype.getCells = function(){
	var cells = [];

	this.column.cells.forEach(function(cell){
		cells.push(cell.getComponent());
	});

	return cells;
};

ColumnComponent.prototype.getVisibility = function(){
	return this.column.visible;
};

ColumnComponent.prototype.show = function(){
	if(this.column.isGroup){
		this.column.columns.forEach(function(column){
			column.show();
		});
	}else{
		this.column.show();
	}
};

ColumnComponent.prototype.hide = function(){
	if(this.column.isGroup){
		this.column.columns.forEach(function(column){
			column.hide();
		});
	}else{
		this.column.hide();
	}
};

ColumnComponent.prototype.toggle = function(){
	if(this.column.visible){
		this.hide();
	}else{
		this.show();
	}
};

ColumnComponent.prototype.delete = function(){
	this.column.delete();
};

ColumnComponent.prototype.getSubColumns = function(){
	var output = [];

	if(this.column.columns.length){
		this.column.columns.forEach(function(column){
			output.push(column.getComponent());
		});
	}

	return output;
};

ColumnComponent.prototype.getParentColumn = function(){
	return this.column.parent instanceof Column ? this.column.parent.getComponent() : false;
};


ColumnComponent.prototype._getSelf = function(){
	return this.column;
};

ColumnComponent.prototype.scrollTo = function(){
	this.column.table.columManager.scrollToColumn(this.column);
};


var Column = function(def, parent){
	var self = this;

	this.table = parent.table;
	this.definition = def; //column definition
	this.parent = parent; //hold parent object
	this.type = "column"; //type of element
	this.columns = []; //child columns
	this.cells = []; //cells bound to this column
	this.element = $("<div class='tabulator-col' role='columnheader' aria-sort='none'></div>"); //column header element
	this.contentElement = false;
	this.groupElement = $("<div class='tabulator-col-group-cols'></div>"); //column group holder element
	this.isGroup = false;
	this.tooltip = false; //hold column tooltip
	this.hozAlign = ""; //horizontal text alignment

	//multi dimentional filed handling
	this.field ="";
	this.fieldStructure = "";
	this.getFieldValue = "";
	this.setFieldValue = "";

	this.setField(this.definition.field);


	this.extensions = {}; //hold extension variables;

	this.cellEvents = {
		cellClick:false,
		cellDblClick:false,
		cellContext:false,
		cellTap:false,
		cellDblTap:false,
		cellTapHold:false
	};

	this.width = null; //column width
	this.minWidth = null; //column minimum width
	this.widthFixed = false; //user has specified a width for this column

	this.visible = true; //default visible state

	//initialize column
	if(def.columns){

		this.isGroup = true;

		def.columns.forEach(function(def, i){
			var newCol = new Column(def, self);
			self.attachColumn(newCol);
		});

		self.checkColumnVisibility();
	}else{
		parent.registerColumnField(this);
	}

	if(def.rowHandle && this.table.options.movableRows !== false && this.table.extExists("moveRow")){
		this.table.extensions.moveRow.setHandle(true);
	}

	this._mapDepricatedFunctionality()

	this._buildHeader();
};


//////////////// Setup Functions /////////////////
Column.prototype._mapDepricatedFunctionality = function(field){
	if(this.definition.tooltipHeader){
		console.warn("The%c tooltipHeader%c column definition property has been depricated and will be removed in version 4.0, use %c headerTooltip%c instead.", "font-weight:bold;", "font-weight:regular;", "font-weight:bold;", "font-weight:regular;");

		if(typeof this.definition.headerTooltip == "undefined"){
			this.definition.headerTooltip = this.definition.tooltipHeader;
		}
	}
};

Column.prototype.setField = function(field){
	this.field = field;
	this.fieldStructure = field ? field.split(".") : [];
	this.getFieldValue = this.fieldStructure.length > 1 ? this._getNestedData : this._getFlatData;
	this.setFieldValue = this.fieldStructure.length > 1 ? this._setNesteData : this._setFlatData;
};

//register column position with column manager
Column.prototype.registerColumnPosition = function(column){
	this.parent.registerColumnPosition(column);
};

//register column position with column manager
Column.prototype.registerColumnField = function(column){
	this.parent.registerColumnField(column);
};

//trigger position registration
Column.prototype.reRegisterPosition = function(){
	if(this.isGroup){
		this.columns.forEach(function(column){
			column.reRegisterPosition();
		});
	}else{
		this.registerColumnPosition(this);
	}
};

Column.prototype.setTooltip = function(){
	var self = this,
	def = self.definition;

	//set header tooltips
	var tooltip = def.headerTooltip || def.tooltip === false  ? def.headerTooltip : self.table.options.tooltipsHeader;

	if(tooltip){
		if(tooltip === true){
			if(def.field){
				self.table.extensions.localize.bind("columns|" + def.field, function(value){
					self.element.attr("title", value || def.title);
				});
			}else{
				self.element.attr("title", def.title);
			}

		}else{
			if(typeof(tooltip) == "function"){
				tooltip = tooltip(self.getComponent());

				if(tooltip === false){
					tooltip = "";
				}
			}

			self.element.attr("title", tooltip);
		}

	}else{
		self.element.attr("title", "");
	}
}

//build header element
Column.prototype._buildHeader = function(){
	var self = this,
	def = self.definition,
	dblTap,	tapHold, tap;

	self.element.empty();

	self.contentElement = self._buildColumnHeaderContent();

	self.element.append(self.contentElement);

	if(self.isGroup){
		self._buildGroupHeader();
	}else{
		self._buildColumnHeader();
	}

	self.setTooltip();

	//set resizable handles
	if(self.table.options.resizableColumns && self.table.extExists("resizeColumns")){
		self.table.extensions.resizeColumns.initializeColumn("header", self, self.element);
	}

	//set resizable handles
	if(def.headerFilter && self.table.extExists("filter") && self.table.extExists("edit")){
		if(typeof def.headerFilterPlaceholder !== "undefined" && def.field){
			self.table.extensions.localize.setHeaderFilterColumnPlaceholder(def.field, def.headerFilterPlaceholder);
		}

		self.table.extensions.filter.initializeColumn(self);
	}


	//set resizable handles
	if(self.table.extExists("frozenColumns")){
		self.table.extensions.frozenColumns.initializeColumn(self);
	}

	//set movable column
	if(self.table.options.movableColumns && !self.isGroup && self.table.extExists("moveColumn")){
		self.table.extensions.moveColumn.initializeColumn(self);
	}

	//set calcs column
	if((def.topCalc || def.bottomCalc) && self.table.extExists("columnCalcs")){
		self.table.extensions.columnCalcs.initializeColumn(self);
	}


	//update header tooltip on mouse enter
	self.element.on("mouseenter", function(e){
		self.setTooltip();
	});

	//setup header click event bindings
	if(typeof(def.headerClick) == "function"){
		self.element.on("click", function(e){def.headerClick(e, self.getComponent())})
	}

	if(typeof(def.headerDblClick) == "function"){
		self.element.on("dblclick", function(e){def.headerDblClick(e, self.getComponent())});
	}

	if(typeof(def.headerContext) == "function"){
		self.element.on("contextmenu", function(e){def.headerContext(e, self.getComponent())});
	}

	//setup header tap event bindings
	if(typeof(def.headerTap) == "function"){
		tap = false;

		self.element.on("touchstart", function(e){
			tap = true;
		});

		self.element.on("touchend", function(e){
			if(tap){
				def.headerTap(e, self.getComponent());
			}

			tap = false;
		});
	}

	if(typeof(def.headerDblTap) == "function"){
		dblTap = null;

		self.element.on("touchend", function(e){

			if(dblTap){
				clearTimeout(dblTap);
				dblTap = null;

				def.headerDblTap(e, self.getComponent());
			}else{

				dblTap = setTimeout(function(){
					clearTimeout(dblTap);
					dblTap = null;
				}, 300);
			}

		});
	}

	if(typeof(def.headerTapHold) == "function"){
		tapHold = null;

		self.element.on("touchstart", function(e){
			clearTimeout(tapHold);

			tapHold = setTimeout(function(){
				clearTimeout(tapHold);
				tapHold = null;
				tap = false;
				def.headerTapHold(e, self.getComponent());
			}, 1000)

		});

		self.element.on("touchend", function(e){
			clearTimeout(tapHold);
			tapHold = null;
		});
	}

	//store column cell click event bindings
	if(typeof(def.cellClick) == "function"){
		self.cellEvents.cellClick = def.cellClick;
	}

	if(typeof(def.cellDblClick) == "function"){
		self.cellEvents.cellDblClick = def.cellDblClick;
	}

	if(typeof(def.cellContext) == "function"){
		self.cellEvents.cellContext = def.cellContext;
	}

	//setup column cell tap event bindings
	if(typeof(def.cellTap) == "function"){
		self.cellEvents.cellTap = def.cellTap;
	}

	if(typeof(def.cellDblTap) == "function"){
		self.cellEvents.cellDblTap = def.cellDblTap;
	}

	if(typeof(def.cellTapHold) == "function"){
		self.cellEvents.cellTapHold = def.cellTapHold;
	}

	//setup column cell edit callbacks
	if(typeof(def.cellEdited) == "function"){
		self.cellEvents.cellEdited = def.cellEdited;
	}

	if(typeof(def.cellEditing) == "function"){
		self.cellEvents.cellEditing = def.cellEditing;
	}

	if(typeof(def.cellEditCancelled) == "function"){
		self.cellEvents.cellEditCancelled = def.cellEditCancelled;
	}
};

//build header element for header
Column.prototype._buildColumnHeader = function(){
	var self = this,
	def = self.definition,
	table = self.table,
	sortable;

	//set column sorter
	if(table.extExists("sort")){
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

	//set colum validator
	if(typeof def.validator != "undefined" && table.extExists("validate")){
		table.extensions.validate.initializeColumn(self);
	}


	//set column mutator
	if(table.extExists("mutator")){
		table.extensions.mutator.initializeColumn(self);
	}

	//set column accessor
	if(table.extExists("accessor")){
		table.extensions.accessor.initializeColumn(self);
	}

	//set respoviveLayout
	if(typeof table.options.responsiveLayout && table.extExists("responsiveLayout")){
		table.extensions.responsiveLayout.initializeColumn(self);
	}

	//set column visibility
	if(typeof def.visible != "undefined"){
		if(def.visible){
			self.show(true);
		}else{
			self.hide(true);
		}
	}

	//asign additional css classes to column header
	if(def.cssClass){
		self.element.addClass(def.cssClass);
	}

	if(def.field){
		this.element.attr("tabulator-field", def.field)
	}

	//set min width if present
	self.setMinWidth(typeof def.minWidth == "undefined" ? self.table.options.columnMinWidth : def.minWidth);

	self.reinitializeWidth();

	//set tooltip if present
	self.tooltip = self.definition.tooltip || self.definition.tooltip === false ? self.definition.tooltip : self.table.options.tooltips;

	//set orizontal text alignment
	self.hozAlign = typeof(self.definition.align) == "undefined" ? "" : self.definition.align;
};

Column.prototype._buildColumnHeaderContent = function(){
	var self = this,
	def = self.definition,
	table = self.table;

	var contentElement = $("<div class='tabulator-col-content'></div>");

	contentElement.append(self._buildColumnHeaderTitle());

	return contentElement;
};

//build title element of column
Column.prototype._buildColumnHeaderTitle = function(){
	var self = this,
	def = self.definition,
	table = self.table,
	title;

	var titleHolderElement = $("<div class='tabulator-col-title'></div>");

	if(def.editableTitle){
		var titleElement = $("<input class='tabulator-title-editor'>");

		titleElement.on("click", function(e){
			e.stopPropagation();
			$(this).focus();
		});

		titleElement.on("change", function(){
			var newTitle = $(this).val();
			def.title = newTitle;
			table.options.columnTitleChanged(self.getComponent());
		});

		titleHolderElement.append(titleElement);

		if(def.field){
			table.extensions.localize.bind("columns|" + def.field, function(text){
				titleElement.val(text || (def.title || "&nbsp"));
			});
		}else{
			titleElement.val(def.title || "&nbsp");
		}

	}else{
		if(def.field){
			table.extensions.localize.bind("columns|" + def.field, function(text){
				self._formatColumnHeaderTitle(titleHolderElement, text || (def.title || "&nbsp"));
			});
		}else{
			self._formatColumnHeaderTitle(titleHolderElement, def.title || "&nbsp");
		}
	}

	return titleHolderElement;
};

Column.prototype._formatColumnHeaderTitle = function(el, title){
	var formatter, contents;

	if(this.definition.titleFormatter && this.table.extExists("format")){

		formatter = this.table.extensions.format.getFormatter(this.definition.titleFormatter);

		contents = formatter.call(this.table.extensions.format, {
			getValue:function(){
				return title;
			},
			getElement:function(){
				return el;
			}
		}, this.definition.titleFormatterParams || {});

		el.append(contents);
	}else{
		el.html(title);
	}
};


//build header element for column group
Column.prototype._buildGroupHeader = function(){
	var self = this,
	def = self.definition,
	table = self.table;

	self.element.addClass("tabulator-col-group")
	.attr("role", "columngroup")
	.attr("aria-title", def.title);

	self.element.append(self.groupElement);
};

//flat field lookup
Column.prototype._getFlatData = function(data){
	return data[this.field];
};

//nested field lookup
Column.prototype._getNestedData = function(data){
	var dataObj = data,
	structure = this.fieldStructure,
	length = structure.length,
	output;

	for(let i = 0; i < length; i++){

		dataObj = dataObj[structure[i]];

		output = dataObj;

		if(!dataObj){
			break;
		}
	}

	return output;
};

//flat field set
Column.prototype._setFlatData = function(data, value){
	data[this.field] = value;
};

//nested field set
Column.prototype._setNesteData = function(data, value){
	var dataObj = data,
	structure = this.fieldStructure,
	length = structure.length;

	for(let i = 0; i < length; i++){

		if(i == length -1){
			dataObj[structure[i]] = value;
		}else{
			if(!dataObj[structure[i]]){
				dataObj[structure[i]] = {};
			}

			dataObj = dataObj[structure[i]];
		}
	}
};


//attach column to this group
Column.prototype.attachColumn = function(column){
	var self = this;

	if(self.groupElement){
		self.columns.push(column);
		self.groupElement.append(column.getElement());
	}else{
		console.warn("Column Warning - Column being attached to another column instead of column group");
	}
};

//vertically align header in column
Column.prototype.verticalAlign = function(alignment){

	//calculate height of column header and group holder element
	var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().innerHeight() : this.parent.getHeadersElement().innerHeight();

	this.element.css("height", parentHeight);

	if(this.isGroup){
		this.groupElement.css("min-height", parentHeight - this.contentElement.outerHeight());
	}

	//vertically align cell contents
	if(!this.isGroup && alignment !== "top"){
		if(alignment === "bottom"){
			this.element.css({"padding-top": this.element.innerHeight() - this.contentElement.outerHeight()});
		}else{
			this.element.css({"padding-top": (this.element.innerHeight() - this.contentElement.outerHeight()) / 2 });
		}
	}

	this.columns.forEach(function(column){
		column.verticalAlign(alignment);
	});
};

//clear vertical alignmenet
Column.prototype.clearVerticalAlign = function(){
	this.element.css("padding-top","");
	this.element.css("height","");
	this.element.css("min-height","");

	this.columns.forEach(function(column){
		column.clearVerticalAlign();
	});
};

//// Retreive Column Information ////

//return column header element
Column.prototype.getElement = function(){
	return this.element;
};

//return colunm group element
Column.prototype.getGroupElement = function(){
	return this.groupElement;
};

//return field name
Column.prototype.getField = function(){
	return this.field;
};

//return the first column in a group
Column.prototype.getFirstColumn = function(){
	if(!this.isGroup){
		return this;
	}else{
		if(this.columns.length){
			return this.columns[0].getFirstColumn();
		}else{
			return false;
		}
	}
};

//return the last column in a group
Column.prototype.getLastColumn = function(){
	if(!this.isGroup){
		return this;
	}else{
		if(this.columns.length){
			return this.columns[this.columns.length -1].getLastColumn();
		}else{
			return false;
		}
	}
};

//return all columns in a group
Column.prototype.getColumns = function(){
	return this.columns;
};

//return all columns in a group
Column.prototype.getCells = function(){
	return this.cells;
};

//retreive the top column in a group of columns
Column.prototype.getTopColumn = function(){
	if(this.parent.isGroup){
		return this.parent.getTopColumn();
	}else{
		return this;
	}
};

//return column definition object
Column.prototype.getDefinition = function(updateBranches){
	var colDefs = [];

	if(this.isGroup && updateBranches){
		this.columns.forEach(function(column){
			colDefs.push(column.getDefinition(true));
		});

		this.definition.columns = colDefs;
	}

	return this.definition;
};

//////////////////// Actions ////////////////////

Column.prototype.checkColumnVisibility = function(){
	var visible = false;

	this.columns.forEach(function(column){
		if(column.visible){
			visible = true;
		}
	});

	if(visible){
		this.show()
		this.parent.table.options.columnVisibilityChanged(this.getComponent(), false);
	}else{
		this.hide();
	}

};

//show column
Column.prototype.show = function(silent, responsiveToggle){
	if(!this.visible){
		this.visible = true;

		this.element.css({
			"display":"",
		});
		this.table.columnManager._verticalAlignHeaders();

		if(this.parent.isGroup){
			this.parent.checkColumnVisibility();
		}

		this.cells.forEach(function(cell){
			cell.show();
		});

		if(this.table.options.persistentLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.persistence.save("columns");
		}

		if(!responsiveToggle && this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.responsiveLayout.updateColumnVisibility(this, this.visible);
		}

		if(!silent){
			this.table.options.columnVisibilityChanged(this.getComponent(), true);
		}
	}
};

//hide column
Column.prototype.hide = function(silent, responsiveToggle){
	if(this.visible){
		this.visible = false;

		this.element.css({
			"display":"none",
		});
		this.table.columnManager._verticalAlignHeaders();

		if(this.parent.isGroup){
			this.parent.checkColumnVisibility();
		}

		this.cells.forEach(function(cell){
			cell.hide();
		});

		if(this.table.options.persistentLayout && this.table.extExists("persistence", true)){
			this.table.extensions.persistence.save("columns");
		}

		if(!responsiveToggle && this.table.options.responsiveLayout && this.table.extExists("responsiveLayout", true)){
			this.table.extensions.responsiveLayout.updateColumnVisibility(this, this.visible);
		}

		if(!silent){
			this.table.options.columnVisibilityChanged(this.getComponent(), false);
		}
	}
};

Column.prototype.matchChildWidths = function(){
	var childWidth = 0;

	if(this.contentElement && this.columns.length){
		this.columns.forEach(function(column){
			childWidth += column.getWidth();
		});

		this.contentElement.css("max-width", childWidth - 1);
	}
}

Column.prototype.setWidth = function(width){
	this.widthFixed = true;
	this.setWidthActual(width);
};

Column.prototype.setWidthActual = function(width){

	if(isNaN(width)){
		width = Math.floor((this.table.element.innerWidth()/100) * parseInt(width));
	}

	console.log

	width = Math.max(this.minWidth, width);

	this.width = width;

	this.element.css("width", width || "");

	if(!this.isGroup){
		this.cells.forEach(function(cell){
			cell.setWidth(width);
		});
	}

	if(this.parent.isGroup){
		this.parent.matchChildWidths();
	}

	//set resizable handles
	if(this.table.extExists("frozenColumns")){
		this.table.extensions.frozenColumns.layout();
	}
};


Column.prototype.checkCellHeights = function(){
	var rows = [];

	this.cells.forEach(function(cell){
		if(cell.row.heightInitialized){
			if(cell.row.element[0].offsetParent !== null){
				rows.push(cell.row);
				cell.row.clearCellHeight();
			}else{
				cell.row.heightInitialized = false;
			}
		}
	});

	rows.forEach(function(row){
		row.calcHeight();
	})

	rows.forEach(function(row){
		row.setCellHeight();
	})
};

Column.prototype.getWidth = function(){
	return this.element.outerWidth();
};

Column.prototype.getHeight = function(){
	return this.element.outerHeight();
};

Column.prototype.setMinWidth = function(minWidth){
	this.minWidth = minWidth;

	this.element.css("min-width", minWidth || "");

	this.cells.forEach(function(cell){
		cell.setMinWidth(minWidth);
	});
};

Column.prototype.delete = function(){
	if(this.isGroup){
		this.columns.forEach(function(column){
			column.delete();
		});
	}

	var cellCount = this.cells.length;

	for(let i = 0; i < cellCount; i++){
		this.cells[0].delete();
	}

	this.element.detach();

	this.table.columnManager.deregisterColumn(this);
};

//////////////// Cell Management /////////////////

//generate cell for this column
Column.prototype.generateCell = function(row){
	var self = this;

	var cell = new Cell(self, row);

	this.cells.push(cell);

	return cell;
};

Column.prototype.reinitializeWidth = function(force){

	this.widthFixed = false;

	//set width if present
	if(typeof this.definition.width !== "undefined" && !force){
		this.setWidth(this.definition.width);
	}

	//hide header filters to prevent them altering column width
	if(this.table.extExists("filter")){
		this.table.extensions.filter.hideHeaderFilterElements();
	}

	this.fitToData();

	//show header filters again after layout is complete
	if(this.table.extExists("filter")){
		this.table.extensions.filter.showHeaderFilterElements();
	}
}

//set column width to maximum cell width
Column.prototype.fitToData = function(){
	var self = this;

	if(!this.widthFixed){
		this.element.css("width", "")

		self.cells.forEach(function(cell){
			cell.setWidth("");
		});
	}

	var maxWidth = this.element.outerWidth();

	if(!self.width || !this.widthFixed){
		self.cells.forEach(function(cell){
			var width = cell.getWidth();

			if(width > maxWidth){
				maxWidth = width;
			}
		});

		if(maxWidth){
			self.setWidthActual(maxWidth + 1);
		}

	}
};

Column.prototype.deleteCell = function(cell){
	var index = this.cells.indexOf(cell);

	if(index > -1){
		this.cells.splice(index, 1);
	}
};

//////////////// Event Bindings /////////////////

//////////////// Object Generation /////////////////
Column.prototype.getComponent = function(){
	return new ColumnComponent(this);
};