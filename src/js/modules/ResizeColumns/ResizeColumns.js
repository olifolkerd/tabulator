import Module from '../../core/Module.js';

class ResizeColumns extends Module{
	
	constructor(table){
		super(table);
		
		this.startColumn = false;
		this.startX = false;
		this.startWidth = false;
		this.latestX = false;
		this.handle = null;
		this.initialNextColumn = null;
		this.nextColumn = null;
		
		this.initialized = false;
		this.registerColumnOption("resizable", true);
		this.registerTableOption("resizableColumnFit", false);
	}
	
	initialize(){
		this.subscribe("column-rendered", this.layoutColumnHeader.bind(this));
	}
	
	initializeEventWatchers(){
		if(!this.initialized){
			
			this.subscribe("cell-rendered", this.layoutCellHandles.bind(this));
			this.subscribe("cell-delete", this.deInitializeComponent.bind(this));
			
			this.subscribe("cell-height", this.resizeHandle.bind(this));
			this.subscribe("column-moved", this.columnLayoutUpdated.bind(this));
			
			this.subscribe("column-hide", this.deInitializeColumn.bind(this));
			this.subscribe("column-show", this.columnLayoutUpdated.bind(this));
			this.subscribe("column-width", this.columnWidthUpdated.bind(this));
			
			this.subscribe("column-delete", this.deInitializeComponent.bind(this));
			this.subscribe("column-height", this.resizeHandle.bind(this));
			
			this.initialized = true;
		}
	}
	
	
	layoutCellHandles(cell){
		if(cell.row.type === "row"){
			this.deInitializeComponent(cell);
			this.initializeColumn("cell", cell, cell.column, cell.element);
		}
	}
	
	layoutColumnHeader(column){
		if(column.definition.resizable){
			this.initializeEventWatchers();
			this.deInitializeComponent(column);
			this.initializeColumn("header", column, column, column.element);
		}
	}
	
	columnLayoutUpdated(column){
		var prev = column.prevColumn();
		
		this.reinitializeColumn(column);
		
		if(prev){
			this.reinitializeColumn(prev);
		}
	}
	
	columnWidthUpdated(column){
		if(column.modules.frozen){
			if(this.table.modules.frozenColumns.leftColumns.includes(column)){
				this.table.modules.frozenColumns.leftColumns.forEach((col) => {
					this.reinitializeColumn(col);
				});
			}else if(this.table.modules.frozenColumns.rightColumns.includes(column)){
				this.table.modules.frozenColumns.rightColumns.forEach((col) => {
					this.reinitializeColumn(col);
				});
			}
		}
	}

	frozenColumnOffset(column){
		var offset = false;

		if(column.modules.frozen){
			offset = column.modules.frozen.marginValue; 

			if(column.modules.frozen.position === "left"){
				offset += column.getWidth() - 3;
			}else{
				if(offset){
					offset -= 3;
				}
			}
		}

		return offset !== false ? offset + "px" : false;
	}
	
	reinitializeColumn(column){
		var frozenOffset = this.frozenColumnOffset(column);
		
		column.cells.forEach((cell) => {
			if(cell.modules.resize && cell.modules.resize.handleEl){
				if(frozenOffset){
					cell.modules.resize.handleEl.style[column.modules.frozen.position] = frozenOffset;
				}
				
				cell.element.after(cell.modules.resize.handleEl);
			}
		});
		
		if(column.modules.resize && column.modules.resize.handleEl){
			if(frozenOffset){
				column.modules.resize.handleEl.style[column.modules.frozen.position] = frozenOffset;
			}
			
			column.element.after(column.modules.resize.handleEl);
		}
	}
	
