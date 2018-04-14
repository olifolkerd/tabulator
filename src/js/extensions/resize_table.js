var ResizeTable = function(table){
	this.table = table; //hold Tabulator object
	this.binding = false;
	this.observer = false;
};

ResizeTable.prototype.initialize = function(row){
	var table = this.table,
	observer;

	if(typeof ResizeObserver !== "undefined" && table.rowManager.getRenderMode() === "virtual"){
		this.observer = new ResizeObserver(function(entry){
			table.redraw();
		});

		this.observer.observe(table.element[0]);
	}else{
		this.binding = function(){
			table.element.tabulator("redraw");
		}

		$(window).resize(this.binding);
	}
};

ResizeTable.prototype.clearBindings = function(row){
	if(this.binding){
		$(window).off("resize", this.binding);
	}

	if(this.observer){
		this.observer.unobserve(this.table.element[0]);
	}
}

Tabulator.registerExtension("resizeTable", ResizeTable);