var ResponsiveLayout = function(table){
	this.table = table; //hold Tabulator object
	this.columns = [];
	this.hiddenColumns = [];
	this.mode = ""
	this.index = 0;
	this.collapseFormatter = [];
	this.collapseStartOpen = true;
};

//generate resposive columns list
ResponsiveLayout.prototype.initialize = function(){
	var columns=[];

	this.mode = this.table.options.responsiveLayout;
	this.collapseFormatter = this.table.options.responsiveLayoutCollapseFormatter || this.formatCollapsedData;
	this.collapseStartOpen = this.table.options.responsiveLayoutCollapseStartOpen;
	this.hiddenColumns = [];

	//detemine level of responsivity for each column
	this.table.columnManager.columnsByIndex.forEach(function(column, i){
		if(column.extensions.responsive){
			if(column.extensions.responsive.order && column.extensions.responsive.visible){
				column.extensions.responsive.index = i;
				columns.push(column);

				if(!column.visible && this.mode === "collapse"){
					this.hiddenColumns.push(column);
				}
			}
		}
	});

	//sort list by responsivity
	columns = columns.reverse();
	columns = columns.sort(function(a, b){
		var diff = b.extensions.responsive.order - a.extensions.responsive.order
		return diff || (b.extensions.responsive.index - a.extensions.responsive.index);
	});

	this.columns = columns;

	if(this.mode === "collapse"){
		this.generateCollapsedContent();
	}
};

//define layout information
ResponsiveLayout.prototype.initializeColumn = function(column){
	var def = column.getDefinition();

	column.extensions.responsive = {order: typeof def.responsive === "undefined" ? 1 : def.responsive, visible:def.visible === false ? false : true};
}

ResponsiveLayout.prototype.layoutRow = function(row){
	var rowEl = row.getElement(),
	el = $("<div class='tabulator-responsive-collapse'></div>");

	if(!rowEl.hasClass("tabulator-calcs")){
		row.extensions.responsiveLayout = {
			element:el,
		}

		if(!this.collapseStartOpen){
			el.hide();
		}

		row.getElement().append(el);

		this.generateCollapsedRowContent(row);
	}
}

//update column visibility
ResponsiveLayout.prototype.updateColumnVisibility = function(column, visible){
	var index;
	if(column.extensions.responsive){
		column.extensions.responsive.visible = visible;
		this.initialize();
	}
}

ResponsiveLayout.prototype.hideColumn = function(column){
	column.hide(false, true);

	if(this.mode === "collapse"){
		this.hiddenColumns.unshift(column);

		this.generateCollapsedContent()
	}
}

ResponsiveLayout.prototype.showColumn = function(column){
	var index;

	column.show(false, true);
	//set column width to prevent calculation loops on uninitialized columns
	column.setWidth(column.getWidth());

	if(this.mode === "collapse"){
		index = this.hiddenColumns.indexOf(column);

		if(index > -1){
			this.hiddenColumns.splice(index, 1)
		}

		this.generateCollapsedContent();
	}
}

//redraw columns to fit space
ResponsiveLayout.prototype.update = function(){
	var self = this,
	working = true;

	while(working){

		let width = self.table.extensions.layout.getMode() == "fitColumns" ? self.table.columnManager.getFlexBaseWidth() : self.table.columnManager.getWidth();

		let diff = self.table.columnManager.element.innerWidth() - width;

		if(diff < 0){
			//table is too wide
			let column = self.columns[self.index];

			if(column){
				self.hideColumn(column);
				self.index ++;
			}else{
				working = false;
			}

		}else{

			//table has spare space
			let column = self.columns[self.index -1];

			if(column){
				if(diff > 0){
					if(diff >= column.getWidth()){
						self.showColumn(column);
						self.index --;
					}else{
						working = false;
					}
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}

		if(!self.table.rowManager.activeRowsCount){
			self.table.rowManager.renderEmptyScroll();
		}
	}
};

ResponsiveLayout.prototype.generateCollapsedContent = function(){
	var self = this,
	rows = this.table.rowManager.getDisplayRows();

	rows.forEach(function(row){
		self.generateCollapsedRowContent(row);
	});
}

ResponsiveLayout.prototype.generateCollapsedRowContent = function(row){
	var el;

	if(row.extensions.responsiveLayout){
		el = row.extensions.responsiveLayout.element;

		el.empty();

		el.append(this.collapseFormatter(this.generateCollapsedRowData(row)))
	}
}

ResponsiveLayout.prototype.generateCollapsedRowData = function(row){
	var self = this,
	data = row.getData(),
	output = {},
	mockCellComponent;

	this.hiddenColumns.forEach(function(column){
		var value = column.getFieldValue(data);

		if(column.definition.title && column.field){
			if(column.extensions.format && self.table.options.responsiveLayoutCollapseUseFormatters){

				mockCellComponent = {
				    value:false,
				    data:{},
				    getValue:function(){
				        return value;
				    },
				    getData:function(){
				        return data;
				    },
				    getElement:function(){
				        return $();
				    },
				    getRow:function(){
				        return row.getComponent();
				    },
				    getColumn:function(){
				        return column.getComponent();
				    },
				}

				output[column.definition.title] = column.extensions.format.formatter.call(self.table.extensions.format, mockCellComponent, column.extensions.format.params);
			}else{
				output[column.definition.title] = value;
			}
		}
	});

	return output;
}

ResponsiveLayout.prototype.formatCollapsedData = function(data){
	var list = $("<table></table>");

	for(var key in data){
		list.append("<tr><td><strong>" + key + "</strong></td><td>" + data[key] + "</td></tr>");
	}

	return Object.keys(data).length ? list : "";
}

Tabulator.registerExtension("responsiveLayout", ResponsiveLayout);