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

	this.fitDataColAvg = 0;

	this.window = 200; //pixel margin to make column visible before it is shown on screen

	this.initialized = false;

	this.columns = [];

	if(this.compatabilityCheck()){
		this.initialize();
	}
};

VDomHoz.prototype.compatabilityCheck = function(){
	var options = this.table.options,
	frozen = false,
	ok = true;

	if(options.layout == "fitDataTable"){
		console.warn("Horizontal Vitrual DOM is not compatible with fitDataTable layout mode");
		ok = false;
	}

	if(options.responsiveLayout){
		console.warn("Horizontal Vitrual DOM is not compatible with responsive columns");
		ok = false;
	}

	if(this.table.rtl){
		console.warn("Horizontal Vitrual DOM is not currently compatible with RTL text direction");
		ok = false;
	}

	// if(options.rowFormatter){
	// 	console.warn("Horizontal Vitrual DOM is not compatible with row formatters");
	// 	ok = false;
	// }

	if(options.columns){
		frozen = options.columns.find((col) => {
			return col.frozen;
		});

		if(frozen){
			console.warn("Horizontal Vitrual DOM is not compatible with frozen columns");
			ok = false;
		}
	}

	if(!ok){
		options.virtualDomHoz = false;
	}

	return ok;
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

	this.leftCol = -1;
	this.rightCol = 0;

	this.vDomScrollPosLeft = 0;
	this.vDomScrollPosRight = 0;
	this.vDomPadLeft = 0;
	this.vDomPadRight = 0;
};

VDomHoz.prototype.dataChange = function(){
	var change = false,
	collsWidth = 0,
	colEnd = 0,
	group, row, rowEl;

	if(this.table.options.layout === "fitData"){
		this.table.columnManager.columnsByIndex.forEach((column) => {
			if(!column.definition.width && column.visible){
				change = true;
			}
		});

		if(change){
			if(change && this.table.rowManager.getDisplayRows().length){
				// this.table.vdomHoz.deinitialize();

				this.vDomScrollPosRight = this.scrollLeft + this.holderEl.clientWidth + this.window;


				if(this.table.options.groupBy){
					group = this.table.modules.groupRows.getGroups(false)[0];

					row = group.getRows(false)[0];
				}else{
					row = this.table.rowManager.getDisplayRows()[0];
				}

				if(row){

					rowEl = row.getElement();

					row.generateCells();

					this.element.appendChild(rowEl);

					for(var colEnd = 0; colEnd < row.cells.length; colEnd++){
						let cell = row.cells[colEnd];
						rowEl.appendChild(cell.getElement());

						cell.column.reinitializeWidth();

						collsWidth += cell.column.getWidth();

						if(collsWidth > this.vDomScrollPosRight){
							break;
						}
					}

					rowEl.parentNode.removeChild(rowEl);

					this.fitDataColAvg = Math.floor(collsWidth / (colEnd + 1));

					for(colEnd; colEnd < this.table.columnManager.columnsByIndex.length; colEnd++){
						this.table.columnManager.columnsByIndex[colEnd].setWidth(this.fitDataColAvg);
					}

					this.reinitialize(false, true);
				}
			}
		}
	}else{
		if(this.table.options.layout === "fitColumns"){
			this.table.modules.layout.layout();
			this.table.vdomHoz.reinitialize(false, true);
		}
	}
};

VDomHoz.prototype.fitDataLayoutOverride = function(){
	for(let i = this.leftCol; i <= this.rightCol; i++){
		this.columns[i].reinitializeWidth();
	}
};

VDomHoz.prototype.reinitialize = function(update, blockRedraw){
	var old = {
		cols:this.columns,
		leftCol:this.leftCol,
		rightCol:this.rightCol,
	};

	if(update && !this.initialized){
		return;
	}

	this.clear();

	this.scrollLeft = this.holderEl.scrollLeft;

	this.vDomScrollPosLeft = this.scrollLeft - this.window;
	this.vDomScrollPosRight = this.scrollLeft + this.holderEl.clientWidth + this.window;

	var colPos = 0;

	this.table.columnManager.columnsByIndex.forEach((column) => {
		var config = {};

		if(column.visible){
			var width = column.getWidth();

			config.leftPos = colPos;
			config.rightPos = colPos + width;
			config.width = width;

			if(this.table.options.layout === "fitData"){
				config.fitDataCheck = true;
			}

			if((colPos + width > this.vDomScrollPosLeft) && (colPos < this.vDomScrollPosRight)){
        		//column is visible

        		if(this.leftCol == -1){
        			this.leftCol = this.columns.length;
        			this.vDomPadLeft = colPos;
        		}

        		this.rightCol = this.columns.length;
        	}else{
        		// column is hidden
        		if(this.leftCol !== -1){
        			this.vDomPadRight += width;
        		}
        	}

        	this.columns.push(column);

        	column.modules.vdomHoz = config;

        	colPos += width;
        }
    });

	this.element.style.paddingLeft = this.vDomPadLeft + "px";
	this.element.style.paddingRight = this.vDomPadRight + "px";

	this.initialized = true;

	if(!blockRedraw){
		if(!update || this.reinitChanged(old)){
			this.renitializeRows();
		}
	}

	this.holderEl.scrollLeft = this.scrollLeft;
};

VDomHoz.prototype.reinitChanged = function(old){
	var match = true;

	if(old.cols.length !== this.columns.length || old.leftCol !== this.leftCol || old.rightCol !== this.rightCol){
		return true;
	}

	old.cols.forEach((col, i) => {
		if(col !== this.columns[i]){
			match = false;
		}
	});

	return !match;
};

