var ColumnDropdown = function(table){
 	this.table = table; //hold Tabulator object
 	//something to do with other extensions
 };
 
//How do you get Images
//text source?
 
//initialize column dropdown list with extensions
ColumnDropdown.prototype.initializeColumn = function(column, content){
	var self = this;

	if(column.definition.ColumnDropdown !== false)
	{
		column.element.css({ "overflow": "visible"});
		
		content.append($("<select name='testlist' class='tabulator-column-dropdown-menu' style='width:22px; height:20px; position:absolute; overflow:visible; display: inline-block; top:4px; right:4px;'></select>"));
		
		//content.append($("<select name='testlist' class='tabulator-column-dropdown-menu'></select>"));		
				
		var MenuExpanded = false;
		
		$(".tabulator-column-dropdown-options").click(
              function( event ) {
				event.stopPropagation();
                
				if(MenuExpanded === true)
				{
					$(this).find('.tabulator-column-dropdown-menu').slideUp();
					MenuExpanded = false;
				}
				else
				{
					$(this).children().slideDown();
					MenuExpanded = true;
				}
             }
        );
		
		$(".tabulator-column-dropdown-menu").val(-1); // If an option is already selected it won't trigger an onclick event
		$(".tabulator-column-dropdown-menu").click(
			function (event){
				var test = this;
				this.selectedIndex = -1; // the option clicked should not be selected 
				event.stopPropagation();			
			}
		);
		
		$(".column-dropdown-option").mouseenter( // replace this with on focus in CSS
              function () {
                  $(this).css({ "background":"Green"});
              }
        );
	}
};


ColumnDropdown.prototype.addMenuItem = function(column, option, itemClass, itemText, itemIcon){ //need an additional parameter that tells us what option this extension relates to 
	var self = this,
	currentDataGrouped = false;
			
			
	var newMenuItem = "<option class='column-dropdown-option "+ itemClass +" ' style='position:relative; width:100%; height:25px; margin-left:-100px' ><div class='column-option-name' >" +itemText+ "</div><div class='column-dropdown-option-icon'></div></option>";	
	
	column.element.find(".tabulator-column-dropdown-menu").append(newMenuItem);
	
	if(option == "sort")
	{
		column.element.find("." + itemClass).on("click", function(e){ 
		
			var dir = column.extensions.sort.dir;
			
			dir = dir == "asc" ? "desc" : "asc";
			
			self.table.extensions.sort.setSort( column.definition.field , dir );
			self.table.rowManager.sorterRefresh();
		
		});
	}
	else if(option == "group")
	{
		column.element.find("." + itemClass).on("click", function(e){ 	
		
		
			if(!currentDataGrouped)
			{	
				self.table.extensions.groupRows.initialize(column.field);
				self.table.rowManager.setDisplayRows(self.table.extensions.groupRows.getRows(self.table.rowManager.activeRows, true));
				self.table.rowManager.renderTable();
				currentDataGrouped = true;
			}
			else
			{
				self.table.rowManager.setDisplayRows(self.table.extensions.groupRows.getRows(self.table.rowManager.activeRows, true)); 
				self.table.rowManager.refreshActiveData();
				currentDataGrouped = false;
			}
						
		});		
	}
	else if(option == "freezeColumn")
	{
		column.element.find("." + itemClass).on("click", function(e){ 
		
			//find the column set it's frozen property and re-render the table much better than below
		
			if(!column.definition.frozen)
			{
				var positionAfter = false;
				var lastFrozenColumn = self.table.columnManager.columns[0];
				
				//go through all columns if none are frozen then position at the start if one is frozen then postion after
				self.table.columnManager.columns.forEach(function (col, index){ 
					if(typeof col.definition.frozen !== "undefined" && col.definition.frozen)
					{
						lastFrozenColumn = col; 
						positionAfter = true;						
					}					
				});
				
				column.definition.frozen = true;
				
				self.table.columnManager.moveColumn(column, lastFrozenColumn, positionAfter);
				
				self.table.rowManager.redraw(true); 
				self.table.columnManager.redraw(true); 
				self.table.extensions.frozenColumns.reset(); 
				
				self.table.columnManager.columns.forEach(function (col){ // re-intialise each column as others may also be frozen
					if(typeof col.definition.frozen !== "undefined" && col.definition.frozen)
					{
						self.table.extensions.frozenColumns.initializeColumn(col); 
					}					
				});
				
			}
			else
			{
				column.definition.frozen = false;
				
				delete column.extensions.frozen; // if not deleted will cause frozen styles to be applied after removal
				
				column.element.removeClass("tabulator-frozen");
				column.element.removeClass("tabulator-frozen-left");
				column.element.removeClass("tabulator-frozen-right");
				column.element.css({"position":"relative"});
				column.element.css({"display":"inline-block"});
				column.element.css({"left":""});
			
				column.cells.forEach(function(cell){
					cell.element.removeClass("tabulator-frozen");
					cell.element.css({"position":"relative"});
					cell.element.removeClass("tabulator-frozen-left");
					cell.element.removeClass("tabulator-frozen-right");
				});
				
				self.table.extensions.frozenColumns.leftColumns.splice(self.table.extensions.frozenColumns.leftColumns.indexOf(column), 1);  
				
			}
		
			self.table.rowManager.redraw(true);
			self.table.columnManager.redraw(true);
						
		});				
	}
	else if(option = "hideColumn")
	{
		column.element.find("." + itemClass).on("click", function(e){ 
		
			if(column.visible){
				column.hide();
			}
			else
			{
				column.show();
			}			
			
		});
	}
	
}

Tabulator.registerExtension("column_drop_down", ColumnDropdown);