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
	config = {};

	if(!column.extensions.frozen){

		config.mousemove = function(e){
			if(column.parent === self.moving.parent){
				if(((e.pageX - column.element.offset().left) + self.table.columnManager.element.scrollLeft()) > (column.getWidth() / 2)){
					if(self.toCol !== column || !self.toColAfter){
						column.element.after(self.placeholderElement);
						self.moveColumn(column, true);
					}
				}else{
					if(self.toCol !== column || self.toColAfter){
						column.element.before(self.placeholderElement);
						self.moveColumn(column, false);
					}
				}
			}
		}.bind(self)

		column.getElement().on("mousedown", function(e){
			self.checkTimeout = setTimeout(function(){
				self.startMove(e, column);
			}, self.checkPeriod)
		});

		column.getElement().on("mouseup", function(e){
			if(self.checkTimeout){
				clearTimeout(self.checkTimeout);
			}
		});
	}

	column.extensions.moveColumn = config;
};

MoveColumns.prototype.startMove = function(e, column){
	var self = this,
	element = column.getElement();


	self.moving = column;
	self.startX = (e.pageX - element.offset().left);

	self.table.element.addClass("tabulator-block-select");

	//create placeholder
	self.placeholderElement.css({
		width:column.getWidth(),
		height:column.getHeight(),
	});
	element.before(self.placeholderElement)
	element.detach();

	//create hover element
	self.hoverElement = element.clone();
	self.hoverElement.addClass("tabulator-moving");

	self.table.columnManager.getElement().append(self.hoverElement);
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
		if(column.extensions.moveColumn.mousemove){
			column.element.on("mousemove", column.extensions.moveColumn.mousemove);
		}
	});
};

MoveColumns.prototype._unbindMouseMove = function(){
	var self = this;

	self.table.columnManager.columnsByIndex.forEach(function(column){
		if(column.extensions.moveColumn.mousemove){
			column.element.off("mousemove", column.extensions.moveColumn.mousemove);
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
			cell.getElement().after(movingCells[i].getElement())
		});
	}else{
		column.getCells().forEach(function(cell, i){
			cell.getElement().before(movingCells[i].getElement())
		});
	}
};

MoveColumns.prototype.endMove = function(column){
	var self = this;

	self._unbindMouseMove();

	self.placeholderElement.after(self.moving.getElement());
	self.placeholderElement.detach();
	self.hoverElement.detach();

	self.table.element.removeClass("tabulator-block-select");

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
	scrollLeft = columnHolder.scrollLeft(),
	xPos = (e.pageX - columnHolder.offset().left) + scrollLeft,
	scrollPos;

	self.hoverElement.css({
		"left":xPos - self.startX,
	});


	if(xPos - scrollLeft < self.autoScrollMargin){
		if(!self.autoScrollTimeout){
			self.autoScrollTimeout = setTimeout(function(){
				scrollPos = Math.max(0,scrollLeft-5);
				self.table.rowManager.getElement().scrollLeft(scrollPos);
				self.autoScrollTimeout = false;
			}, 1);
		}
	}

	if(scrollLeft + columnHolder.innerWidth() - xPos < self.autoScrollMargin){
		if(!self.autoScrollTimeout){
			self.autoScrollTimeout = setTimeout(function(){
				scrollPos = Math.min(columnHolder.innerWidth(), scrollLeft+5);
				self.table.rowManager.getElement().scrollLeft(scrollPos);
				self.autoScrollTimeout = false;
			}, 1);
		}
	}
};

Tabulator.registerExtension("moveColumn", MoveColumns);