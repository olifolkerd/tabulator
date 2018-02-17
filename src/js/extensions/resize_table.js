var ResizeTable = function(table){
	this.table = table; //hold Tabulator object
};

ResizeTable.prototype.initialize = function(row){
	var table = this.table,
	observer;

	if(typeof ResizeObserver !== "undefined" && this.table.rowManager.getRenderMode() === "virtual"){
		observer = new ResizeObserver(function(entry){
			table.redraw();
		});

		observer.observe(table.element[0]);
	}else{
		$(window).resize(function(){
			$(".tabulator").tabulator("redraw");
		});
	}

};


Tabulator.registerExtension("resizeTable", ResizeTable);