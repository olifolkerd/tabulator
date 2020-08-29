var VDomHoz = function(table){
	this.table = table;

	this.element = this.table.rowManager.tableElement;
	this.holderEl = this.table.rowManager.element;

	this.leftCol = 0;
	this.rightCol = 0;
	this.scrollLeft = 0;

	this.vDomScrollPosLeft = 0;
	this.vDomScrollPosRight = 0;

	this.vDomPadLeft = 0;
	this.vDomPadRight = 0;

	this.window = 50; //pixel margin to make column visible before it is shown on screen

	this.initialized = false;

	this.columns = [];

	this.initialize();
};

VDomHoz.prototype.initialize = function(){
	this.holderEl.addEventListener("scroll", () => {
		var left = this.holderEl.scrollLeft;

		if(this.scrollLeft != left){
			this.scrollLeft = left;
			this.scroll(left - (this.vDomScrollPosLeft + this.window));
		}
	});
};

VDomHoz.prototype.deinitialize = function(){
	this.initialized = false;
};

VDomHoz.prototype.clear = function(){
	this.columns = [];

	this.element.style.paddingRight = "";
	this.element.style.paddingLeft = "";

	this.leftCol = -1;
	this.rightCol = 0;
	this.scrollLeft = 0;

	this.vDomScrollPosLeft = 0;
	this.vDomScrollPosRight = 0;
	this.vDomPadLeft = 0;
	this.vDomPadRight = 0;
};

VDomHoz.prototype.reinitialize = function(){
	this.clear();

	this.vDomScrollPosLeft = this.holderEl.scrollLeft - this.window;
	this.vDomScrollPosRight = this.vDomScrollPosLeft + this.holderEl.clientWidth + this.window;

	var colPos = 0;

	this.table.columnManager.columnsByIndex.forEach((column) => {
		var config = {};

		if(column.visible){
			var width = column.getWidth();

			config.leftPos = colPos;
			config.rightPos = colPos + width;

			if((colPos + width > this.vDomScrollPosLeft) && (colPos < this.vDomScrollPosRight)){
        		//column is visible

        		if(this.leftCol == -1){
        			this.leftCol = this.columns.length;
        			this.vDomPadLeft = colPos;
        		}

        		this.rightCol = this.columns.length;

        		config.visible = true;

        		// console.log("vhoz", column.field, true);
        	}else{
        		// column is hidden
        		config.visible = false;

        		if(this.leftCol !== -1){
        			this.vDomPadRight += width;
        		}

        		// console.log("vhoz", column.field, false);
        	}

        	this.columns.push(column);

        	column.modules.vdomHoz = config;

        	colPos += width;
        }
    });

	this.element.style.paddingLeft = this.vDomPadLeft + "px";
	this.element.style.paddingRight = this.vDomPadRight + "px";

	this.initialized = true;

	this.renitializeRows();
};

VDomHoz.prototype.renitializeRows = function(){
	var rows = this.table.rowManager.getVisibleRows();
	rows.forEach((row) => {
		this.reinitializeRow(row, true);
	});
};

VDomHoz.prototype.scroll = function(diff){
	var column;

	this.vDomScrollPosLeft += diff;
	this.vDomScrollPosRight += diff;

	if(diff > 0){
		//scroll right
		column = this.columns[this.rightCol + 1];

		if(column && column.modules.vdomHoz.leftPos <= this.vDomScrollPosRight){
			this.addColRight(column);
		}

		column = this.columns[this.leftCol];

		if(column && column.modules.vdomHoz.rightPos < this.vDomScrollPosLeft){
			this.removeColLeft(column);
		}
	}else{
		//scroll left
		column = this.columns[this.leftCol - 1];

		if(column && column.modules.vdomHoz.rightPos >= this.vDomScrollPosLeft){
			this.addColLeft(column);
		}

		column = this.columns[this.rightCol];

		if(column && column.modules.vdomHoz.leftPos > this.vDomScrollPosRight){
			this.removeColRight(column);
		}
	}
};

VDomHoz.prototype.addColRight = function(column){
	var rows = this.table.rowManager.getVisibleRows();

	// console.log("ar")

	column.modules.vdomHoz.visible = true;

	rows.forEach((row) => {
		var cell = row.getCell(column);
		row.getElement().appendChild(cell.getElement());
		cell.cellRendered();
	});

	this.vDomPadRight -= column.getWidth();
	this.element.style.paddingRight = this.vDomPadRight + "px";

	this.rightCol++;
};

VDomHoz.prototype.addColLeft = function(column){
	var rows = this.table.rowManager.getVisibleRows();

	// console.log("al")

	column.modules.vdomHoz.visible = true;

	rows.forEach((row) => {
		var cell = row.getCell(column);
		row.getElement().prepend(cell.getElement());
		cell.cellRendered();
	});

	this.vDomPadLeft -= column.getWidth();
	this.element.style.paddingLeft = this.vDomPadLeft + "px";

	this.leftCol--;
};

VDomHoz.prototype.removeColRight = function(column){
	var rows = this.table.rowManager.getVisibleRows();

	// console.log("rr")

	column.modules.vdomHoz.visible = false;

	rows.forEach((row) => {
		var cell = row.getCell(column);
		row.getElement().removeChild(cell.getElement());
	});

	this.vDomPadRight += column.getWidth();
	this.element.style.paddingRight = this.vDomPadRight + "px";

	this.rightCol --;
};

VDomHoz.prototype.removeColLeft = function(column){
	var rows = this.table.rowManager.getVisibleRows();


	column.modules.vdomHoz.visible = false;

	rows.forEach((row) => {
		var cell = row.getCell(column);
		row.getElement().removeChild(cell.getElement());
	});

	this.vDomPadLeft += column.getWidth();
	// console.log("rl", this.vDomPadLeft)
	this.element.style.paddingLeft = this.vDomPadLeft + "px";

	this.leftCol ++;
};

VDomHoz.prototype.initializeRow = function(row){

	row.modules.vdomHoz = {
		leftCol:this.leftCol,
		rightCol:this.rightCol,
	};

	for(let i = this.leftCol; i <= this.rightCol; i++){
		let column = this.table.columnManager.getColumnByIndex(i);

		if(column.visible){
			let cell = row.getCell(column);

			row.element.appendChild(cell.getElement());
			cell.cellRendered();
		}
	}
};

VDomHoz.prototype.reinitializeRow = function(row, force){
	if(force || !row.modules.vdomHoz || row.modules.vdomHoz.leftCol !== this.leftCol || row.modules.vdomHoz.rightCol !== this.rightCol){
		while(row.element.firstChild) row.element.removeChild(row.element.firstChild);

		this.initializeRow(row);
	}
};