import Module from '../../core/Module.js';

class ResizeColumns extends Module{
	
	constructor(table){
		super(table);
		
		this.startColumn = false;
		this.startX = false;
		this.startWidth = false;
		this.handle = null;
		this.prevHandle = null;
		
		this.registerColumnOption("resizable", true);
	}
	
	initialize(){
		// if(this.table.options.resizableColumns){
		this.subscribe("cell-layout", this.layoutCellHandles.bind(this));
		this.subscribe("column-init", this.layoutColumnHeader.bind(this));
		// }
	}
	
	layoutCellHandles(cell){
		if(cell.row.type === "row"){
			this.initializeColumn("cell", cell.column, cell.element);
		}
	}
	
	layoutColumnHeader(column){
		this.initializeColumn("header", column, column.element);
	}
	
	initializeColumn(type, column, element){
		var self = this,
		variableHeight = false,
		mode = column.definition.resizable;
		
		//set column resize mode
		if(type === "header"){
			variableHeight = column.definition.formatter == "textarea" || column.definition.variableHeight;
			column.modules.resize = {variableHeight:variableHeight};
		}
		
		if(mode === true || mode == type){
			
			var handle = document.createElement('div');
			handle.className = "tabulator-col-resize-handle";
			
			
			var prevHandle = document.createElement('div');
			prevHandle.className = "tabulator-col-resize-handle prev";
			
			handle.addEventListener("click", function(e){
				e.stopPropagation();
			});
			
			var handleDown = function(e){
				var nearestColumn = column.getLastColumn();
				
				if(nearestColumn && self._checkResizability(nearestColumn)){
					self.startColumn = column;
					self._mouseDown(e, nearestColumn, handle);
				}
			};
			
			handle.addEventListener("mousedown", handleDown);
			handle.addEventListener("touchstart", handleDown, {passive: true});
			
			//reszie column on  double click
			handle.addEventListener("dblclick", function(e){
				var col = column.getLastColumn(),
				oldWidth;
				
				if(col && self._checkResizability(col)){
					oldWidth = col.getWidth();

					e.stopPropagation();
					col.reinitializeWidth(true);

					if(oldWidth !== col.getWidth()){
						self.dispatch("column-resized", col);
						self.table.externalEvents.dispatch("columnResized", col.getComponent());
					}
				}
			});
			
			
			prevHandle.addEventListener("click", function(e){
				e.stopPropagation();
			});
			
			var prevHandleDown = function(e){
				var nearestColumn, colIndex, prevColumn;
				
				nearestColumn = column.getFirstColumn();
				
				if(nearestColumn){
					colIndex = self.table.columnManager.findColumnIndex(nearestColumn);
					prevColumn = colIndex > 0 ? self.table.columnManager.getColumnByIndex(colIndex - 1) : false;
					
					if(prevColumn && self._checkResizability(prevColumn)){
						self.startColumn = column;
						self._mouseDown(e, prevColumn, prevHandle);
					}
				}
			};
			
			prevHandle.addEventListener("mousedown", prevHandleDown);
			prevHandle.addEventListener("touchstart", prevHandleDown, {passive: true});
			
			//resize column on double click
			prevHandle.addEventListener("dblclick", function(e){
				var nearestColumn, colIndex, prevColumn;
				
				nearestColumn = column.getFirstColumn();
				
				if(nearestColumn){
					colIndex = self.table.columnManager.findColumnIndex(nearestColumn);
					prevColumn = colIndex > 0 ? self.table.columnManager.getColumnByIndex(colIndex - 1) : false;
					
					if(prevColumn && self._checkResizability(prevColumn)){
						e.stopPropagation();
						prevColumn.reinitializeWidth(true);
					}
				}
			});
			
			element.appendChild(handle);
			element.appendChild(prevHandle);
		}
	}
	
	_checkResizability(column){
		return column.definition.resizable;
	}
	
	_mouseDown(e, column, handle){
		var self = this;
		
		self.table.element.classList.add("tabulator-block-select");

		function mouseMove(e){
			// self.table.columnManager.tempScrollBlock();
			
			if(self.table.rtl){
				column.setWidth(self.startWidth - ((typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX) - self.startX));
			}else{
				column.setWidth(self.startWidth + ((typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX) - self.startX));
			}
			
			self.table.columnManager.renderer.rerenderColumns(true);
			
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
				self.dispatch("column-resized", column);
				self.table.externalEvents.dispatch("columnResized", column.getComponent());
			}
		}
		
		e.stopPropagation(); //prevent resize from interfereing with movable columns
		
		//block editor from taking action while resizing is taking place
		if(self.startColumn.modules.edit){
			self.startColumn.modules.edit.blocked = true;
		}
		
		self.startX = typeof e.screenX === "undefined" ? e.touches[0].screenX : e.screenX;
		self.startWidth = column.getWidth();
		
		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
		handle.addEventListener("touchmove", mouseMove, {passive: true});
		handle.addEventListener("touchend", mouseUp);
	}
}

ResizeColumns.moduleName = "resizeColumns";

export default ResizeColumns;