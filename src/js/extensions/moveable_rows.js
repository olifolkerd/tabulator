var MoveRows = function(table){

	this.table = table; //hold Tabulator object
	this.placeholderElement = $("<div class='tabulator-row tabulator-row-placeholder'></div>");
	this.hoverElement = $(); //floating row header element
	this.checkTimeout = false; //click check timeout holder
	this.checkPeriod = 150; //period to wait on mousedown to consider this a move and not a click
	this.moving = false; //currently moving row
	this.toRow = false; //destination row
	this.toRowAfter = false; //position of moving row relative to the desitnation row
	this.hasHandle = false; //row has handle instead of fully movable row
	this.startY = 0; //starting Y position within header element
	this.startX = 0; //starting X position within header element

	this.moveHover = this.moveHover.bind(this);
	this.endMove = this.endMove.bind(this);
	this.tableRowDropEvent = false;

	this.connection = false;
	this.connections = [];

	this.connectedTable = false;
	this.connectedRow = false;
};


MoveRows.prototype.initialize = function(handle){
	this.connection = this.table.options.movableRowsConnectedTables;
};

MoveRows.prototype.setHandle = function(handle){
	this.hasHandle = handle;
};

MoveRows.prototype.initializeRow = function(row){
	var self = this,
	config = {};

	//inter table drag drop
	config.mouseup = function(e){
		self.tableRowDrop(e, row);
	}.bind(self)

	//same table drag drop
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
	}.bind(self);


	if(!this.hasHandle){

		row.getElement().on("mousedown", function(e){
			self.checkTimeout = setTimeout(function(){
				self.startMove(e, row);
			}, self.checkPeriod);
		});

		row.getElement().on("mouseup", function(e){
			if(self.checkTimeout){
				clearTimeout(self.checkTimeout);
			}
		});
	}

	row.extensions.moveRow = config;
};

MoveRows.prototype.initializeCell = function(cell){
	var self = this;

	cell.getElement().on("mousedown", function(e){
		self.checkTimeout = setTimeout(function(){
			self.startMove(e, cell.row);
		}, self.checkPeriod);
	});

	cell.getElement().on("mouseup", function(e){
		if(self.checkTimeout){
			clearTimeout(self.checkTimeout);
		}
	});
};

MoveRows.prototype._bindMouseMove = function(){
	var self = this;

	self.table.rowManager.getDisplayRows().forEach(function(row){
		if(row.type === "row" && row.extensions.moveRow.mousemove){
			row.element.on("mousemove", row.extensions.moveRow.mousemove);
		}
	});
};

MoveRows.prototype._unbindMouseMove = function(){
	var self = this;

	self.table.rowManager.getDisplayRows().forEach(function(row){
		if(row.type === "row" && row.extensions.moveRow.mousemove){
			row.element.off("mousemove", row.extensions.moveRow.mousemove);
		}
	});
};

MoveRows.prototype.startMove = function(e, row){
	var element = row.getElement();

	this.setStartPosition(e, row);

	this.moving = row;

	this.table.element.addClass("tabulator-block-select");

	//create placeholder
	this.placeholderElement.css({
		width:row.getWidth(),
		height:row.getHeight(),
	});

	if(!this.connection){
		element.before(this.placeholderElement)
		element.detach();
	}else{
		this.table.element.addClass("tabulator-movingrow-sending");
		this.connectToTables(row);
	}

	//create hover element
	this.hoverElement = element.clone();
	this.hoverElement.addClass("tabulator-moving");

	if(this.connection){

		$("body").append(this.hoverElement);
		this.hoverElement.css({
			"left":0,
			"top":0,
			"width":this.table.element.innerWidth(),
			"white-space": "nowrap",
			"overflow":"hidden",
			"pointer-events":"none",
		});

	}else{
		this.table.rowManager.getTableElement().append(this.hoverElement);
		this.hoverElement.css({
			"left":0,
			"top":0,
		});

		this._bindMouseMove();
	}

	$("body").on("mousemove", this.moveHover);
	$("body").on("mouseup", this.endMove);

	this.moveHover(e);
};


MoveRows.prototype.setStartPosition = function(e, row){
	var element, position;

	element = row.getElement();
	if(this.connection){
		position = element[0].getBoundingClientRect();

		this.startX = position.left - e.pageX + window.scrollX;
		this.startY = position.top - e.pageY + window.scrollY;
	}else{
		this.startY = (e.pageY - element.offset().top);
	}
};

MoveRows.prototype.endMove = function(column){
	this._unbindMouseMove();

	if(!this.connection){
		this.placeholderElement.after(this.moving.getElement());
		this.placeholderElement.detach();
	}

	this.hoverElement.detach();

	this.table.element.removeClass("tabulator-block-select");

	if(this.toRow){
		this.table.rowManager.moveRow(this.moving, this.toRow, this.toRowAfter);
	}

	this.moving = false;
	this.toRow = false;
	this.toRowAfter = false;

	$("body").off("mousemove", this.moveHover);
	$("body").off("mouseup", this.endMove);

	if(this.connection){
		this.table.element.removeClass("tabulator-movingrow-sending");
		this.disconnectFromTables();
	}
};

MoveRows.prototype.moveRow = function(row, after){
	this.toRow = row;
	this.toRowAfter = after;
};

MoveRows.prototype.moveHover = function(e){
	if(this.connection){
		this.moveHoverConnections.call(this, e);
	}else{
		this.moveHoverTable.call(this, e);
	}
};

