import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';

class MoveRows extends Module{

	constructor(table){
		super(table);

		this.placeholderElement = this.createPlaceholderElement();
		this.hoverElement = false; //floating row header element
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

		this.touchMove = false;

		this.connection = false;
		this.connectionSelectorsTables = false;
		this.connectionSelectorsElements = false;
		this.connectionElements = [];
		this.connections = [];

		this.connectedTable = false;
		this.connectedRow = false;

		this.registerTableOption("movableRows", false); //enable movable rows
		this.registerTableOption("movableRowsConnectedTables", false); //tables for movable rows to be connected to
		this.registerTableOption("movableRowsConnectedElements", false); //other elements for movable rows to be connected to
		this.registerTableOption("movableRowsSender", false);
		this.registerTableOption("movableRowsReceiver", "insert");

		this.registerColumnOption("rowHandle");
	}

	createPlaceholderElement(){
		var el = document.createElement("div");

		el.classList.add("tabulator-row");
		el.classList.add("tabulator-row-placeholder");

		return el;
	}

	initialize(){
		if(this.table.options.movableRows){
			this.connectionSelectorsTables = this.table.options.movableRowsConnectedTables;
			this.connectionSelectorsElements = this.table.options.movableRowsConnectedElements;

			this.connection = this.connectionSelectorsTables || this.connectionSelectorsElements;

			this.subscribe("cell-init", this.initializeCell.bind(this));
			this.subscribe("column-init", this.initializeColumn.bind(this));
			this.subscribe("row-init", this.initializeRow.bind(this));
		}
	}

	initializeGroupHeader(group){
		var self = this,
		config = {},
		rowEl;

		//inter table drag drop
		config.mouseup = function(e){
			self.tableRowDrop(e, row);
		}.bind(self);

		//same table drag drop
		config.mousemove = function(e){
			if(((e.pageY - Helpers.elOffset(group.element).top) + self.table.rowManager.element.scrollTop) > (group.getHeight() / 2)){
				if(self.toRow !== group || !self.toRowAfter){
					var rowEl = group.getElement();
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl.nextSibling);
					self.moveRow(group, true);
				}
			}else{
				if(self.toRow !== group || self.toRowAfter){
					var rowEl = group.getElement();
					if(rowEl.previousSibling){
						rowEl.parentNode.insertBefore(self.placeholderElement, rowEl);
						self.moveRow(group, false);
					}
				}
			}
		}.bind(self);

