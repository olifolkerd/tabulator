var ResizeTable = function(table){
	this.table = table; //hold Tabulator object
	this.binding = false;
	this.observer = false;
	this.containerObserver = false;

};

ResizeTable.prototype.initialize = function(row){
	var table = this.table,
	observer;

	if(typeof ResizeObserver !== "undefined" && table.rowManager.getRenderMode() === "virtual"){
		this.observer = new ResizeObserver(function(entry){
			if(!table.browserMobile || (table.browserMobile &&!table.modules.edit.currentCell)){
				table.redraw();
			}
		});

		this.observer.observe(table.element);

		if(!this.table.rowManager.fixedHeight){

			this.containerObserver = new ResizeObserver(function(entry){
				if(!table.browserMobile || (table.browserMobile &&!table.modules.edit.currentCell)){
					table.redraw();
				}
			});

			this.containerObserver.observe(this.table.element.parentNode);
		}
	}else{
		this.binding = function(){
			if(!table.browserMobile || (table.browserMobile &&!table.modules.edit.currentCell)){
				table.redraw();
			}
		};

		window.addEventListener("resize", this.binding);
	}
};

ResizeTable.prototype.clearBindings = function(row){
	if(this.binding){
		window.removeEventListener("resize", this.binding);
	}

	if(this.observer){
		this.observer.unobserve(this.table.element);
	}

	if(this.this.containerObserver){
		this.this.containerObserver.unobserve(this.table.element.parentNode);
	}
};

Tabulator.prototype.registerModule("resizeTable", ResizeTable);