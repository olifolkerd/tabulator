var MoveColumns = function(table){
	this.table = table; //hold Tabulator object
	this.placeholderElement = $("<div class='tabulator-col tabulator-col-placeholder'></div>");
	this.hoverElement = $(); //floating column header element
	this.checkTimeout = false; //click check timeout holder
	this.checkPeriod = 250; //period to wait on mousedown to consider this a move and not a click
	this.moving = false; //currently moving column
	this.toCol = false; //destination column
	this.toColAfter = false; //position of moving column relative to the desitnation column
	this.startX = 0; //starting position within header element
	this.autoScrollMargin = 40; //auto scroll on edge when within margin
	this.autoScrollStep = 5; //auto scroll distance in pixels
	this.autoScrollTimeout = false; //auto scroll timeout

	this.moveHover = this.moveHover.bind(this);
	this.endMove = this.endMove.bind(this);
};

MoveColumns.prototype.initializeColumn = function(column){
	var self = this,
	config = {},
	colEl;

	if(!column.modules.frozen){

		colEl = column.getElement();

		config.mousemove = function(e){
			if(column.parent === self.moving.parent){
				if(((e.pageX - Tabulator.prototype.helpers.elOffset(colEl).left) + self.table.columnManager.element.scrollLeft) > (column.getWidth() / 2)){
					if(self.toCol !== column || !self.toColAfter){
						colEl.parentNode.insertBefore(self.placeholderElement, colEl.nextSibling);
						self.moveColumn(column, true);
					}
				}else{
					if(self.toCol !== column || self.toColAfter){
						colEl.parentNode.insertBefore(self.placeholderElement, colEl);
						self.moveColumn(column, false);
					}
				}
			}
		}.bind(self);

		colEl.addEventListener("mousedown", function(e){
			self.checkTimeout = setTimeout(function(){
				self.startMove(e, column);
			}, self.checkPeriod)
		});

		colEl.addEventListener("mouseup", function(e){
			if(self.checkTimeout){
				clearTimeout(self.checkTimeout);
			}
		});
	}

	column.modules.moveColumn = config;
};

MoveColumns.prototype.startMove = function(e, column){
	var self = this,
	element = column.getElement();


	self.moving = column;
	self.startX = e.pageX - Tabulator.prototype.helpers.elOffset(element.left);

	self.table.element.classList.add("tabulator-block-select");

	//create placeholder
	self.placeholderElement.css({
		width:column.getWidth(),
		height:column.getHeight(),
	});
	element.parentNode.insertBefore(self.placeholderElement, element);
	element.parentNode.removeChild(element);

	//create hover element
	self.hoverElement = element.cloneNode(true);
	self.hoverElement.classList.add("tabulator-moving");

	self.table.columnManager.getElement().appendChild(self.hoverElement[0]);
	self.hoverElement.css({
		"left":0,
		"bottom":0,
	});

	self._bindMouseMove();

	$("body").on("mousemove", self.moveHover)
	$("body").on("mouseup", self.endMove)

	self.moveHover(e);
};

MoveColumns.prototype._bindMouseMove = function(){
	var self = this;

	self.table.columnManager.columnsByIndex.forEach(function(column){
		if(column.modules.moveColumn.mousemove){
			column.getElement().addEventListener("mousemove", column.modules.moveColumn.mousemove);
		}
	});
};

MoveColumns.prototype._unbindMouseMove = function(){
	var self = this;

	self.table.columnManager.columnsByIndex.forEach(function(column){
		if(column.modules.moveColumn.mousemove){
			column.getElement().removeEventListener("mousemove", column.modules.moveColumn.mousemove);
		}
	});
};

MoveColumns.prototype.moveColumn = function(column, after){
	var self = this,
	movingCells = this.moving.getCells();

	self.toCol = column;
	self.toColAfter = after;

	if(after){
		column.getCells().forEach(function(cell, i){
			var cellEl = cell.getElement();
			cellEl.parentNode.insertBefore(movingCells[i].getElement(), cellEl.nextSibling);
		});
	}else{
		column.getCells().forEach(function(cell, i){
			var cellEl = cell.getElement();
			cellEl.parentNode.insertBefore(movingCells[i].getElement(), cellEl);
		});
	}
};

MoveColumns.prototype.endMove = function(column){
	var self = this;

	self._unbindMouseMove();

	self.placeholderElement.after(self.moving.getElement());
	self.placeholderElement.detach();
	self.hoverElement.detach();

	self.table.element.classList.remove("tabulator-block-select");

	if(self.toCol){
		self.table.columnManager.moveColumn(self.moving, self.toCol, self.toColAfter);
	}

	self.moving = false;
	self.toCol = false;
	self.toColAfter = false;

	$("body").off("mousemove", self.moveHover);
	$("body").off("mouseup", self.endMove);
};

MoveColumns.prototype.moveHover = function(e){
	var self = this,
	columnHolder = self.table.columnManager.getElement(),
	scrollLeft = columnHolder.scrollLeft,
	xPos = (e.pageX - Tabulator.prototype.helpers.elOffset(columnHolder).left) + scrollLeft,
	scrollPos;

	self.hoverElement.css({
		"left":xPos - self.startX,
	});


	if(xPos - scrollLeft < self.autoScrollMargin){
		if(!self.autoScrollTimeout){
			self.autoScrollTimeout = setTimeout(function(){
				scrollPos = Math.max(0,scrollLeft-5);
				self.table.rowManager.getElement().scrollLeft = scrollPos;
				self.autoScrollTimeout = false;
			}, 1);
		}
	}

	if(scrollLeft + columnHolder.clientWidth - xPos < self.autoScrollMargin){
		if(!self.autoScrollTimeout){
			self.autoScrollTimeout = setTimeout(function(){
				scrollPos = Math.min(columnHolder.clientWidth, scrollLeft+5);
				self.table.rowManager.getElement().scrollLeft = scrollPos;
				self.autoScrollTimeout = false;
			}, 1);
		}
	}
};

Tabulator.prototype.registerModule("moveColumn", MoveColumns);