MoveRows.prototype.moveHoverTable = function(e){
	var rowHolder = this.table.rowManager.getElement(),
	scrollTop = rowHolder.scrollTop(),
	yPos = (e.pageY - rowHolder.offset().top) + scrollTop,
	scrollPos;

	this.hoverElement.css({
		"top":yPos - this.startY,
	});
}


MoveRows.prototype.moveHoverConnections = function(e){
	this.hoverElement.css({
		"left":this.startX + e.pageX,
		"top":this.startY + e.pageY,
	});
}


//establish connection with other tables
MoveRows.prototype.connectToTables = function(row){
	var self = this,
	connections = this.table.extensions.comms.getConnections(this.connection);

	this.table.options.movableRowsSendingStart(connections);

	this.table.extensions.comms.send(this.connection, "moveRow", "connect", {
		row:row,
	});
}


//disconnect from other tables
MoveRows.prototype.disconnectFromTables = function(){
	var self = this,
	connections = this.table.extensions.comms.getConnections(this.connection);

	this.table.options.movableRowsSendingStop(connections);

	this.table.extensions.comms.send(this.connection, "moveRow", "disconnect");
}


//accept incomming connection
MoveRows.prototype.connect = function(table, row){
	var self = this;
	if(!this.connectedTable){
		this.connectedTable = table;
		this.connectedRow = row;

		this.table.element.addClass("tabulator-movingrow-receiving");

		self.table.rowManager.getDisplayRows().forEach(function(row){
			if(row.type === "row" && row.extensions.moveRow && row.extensions.moveRow.mouseup){
				row.element.on("mouseup", row.extensions.moveRow.mouseup);
			}
		});

		self.tableRowDropEvent = self.tableRowDrop.bind(self);

		self.table.element.on("mouseup", self.tableRowDropEvent);

		this.table.options.movableRowsReceivingStart(row, table);

		return true;
	}else{
		console.warn("Move Row Error - Table cannot accept connection, already connected to table:", this.connectedTable);
		return false;
	}
}

//close incomming connection
MoveRows.prototype.disconnect = function(table){
	var self = this;
	if(table === this.connectedTable){
		this.connectedTable = false;
		this.connectedRow = false;

		this.table.element.removeClass("tabulator-movingrow-receiving");

		self.table.rowManager.getDisplayRows().forEach(function(row){
			if(row.type === "row" && row.extensions.moveRow && row.extensions.moveRow.mouseup){
				row.element.off("mouseup", row.extensions.moveRow.mouseup);
			}
		});

		self.table.element.off("mouseup", self.tableRowDropEvent);

		this.table.options.movableRowsReceivingStop(table);
	}else{
		console.warn("Move Row Error - trying to disconnect from non connected table")
	}
}

MoveRows.prototype.dropComplete = function(table, row, success){
	var sender = false;

	if(success){

		switch(typeof this.table.options.movableRowsSender){
			case "string":
			sender = this.senders[this.table.options.movableRowsSender];
			break;

			case "function":
			sender = this.table.options.movableRowsSender;
			break;
		}

		if(sender){
			sender.call(this, this.moving.getComponent(), row ? row.getComponent() : undefined, table)
		}else{
			if(this.table.options.movableRowsSender){
				console.warn("Mover Row Error - no matching sender found:", this.table.options.movableRowsSender);
			}
		}

		this.table.options.movableRowsSent(this.moving.getComponent(), row ? row.getComponent() : undefined, table);

	}else{
		this.table.options.movableRowsSentFailed(this.moving.getComponent(), row ? row.getComponent() : undefined, table);
	}

	this.endMove();

}


MoveRows.prototype.tableRowDrop = function(e, row){
	var receiver = false,
	success = false;

	e.stopImmediatePropagation();

	switch(typeof this.table.options.movableRowsReceiver){
		case "string":
		receiver = this.receivers[this.table.options.movableRowsReceiver];
		break;

		case "function":
		receiver = this.table.options.movableRowsReceiver;
		break;
	}

	if(receiver){
		success = receiver.call(this, this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable)
	}else{
		console.warn("Mover Row Error - no matching receiver found:", this.table.options.movableRowsReceiver)
	}

	if(success){
		this.table.options.movableRowsReceived(this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
	}else{
		this.table.options.movableRowsReceivedFailed(this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
	}

	this.table.extensions.comms.send(this.connectedTable, "moveRow", "dropcomplete", {
		row:row,
		success:success,
	});
}



MoveRows.prototype.receivers = {
	insert:function(fromRow, toRow, fromTable){
		this.table.addRow(fromRow.getData(), undefined, toRow);
		return true;
	},

	add:function(fromRow, toRow, fromTable){
		this.table.addRow(fromRow.getData());
		return true;
	},

	update:function(fromRow, toRow, fromTable){
		if(toRow){
			toRow.update(fromRow.getData());
			return true;
		}

		return false;
	},

	replace:function(fromRow, toRow, fromTable){
		if(toRow){
			this.table.addRow(fromRow.getData(), undefined, toRow);
			toRow.delete();
			return true;
		}

		return false;
	},
}

MoveRows.prototype.senders = {
	delete:function(fromRow, toRow, toTable){
		fromRow.delete();
	}
}


MoveRows.prototype.commsReceived = function(table, action, data){
	switch(action){
		case "connect":
		return this.connect(table, data.row);
		break;

		case "disconnect":
		return this.disconnect(table);
		break;

		case "dropcomplete":
		return this.dropComplete(table, data.row, data.success);
		break;
	}
}


Tabulator.registerExtension("moveRow", MoveRows);