		group.modules.moveRow = config;
	}

	initializeRow(row){
		var self = this,
		config = {},
		rowEl;

		//inter table drag drop
		config.mouseup = function(e){
			self.tableRowDrop(e, row);
		}.bind(self);

		//same table drag drop
		config.mousemove = function(e){
			var rowEl = row.getElement();

			if(((e.pageY - Helpers.elOffset(rowEl).top) + self.table.rowManager.element.scrollTop) > (row.getHeight() / 2)){
				if(self.toRow !== row || !self.toRowAfter){
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl.nextSibling);
					self.moveRow(row, true);
				}
			}else{
				if(self.toRow !== row || self.toRowAfter){
					rowEl.parentNode.insertBefore(self.placeholderElement, rowEl);
					self.moveRow(row, false);
				}
			}
		}.bind(self);


		if(!this.hasHandle){

			rowEl = row.getElement();

			rowEl.addEventListener("mousedown", function(e){
				if(e.which === 1){
					self.checkTimeout = setTimeout(function(){
						self.startMove(e, row);
					}, self.checkPeriod);
				}
			});

			rowEl.addEventListener("mouseup", function(e){
				if(e.which === 1){
					if(self.checkTimeout){
						clearTimeout(self.checkTimeout);
					}
				}
			});

			this.bindTouchEvents(row, row.getElement());
		}

		row.modules.moveRow = config;
	}

	initializeColumn(column){
		if(column.definition.rowHandle && this.table.options.movableRows !== false){
			this.hasHandle = true;
		}
	}

	initializeCell(cell){
		if(cell.column.definition.rowHandle && this.table.options.movableRows !== false){
			var self = this,
			cellEl = cell.getElement(true);

			cellEl.addEventListener("mousedown", function(e){
				if(e.which === 1){
					self.checkTimeout = setTimeout(function(){
						self.startMove(e, cell.row);
					}, self.checkPeriod);
				}
			});

			cellEl.addEventListener("mouseup", function(e){
				if(e.which === 1){
					if(self.checkTimeout){
						clearTimeout(self.checkTimeout);
					}
				}
			});

			this.bindTouchEvents(cell.row, cellEl);
		}
	}

	bindTouchEvents(row, element){
		var startYMove = false, //shifting center position of the cell
		dir = false,
		currentRow, nextRow, prevRow, nextRowHeight, prevRowHeight, nextRowHeightLast, prevRowHeightLast;

		element.addEventListener("touchstart", (e) => {
			this.checkTimeout = setTimeout(() => {
				this.touchMove = true;
				currentRow = row;
				nextRow = row.nextRow();
				nextRowHeight = nextRow ? nextRow.getHeight()/2 : 0;
				prevRow = row.prevRow();
				prevRowHeight = prevRow ? prevRow.getHeight()/2 : 0;
				nextRowHeightLast = 0;
				prevRowHeightLast = 0;
				startYMove = false;

				this.startMove(e, row);
			}, this.checkPeriod);
		}, {passive: true});
		this.moving, this.toRow, this.toRowAfter
		element.addEventListener("touchmove", (e) => {

			var halfCol, diff, moveToRow;

			if(this.moving){
				e.preventDefault();

				this.moveHover(e);

				if(!startYMove){
					startYMove = e.touches[0].pageY;
				}

				diff = e.touches[0].pageY - startYMove;

				if(diff > 0){
					if(nextRow && diff - nextRowHeightLast > nextRowHeight){
						moveToRow = nextRow;

						if(moveToRow !== row){
							startYMove = e.touches[0].pageY
							moveToRow.getElement().parentNode.insertBefore(this.placeholderElement, moveToRow.getElement().nextSibling);
							this.moveRow(moveToRow, true);
						}
					}
				}else{
					if(prevRow && -diff - prevRowHeightLast >  prevRowHeight){
						moveToRow = prevRow;

						if(moveToRow !== row){
							startYMove = e.touches[0].pageY;
							moveToRow.getElement().parentNode.insertBefore(this.placeholderElement, moveToRow.getElement());
							this.moveRow(moveToRow, false);
						}
					}
				}

				if(moveToRow){
					currentRow = moveToRow;
					nextRow = moveToRow.nextRow();
					nextRowHeightLast = nextRowHeight;
					nextRowHeight = nextRow ? nextRow.getHeight() / 2 : 0;
					prevRow = moveToRow.prevRow();
					prevRowHeightLast = prevRowHeight;
					prevRowHeight = prevRow ? prevRow.getHeight() / 2 : 0;
				}
			}
		});

		element.addEventListener("touchend", (e) => {
			if(this.checkTimeout){
				clearTimeout(this.checkTimeout);
			}
			if(this.moving){
				this.endMove(e);
				this.touchMove = false;
			}
		});
	}

	_bindMouseMove(){
		this.table.rowManager.getDisplayRows().forEach((row) => {
			if((row.type === "row" || row.type === "group") && row.modules.moveRow && row.modules.moveRow.mousemove){
				row.getElement().addEventListener("mousemove", row.modules.moveRow.mousemove);
			}
		});
	}

	_unbindMouseMove(){
		this.table.rowManager.getDisplayRows().forEach((row) => {
			if((row.type === "row" || row.type === "group") && row.modules.moveRow && row.modules.moveRow.mousemove){
				row.getElement().removeEventListener("mousemove", row.modules.moveRow.mousemove);
			}
		});
	}

	startMove(e, row){
		var element = row.getElement();

		this.setStartPosition(e, row);

		this.moving = row;

		this.table.element.classList.add("tabulator-block-select");

		//create placeholder
		this.placeholderElement.style.width = row.getWidth() + "px";
		this.placeholderElement.style.height = row.getHeight() + "px";

		if(!this.connection){
			element.parentNode.insertBefore(this.placeholderElement, element);
			element.parentNode.removeChild(element);
		}else{
			this.table.element.classList.add("tabulator-movingrow-sending");
			this.connectToTables(row);
		}

		//create hover element
		this.hoverElement = element.cloneNode(true);
		this.hoverElement.classList.add("tabulator-moving");

		if(this.connection){
			document.body.appendChild(this.hoverElement);
			this.hoverElement.style.left = "0";
			this.hoverElement.style.top = "0";
			this.hoverElement.style.width = this.table.element.clientWidth + "px";
			this.hoverElement.style.whiteSpace = "nowrap";
			this.hoverElement.style.overflow = "hidden";
			this.hoverElement.style.pointerEvents = "none";
		}else{
			this.table.rowManager.getTableElement().appendChild(this.hoverElement);

			this.hoverElement.style.left = "0";
			this.hoverElement.style.top = "0";

			this._bindMouseMove();
		}

		document.body.addEventListener("mousemove", this.moveHover);
		document.body.addEventListener("mouseup", this.endMove);

		this.dispatchExternal("rowMoving", row.getComponent());

		this.moveHover(e);
	}

	setStartPosition(e, row){
		var pageX = this.touchMove ? e.touches[0].pageX : e.pageX,
		pageY = this.touchMove ? e.touches[0].pageY : e.pageY,
		element, position;

		element = row.getElement();
		if(this.connection){
			position = element.getBoundingClientRect();

			this.startX = position.left - pageX + window.pageXOffset;
			this.startY = position.top - pageY + window.pageYOffset;
		}else{
			this.startY = (pageY - element.getBoundingClientRect().top);
		}
	}

	endMove(e){
		if(!e || e.which === 1 || this.touchMove){
			this._unbindMouseMove();

			if(!this.connection){
				this.placeholderElement.parentNode.insertBefore(this.moving.getElement(), this.placeholderElement.nextSibling);
				this.placeholderElement.parentNode.removeChild(this.placeholderElement);
			}

			this.hoverElement.parentNode.removeChild(this.hoverElement);

			this.table.element.classList.remove("tabulator-block-select");

			if(this.toRow){
				this.table.rowManager.moveRow(this.moving, this.toRow, this.toRowAfter);
			}else{
				this.dispatchExternal("rowMoveCancelled", this.moving.getComponent());
			}

			this.moving = false;
			this.toRow = false;
			this.toRowAfter = false;

			document.body.removeEventListener("mousemove", this.moveHover);
			document.body.removeEventListener("mouseup", this.endMove);

			if(this.connection){
				this.table.element.classList.remove("tabulator-movingrow-sending");
				this.disconnectFromTables();
			}
		}
	}

	moveRow(row, after){
		this.toRow = row;
		this.toRowAfter = after;
	}

	moveHover(e){
		if(this.connection){
			this.moveHoverConnections.call(this, e);
		}else{
			this.moveHoverTable.call(this, e);
		}
	}

	moveHoverTable(e){
		var rowHolder = this.table.rowManager.getElement(),
		scrollTop = rowHolder.scrollTop,
		yPos = ((this.touchMove ? e.touches[0].pageY : e.pageY) - rowHolder.getBoundingClientRect().top) + scrollTop,
		scrollPos;

		this.hoverElement.style.top = (yPos - this.startY) + "px";
	}

	moveHoverConnections(e){
		this.hoverElement.style.left = (this.startX + (this.touchMove ? e.touches[0].pageX : e.pageX)) + "px";
		this.hoverElement.style.top = (this.startY + (this.touchMove ? e.touches[0].pageY : e.pageY)) + "px";
	}

	elementRowDrop(e, element, row){
		this.dispatchExternal("movableRowsElementDrop", e, element, row ? row.getComponent() : false);
	}

	//establish connection with other tables
	connectToTables(row){
		var connectionTables;

		if(this.connectionSelectorsTables){
			connectionTables = this.commsConnections(this.connectionSelectorsTables);

			this.dispatchExternal("movableRowsSendingStart", connectionTables);

			this.commsSend(this.connectionSelectorsTables, "moveRow", "connect", {
				row:row,
			});
		}

		if(this.connectionSelectorsElements){

			this.connectionElements = [];

			if(!Array.isArray(this.connectionSelectorsElements)){
				this.connectionSelectorsElements = [this.connectionSelectorsElements];
			}

			this.connectionSelectorsElements.forEach((query) => {
				if(typeof query === "string"){
					this.connectionElements = this.connectionElements.concat(Array.prototype.slice.call(document.querySelectorAll(query)));
				}else{
					this.connectionElements.push(query);
				}
			});

			this.connectionElements.forEach((element) => {
				var dropEvent = (e) => {
					this.elementRowDrop(e, element, this.moving);
				};

				element.addEventListener("mouseup", dropEvent);
				element.tabulatorElementDropEvent = dropEvent;

				element.classList.add("tabulator-movingrow-receiving");
			});
		}
	}

	//disconnect from other tables
	disconnectFromTables(){
		var connectionTables;

		if(this.connectionSelectorsTables){
			connectionTables = this.commsConnections(this.connectionSelectorsTables);

			this.dispatchExternal("movableRowsSendingStop", connectionTables);

			this.commsSend(this.connectionSelectorsTables, "moveRow", "disconnect");
		}

		this.connectionElements.forEach((element) => {
			element.classList.remove("tabulator-movingrow-receiving");
			element.removeEventListener("mouseup", element.tabulatorElementDropEvent);
			delete element.tabulatorElementDropEvent;
		});
	}

	//accept incomming connection
	connect(table, row){
		if(!this.connectedTable){
			this.connectedTable = table;
			this.connectedRow = row;

			this.table.element.classList.add("tabulator-movingrow-receiving");

			this.table.rowManager.getDisplayRows().forEach((row) => {
				if(row.type === "row" && row.modules.moveRow && row.modules.moveRow.mouseup){
					row.getElement().addEventListener("mouseup", row.modules.moveRow.mouseup);
				}
			});

			this.tableRowDropEvent = this.tableRowDrop.bind(this);

			this.table.element.addEventListener("mouseup", this.tableRowDropEvent);

			this.dispatchExternal("movableRowsReceivingStart", row, table);

			return true;
		}else{
			console.warn("Move Row Error - Table cannot accept connection, already connected to table:", this.connectedTable);
			return false;
		}
	}

	//close incomming connection
	disconnect(table){
		if(table === this.connectedTable){
			this.connectedTable = false;
			this.connectedRow = false;

			this.table.element.classList.remove("tabulator-movingrow-receiving");

			this.table.rowManager.getDisplayRows().forEach((row) =>{
				if(row.type === "row" && row.modules.moveRow && row.modules.moveRow.mouseup){
					row.getElement().removeEventListener("mouseup", row.modules.moveRow.mouseup);
				}
			});

			this.table.element.removeEventListener("mouseup", this.tableRowDropEvent);

			this.dispatchExternal("movableRowsReceivingStop", table);
		}else{
			console.warn("Move Row Error - trying to disconnect from non connected table")
		}
	}

	dropComplete(table, row, success){
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

			this.dispatchExternal("movableRowsSent", this.moving.getComponent(), row ? row.getComponent() : undefined, table);
		}else{
			this.dispatchExternal("movableRowsSentFailed", this.moving.getComponent(), row ? row.getComponent() : undefined, table);
		}

		this.endMove();
	}

	tableRowDrop(e, row){
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
			this.dispatchExternal("movableRowsReceived", this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
		}else{
			this.dispatchExternal("movableRowsReceivedFailed", this.connectedRow.getComponent(), row ? row.getComponent() : undefined, this.connectedTable);
		}

		this.commsSend(this.connectedTable, "moveRow", "dropcomplete", {
			row:row,
			success:success,
		});
	}

	commsReceived(table, action, data){
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
};

MoveRows.prototype.senders = {
	delete:function(fromRow, toRow, toTable){
		fromRow.delete();
	}
};

MoveRows.moduleName = "moveRow";

export default MoveRows;