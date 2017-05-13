var MoveRows = function(table){

	var extension = {
		table:table, //hold Tabulator object
		placeholderElement:$("<div class='tabulator-row tabulator-row-placeholder'></div>"),
		hoverElement:$(), //floating row header element
		checkTimeout:false, //click check timeout holder
		checkPeriod:150, //period to wait on mousedown to consider this a move and not a click
		moving:false, //currently moving row
		toRow:false, //destination row
		toRowAfter:false, //position of moving row relative to the desitnation row
		startY:0, //starting position within header element

		initializeRow:function(row){
			var self = this,
			config = {};

			config.mousemove = function(e){
				if(((e.pageY - row.element.offset().top) + self.table.rowManager.element.scrollTop()) > (row.getHeight() / 2)){
					if(self.toRow !== row || !self.toRowAfter){
						row.element.after(self.placeholderElement);
						self.moveRow(row, true);
					}
				}else{
					if(self.toRow !== row || self.toRowAfter){
						row.element.before(self.placeholderElement);
						self.moveRow(row, false);
					}
				}
			}.bind(self)

			row.getElement().on("mousedown", function(e){
				self.checkTimeout = setTimeout(function(){
					self.startMove(e, row);
				}, self.checkPeriod)
			});

			row.getElement().on("mouseup", function(e){
				if(self.checkTimeout){
					clearTimeout(self.checkTimeout);
				}
			});

			row.extensions.moveRow = config;
		},

		_bindMouseMove:function(){
			var self = this;

			self.table.rowManager.displayRows.forEach(function(row){
				if(row.extensions.moveRow.mousemove){
					row.element.on("mousemove", row.extensions.moveRow.mousemove);
				}
			});
		},

		_unbindMouseMove:function(){
			var self = this;

			self.table.rowManager.displayRows.forEach(function(row){
				if(row.extensions.moveRow.mousemove){
					row.element.off("mousemove", row.extensions.moveRow.mousemove);
				}
			});
		},

		startMove:function(e, row){
			var self = this,
			element = row.getElement();

			self.moving = row;
			self.startY = (e.pageY - element.offset().top);

			self.table.element.addClass("tabulator-block-select");

			//create placeholder
			self.placeholderElement.css({
				width:row.getWidth(),
				height:row.getHeight(),
			});
			element.before(self.placeholderElement)
			element.detach();

			//create hover element
			self.hoverElement = element.clone();
			self.hoverElement.addClass("tabulator-moving");

			self.table.rowManager.getTableElement().append(self.hoverElement);
			self.hoverElement.css({
				"left":0,
				"top":0,
			});


			self._bindMouseMove();

			$("body").on("mousemove", self.moveHover);
			$("body").on("mouseup", self.endMove);

			self.moveHover(e);
		},

		endMove:function(column){
			var self = this;

			self._unbindMouseMove();

			self.placeholderElement.after(self.moving.getElement());
			self.placeholderElement.detach();
			self.hoverElement.detach();

			self.table.element.removeClass("tabulator-block-select");

			if(self.toRow){
				self.table.rowManager.moveRow(self.moving, self.toRow, self.toRowAfter);
			}

			self.moving = false;
			self.toRow = false;
			self.toRowAfter = false;

			$("body").off("mousemove", self.moveHover);
			$("body").off("mouseup", self.endMove);
		},

		moveRow:function(row, after){
			var self = this;

			self.toRow = row;
			self.toRowAfter = after;
		},

		moveHover:function(e){
			var self = this,
			rowHolder = self.table.rowManager.getElement(),
			scrollTop = rowHolder.scrollTop(),
			yPos = (e.pageY - rowHolder.offset().top) + scrollTop,
			scrollPos;

			self.hoverElement.css({
				"top":yPos - self.startY,
			});
		}

	}

	extension.moveHover = extension.moveHover.bind(extension);
	extension.endMove = extension.endMove.bind(extension);

	return extension;
}

Tabulator.registerExtension("moveRow", MoveRows);