VDomHoz.prototype.renitializeRows = function(){
	var rows = this.table.rowManager.getVisibleRows();
	rows.forEach((row) => {
		this.reinitializeRow(row, true);
	});
};

VDomHoz.prototype.scroll = function(diff){
	this.vDomScrollPosLeft += diff;
	this.vDomScrollPosRight += diff;

	if(diff > (this.holderEl.clientWidth * .8)){
		this.reinitialize();
	}else{
		if(diff > 0){
			//scroll right
			this.addColRight();
			this.removeColLeft();
		}else{
			//scroll left
			this.addColLeft();
			this.removeColRight();
		}
	}
};

VDomHoz.prototype.colPositionAdjust = function (start, end, diff){
	for(let i = start; i < end; i++){
		let column = this.columns[i];

		column.modules.vdomHoz.leftPos += diff;
		column.modules.vdomHoz.rightPos += diff;
	}
};

VDomHoz.prototype.addColRight = function(){
	var column = this.columns[this.rightCol + 1],
	rows, newWidth, widthDiff;

	if(column && column.modules.vdomHoz.leftPos <= this.vDomScrollPosRight){

		rows = this.table.rowManager.getVisibleRows();

		rows.forEach((row) => {
			if(row.type !== "group"){
				var cell = row.getCell(column);
				row.getElement().appendChild(cell.getElement());
				cell.cellRendered();
			}
		});

		this.fitDataColActualWidthCheck(column);

		this.rightCol++;

		if(this.rightCol >= (this.columns.length - 1)){
			this.vDomPadRight = 0;
		}else{
			this.vDomPadRight -= column.getWidth();
		}

		this.element.style.paddingRight = this.vDomPadRight + "px";

		this.addColRight();
	}
};

VDomHoz.prototype.addColLeft = function(){
	var column = this.columns[this.leftCol - 1],
	rows;

	if(column && column.modules.vdomHoz.rightPos >= this.vDomScrollPosLeft){
		var rows = this.table.rowManager.getVisibleRows();

		rows.forEach((row) => {
			if(row.type !== "group"){
				var cell = row.getCell(column);
				row.getElement().prepend(cell.getElement());
				cell.cellRendered();
			}
		});

		this.fitDataColActualWidthCheck(column);

		if(!this.leftCol){
			this.vDomPadLeft = 0;
		}else{
			this.vDomPadLeft -= column.getWidth();
		}

		this.element.style.paddingLeft = this.vDomPadLeft + "px";

		this.leftCol--;

		this.addColLeft();
	}
};

VDomHoz.prototype.removeColRight = function(column){
	var column = this.columns[this.rightCol],
	rows;

	if(column && column.modules.vdomHoz.leftPos > this.vDomScrollPosRight){
		rows = this.table.rowManager.getVisibleRows();

		column.modules.vdomHoz.visible = false;

		rows.forEach((row) => {
			if(row.type !== "group"){
				var cell = row.getCell(column);
				row.getElement().removeChild(cell.getElement());
			}
		});

		this.vDomPadRight += column.getWidth();
		this.element.style.paddingRight = this.vDomPadRight + "px";

		this.rightCol --;

		this.removeColRight();
	}
};

VDomHoz.prototype.removeColLeft = function(){
	var column = this.columns[this.leftCol],
	rows;

	if(column && column.modules.vdomHoz.rightPos < this.vDomScrollPosLeft){

		rows = this.table.rowManager.getVisibleRows();

		rows.forEach((row) => {
			if(row.type !== "group"){
				var cell = row.getCell(column);
				row.getElement().removeChild(cell.getElement());
			}
		});

		this.vDomPadLeft += column.getWidth();
		this.element.style.paddingLeft = this.vDomPadLeft + "px";

		this.leftCol ++;

		this.removeColLeft();
	}
};

VDomHoz.prototype.fitDataColActualWidthCheck = function(column){
	var newWidth, widthDiff;

	if(column.modules.vdomHoz.fitDataCheck){
		column.reinitializeWidth();

		newWidth = column.getWidth();
		widthDiff = newWidth - column.modules.vdomHoz.width;

		if(widthDiff){
			column.modules.vdomHoz.rightPos += widthDiff;
			column.modules.vdomHoz.width = newWidth;
			this.colPositionAdjust(this.rightCol + 2, this.columns.length, widthDiff);
		}

		column.modules.vdomHoz.fitDataCheck = false;
	}
};


VDomHoz.prototype.initializeRow = function(row){
	if(row.type !== "group"){
		row.modules.vdomHoz = {
			leftCol:this.leftCol,
			rightCol:this.rightCol,
		};

		for(let i = this.leftCol; i <= this.rightCol; i++){
			let column = this.columns[i];

			if(column && column.visible){
				let cell = row.getCell(column);

				row.getElement().appendChild(cell.getElement());
				cell.cellRendered();
			}
		}
	}
};

VDomHoz.prototype.reinitializeRow = function(row, force){
	if(row.type !== "group"){
		if(force || !row.modules.vdomHoz || row.modules.vdomHoz.leftCol !== this.leftCol || row.modules.vdomHoz.rightCol !== this.rightCol){
			var rowEl = row.getElement();
			while(rowEl.firstChild) rowEl.removeChild(rowEl.firstChild);

			this.initializeRow(row);
		}
	}
};