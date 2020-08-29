var VDomHoz = function(table){
	this.table = table;

	this.element = this.table.rowManager.tableElement;
	this.holderEl = this.table.rowManager.element;

	this.leftCol = 0;
	this.rightCol = 0;
	this.scrollLeft = 0;

	this.vDomScrollPosLeft = 0;
	this.vDomScrollPosRight = 0;

	this.window = 50; //pixel margin to make column visible before it is shown on screen

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

VDomHoz.prototype.clear = function(){
	this.element.style.paddingRight = "";
	this.element.style.paddingLeft = "";

	this.leftCol = -1;
	this.rightCol = 0;
	this.scrollLeft = 0;

	this.vDomScrollPosLeft = 0;
	this.vDomScrollPosRight = 0;
};

VDomHoz.prototype.reinitialize = function(){
	this.clear();

	this.vDomScrollPosLeft = this.holderEl.scrollLeft - this.window;
	this.vDomScrollPosRight = this.vDomScrollPosLeft + this.holderEl.clientWidth + this.window;

	var colPos = 0;

    this.table.columnManager.columnsByIndex.forEach((column, index) => {
    	var config = {};

        if(column.visible){
        	var width = column.getWidth();

        	config.leftPos = colPos;
        	config.rightPos = colPos + width;

        	if((colPos + width > this.vDomScrollPosLeft) && (colPos < this.vDomScrollPosRight)){
        		//column is visible

        		if(this.leftCol == -1){
        			this.leftCol = index;
        		}

        		this.rightCol = index;

        		config.visible = true;

        		// console.log("vhoz", column.field, true);
        	}else{
        		// column is hidden
        		config.visible = false;

        		// console.log("vhoz", column.field, false);
        	}

        	column.modules.vdomHoz = config;

			colPos += width;

        }

    });

};

VDomHoz.prototype.scroll = function(diff){
	var column;

	this.vDomScrollPosLeft += diff;
	this.vDomScrollPosRight += diff;

	if(diff > 0){
		//scroll right

		column = this.nextColumn();

		if(column && column.modules.vdomHoz.leftPos <= this.vDomScrollPosRight){
			//show column
			column.modules.vdomHoz.visible = true;
			this.rightCol ++;
		}


		column = this.table.columnManager.getColumnByIndex(this.leftCol);

		if(column && column.modules.vdomHoz.rightPos < this.vDomScrollPosLeft){
			//hide column
			column.modules.vdomHoz.visible = false;
			this.leftCol ++;
		}


	}else{
		//scroll left

		column = this.prevColumn();

		if(column && column.modules.vdomHoz.rightPos >= this.vDomScrollPosLeft){
			//show column
			column.modules.vdomHoz.visible = true;
			this.leftCol --;
		}

		column = this.table.columnManager.getColumnByIndex(this.rightCol);

		if(column && column.modules.vdomHoz.leftPos > this.vDomScrollPosRight){
			//hide column
			column.modules.vdomHoz.visible = false;
			this.rightCol --;
		}
	}
};

VDomHoz.prototype.nextColumn = function(index){
	index = index || 1;

	var column = this.table.columnManager.getColumnByIndex(this.rightCol + index);

	if(column && !column.visible){
		return this.nextCol(index + 1);
	}

	return column;
};

VDomHoz.prototype.prevColumn = function(index){
	index = index || 1;

	var column = this.table.columnManager.getColumnByIndex(this.leftCol - index);

	if(column && !column.visible){
		return this.nextCol(index + 1);
	}

	return column;
};