	initializeColumn(type, component, column, element){
		var self = this,
		variableHeight = false,
		mode = column.definition.resizable,
		config = {},
		nearestColumn = column.getLastColumn();
		
		//set column resize mode
		if(type === "header"){
			variableHeight = column.definition.formatter == "textarea" || column.definition.variableHeight;
			config = {variableHeight:variableHeight};
		}
		
		if((mode === true || mode == type) && this._checkResizability(nearestColumn)){
			
			var handle = document.createElement('span');
			handle.className = "tabulator-col-resize-handle";
			
			handle.addEventListener("click", function(e){
				e.stopPropagation();
			});
			
			var handleDown = function(e){
				self.startColumn = column;
				self.initialNextColumn = self.nextColumn = nearestColumn.nextColumn();
				self._mouseDown(e, nearestColumn, handle);
			};
			
			handle.addEventListener("mousedown", handleDown);
			handle.addEventListener("touchstart", handleDown, {passive: true});
			
			//resize column on  double click
			handle.addEventListener("dblclick", (e) => {
				var oldWidth = nearestColumn.getWidth();
				
				e.stopPropagation();
				nearestColumn.reinitializeWidth(true);
				
				if(oldWidth !== nearestColumn.getWidth()){
					self.dispatch("column-resized", nearestColumn);
					self.table.externalEvents.dispatch("columnResized", nearestColumn.getComponent());
				}
			});
			
			if(column.modules.frozen){
				handle.style.position = "sticky";
				handle.style[column.modules.frozen.position] = this.frozenColumnOffset(column);
			}
			
			config.handleEl = handle;
			
			if(element.parentNode && column.visible){
				element.after(handle);			
			}
		}
		
		component.modules.resize = config;
	}
	
	deInitializeColumn(column){
		this.deInitializeComponent(column);
		
		column.cells.forEach((cell) => {
			this.deInitializeComponent(cell);
		});
	}
	
	deInitializeComponent(component){
		var handleEl;
		
		if(component.modules.resize){
			handleEl = component.modules.resize.handleEl;
			
			if(handleEl && handleEl.parentElement){
				handleEl.parentElement.removeChild(handleEl);
			}
		}
	}
	
	resizeHandle(component, height){
		if(component.modules.resize && component.modules.resize.handleEl){
			component.modules.resize.handleEl.style.height = height;
		}
	}
	
	_checkResizability(column){
		return column.definition.resizable;
	}
	
	_mouseDown(e, column, handle){
		var self = this;
		
		self.table.element.classList.add("tabulator-block-select");
		
		function mouseMove(e){
			var x = typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX,
			startDiff = x - self.startX,
			moveDiff = x - self.latestX,
			blockedBefore, blockedAfter;
			
			self.latestX = x;
			
			if(self.table.rtl){
				startDiff = -startDiff;
				moveDiff = -moveDiff;
			}
			
			blockedBefore = column.width == column.minWidth || column.width == column.maxWidth;
			
			column.setWidth(self.startWidth + startDiff);
			
			blockedAfter = column.width == column.minWidth || column.width == column.maxWidth;
			
			if(moveDiff < 0){
				self.nextColumn = self.initialNextColumn;
			}
			
			if(self.table.options.resizableColumnFit && self.nextColumn && !(blockedBefore && blockedAfter)){
				let colWidth = self.nextColumn.getWidth();
				
				if(moveDiff > 0){
					if(colWidth <= self.nextColumn.minWidth){
						self.nextColumn = self.nextColumn.nextColumn();
					}
				}
				
				if(self.nextColumn){
					self.nextColumn.setWidth(self.nextColumn.getWidth() - moveDiff);
				}
			}
			
			self.table.columnManager.rerenderColumns(true);
			
			if(!self.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight){
				column.checkCellHeights();
			}
		}
		
		function mouseUp(e){
			
			//block editor from taking action while resizing is taking place
			if(self.startColumn.modules.edit){
				self.startColumn.modules.edit.blocked = false;
			}
			
			if(self.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight){
				column.checkCellHeights();
			}
			
			document.body.removeEventListener("mouseup", mouseUp);
			document.body.removeEventListener("mousemove", mouseMove);
			
			handle.removeEventListener("touchmove", mouseMove);
			handle.removeEventListener("touchend", mouseUp);
			
			self.table.element.classList.remove("tabulator-block-select");
			
			if(self.startWidth !== column.getWidth()){
				self.table.columnManager.verticalAlignHeaders();

				self.dispatch("column-resized", column);
				self.table.externalEvents.dispatch("columnResized", column.getComponent());
			}
		}
		
		e.stopPropagation(); //prevent resize from interfering with movable columns
		
		//block editor from taking action while resizing is taking place
		if(self.startColumn.modules.edit){
			self.startColumn.modules.edit.blocked = true;
		}
		
		self.startX = typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX;
		self.latestX = self.startX;
		self.startWidth = column.getWidth();
		
		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
		handle.addEventListener("touchmove", mouseMove, {passive: true});
		handle.addEventListener("touchend", mouseUp);
	}
}

ResizeColumns.moduleName = "resizeColumns";

export default ResizeColumns;