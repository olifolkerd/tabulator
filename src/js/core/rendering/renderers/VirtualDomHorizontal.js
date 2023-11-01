import Renderer from '../Renderer.js';

export default class VirtualDomHorizontal extends Renderer{
	constructor(table){
		super(table);
		
		this.leftCol = 0;
		this.rightCol = 0;
		this.scrollLeft = 0;
		
		this.vDomScrollPosLeft = 0;
		this.vDomScrollPosRight = 0;
		
		this.vDomPadLeft = 0;
		this.vDomPadRight = 0;
		
		this.fitDataColAvg = 0;
		
		this.windowBuffer = 200; //pixel margin to make column visible before it is shown on screen
		
		this.visibleRows = null;
		
		this.initialized = false;
		this.isFitData = false;
		
		this.columns = [];
	}
	
	initialize(){
		this.compatibilityCheck();
		this.layoutCheck();
		this.vertScrollListen();
	}
	
	compatibilityCheck(){		
		if(this.options("layout") == "fitDataTable"){
			console.warn("Horizontal Virtual DOM is not compatible with fitDataTable layout mode");
		}
		
		if(this.options("responsiveLayout")){
			console.warn("Horizontal Virtual DOM is not compatible with responsive columns");
		}
		
		if(this.options("rtl")){
			console.warn("Horizontal Virtual DOM is not currently compatible with RTL text direction");
		}
	}
	
	layoutCheck(){
		this.isFitData = this.options("layout").startsWith('fitData');
	}
	
	vertScrollListen(){
		this.subscribe("scroll-vertical", this.clearVisRowCache.bind(this));
		this.subscribe("data-refreshed", this.clearVisRowCache.bind(this));
	}
	
	clearVisRowCache(){
		this.visibleRows = null;
	}
	
	//////////////////////////////////////
	///////// Public Functions ///////////
	//////////////////////////////////////
	
	renderColumns(row, force){
		this.dataChange();
	}
	
	
	scrollColumns(left, dir){
		if(this.scrollLeft != left){
			this.scrollLeft = left;
			
			this.scroll(left - (this.vDomScrollPosLeft + this.windowBuffer));
		}
	}
	
	calcWindowBuffer(){
		var buffer = this.elementVertical.clientWidth;
		
		this.table.columnManager.columnsByIndex.forEach((column) => {
			if(column.visible){
				var width = column.getWidth();
				
				if(width > buffer){
					buffer = width;
				}
			}
		});
		
		this.windowBuffer = buffer * 2;
	}
	
	rerenderColumns(update, blockRedraw){		
		var old = {
			cols:this.columns,
			leftCol:this.leftCol,
			rightCol:this.rightCol,
		},
		colPos = 0;
		
		if(update && !this.initialized){
			return;
		}
		
		this.clear();
		
		this.calcWindowBuffer();
		
		this.scrollLeft = this.elementVertical.scrollLeft;
		
		this.vDomScrollPosLeft = this.scrollLeft - this.windowBuffer;
		this.vDomScrollPosRight = this.scrollLeft + this.elementVertical.clientWidth + this.windowBuffer;
		
		this.table.columnManager.columnsByIndex.forEach((column) => {
			var config = {},
			width;
			
			if(column.visible){
				if(!column.modules.frozen){			
					width = column.getWidth();

					config.leftPos = colPos;
					config.rightPos = colPos + width;
					
					config.width = width;
					
					if (this.isFitData) {
						config.fitDataCheck = column.modules.vdomHoz ? column.modules.vdomHoz.fitDataCheck : true;
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
			}
		});
		
		this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";
		this.tableElement.style.paddingRight = this.vDomPadRight + "px";
		
		this.initialized = true;
		
		if(!blockRedraw){
			if(!update || this.reinitChanged(old)){
				this.reinitializeRows();
			}
		}
		
		this.elementVertical.scrollLeft = this.scrollLeft;
	}
	
	renderRowCells(row){
		if(this.initialized){
			this.initializeRow(row);
		}else{
			const rowFrag = document.createDocumentFragment();
			row.cells.forEach((cell) => {
				rowFrag.appendChild(cell.getElement());
			});
			row.element.appendChild(rowFrag);

			row.cells.forEach((cell) => {
				cell.cellRendered();
			});
		}
	}
	
	rerenderRowCells(row, force){
		this.reinitializeRow(row, force);
	}
	
	reinitializeColumnWidths(columns){
		for(let i = this.leftCol; i <= this.rightCol; i++){
			this.columns[i].reinitializeWidth();
		}
	}
	
	//////////////////////////////////////
	//////// Internal Rendering //////////
	//////////////////////////////////////
	
	deinitialize(){
		this.initialized = false;
	}
	
	clear(){
		this.columns = [];
		
		this.leftCol = -1;
		this.rightCol = 0;
		
		this.vDomScrollPosLeft = 0;
		this.vDomScrollPosRight = 0;
		this.vDomPadLeft = 0;
		this.vDomPadRight = 0;
	}
	
	dataChange(){
		var change = false,
		row, rowEl;
		
		if(this.isFitData){
			this.table.columnManager.columnsByIndex.forEach((column) => {
				if(!column.definition.width && column.visible){
					change = true;
				}
			});
			
			if(change && this.table.rowManager.getDisplayRows().length){
				this.vDomScrollPosRight = this.scrollLeft + this.elementVertical.clientWidth + this.windowBuffer;
				
				row = this.chain("rows-sample", [1], [], () => {
					return this.table.rowManager.getDisplayRows();
				})[0];
				
				if(row){
					rowEl = row.getElement();
					
					row.generateCells();
					
					this.tableElement.appendChild(rowEl);
					
					for(let colEnd = 0; colEnd < row.cells.length; colEnd++){
						let cell = row.cells[colEnd];
						rowEl.appendChild(cell.getElement());
						
						cell.column.reinitializeWidth();
					}
					
					rowEl.parentNode.removeChild(rowEl);
					
					this.rerenderColumns(false, true);
				}
			}
		}else{
			if(this.options("layout") === "fitColumns"){
				this.layoutRefresh();
				this.rerenderColumns(false, true);
			}
		}
	}
	
	reinitChanged(old){
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
	}
	
	reinitializeRows(){
		var visibleRows = this.getVisibleRows(),
		otherRows = this.table.rowManager.getRows().filter(row => !visibleRows.includes(row));

		visibleRows.forEach((row) => {
			this.reinitializeRow(row, true);
		});

		otherRows.forEach((row) =>{
			row.deinitialize();
		});
	}
	
	getVisibleRows(){
		if (!this.visibleRows){
			this.visibleRows = this.table.rowManager.getVisibleRows();
		}
		
		return this.visibleRows;	
	}
	
	scroll(diff){
		this.vDomScrollPosLeft += diff;
		this.vDomScrollPosRight += diff;
		
		if(Math.abs(diff) > (this.windowBuffer / 2)){
			this.rerenderColumns();
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
	}
	
	colPositionAdjust (start, end, diff){
		for(let i = start; i < end; i++){
			let column = this.columns[i];
			
			column.modules.vdomHoz.leftPos += diff;
			column.modules.vdomHoz.rightPos += diff;
		}
	}
	
	addColRight(){
		var changes = false,
		working = true;
		
		while(working){

			let column = this.columns[this.rightCol + 1];
			
			if(column){
				if(column.modules.vdomHoz.leftPos <= this.vDomScrollPosRight){
					changes = true;
					
					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							var cell = row.getCell(column);
							row.getElement().insertBefore(cell.getElement(), row.getCell(this.columns[this.rightCol]).getElement().nextSibling);
							cell.cellRendered();
						}
					});
					
					this.fitDataColActualWidthCheck(column);
					
					this.rightCol++; // Don't move this below the >= check below

					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							row.modules.vdomHoz.rightCol = this.rightCol;
						}
					});
					
					if(this.rightCol >= (this.columns.length - 1)){
						this.vDomPadRight = 0;
					}else{
						this.vDomPadRight -= column.getWidth();
					}	
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}
		
		if(changes){
			this.tableElement.style.paddingRight = this.vDomPadRight + "px";
		}
	}
	
	addColLeft(){
		var changes = false,
		working = true;
		
		while(working){
			let column = this.columns[this.leftCol - 1];
			
			if(column){
				if(column.modules.vdomHoz.rightPos >= this.vDomScrollPosLeft){
					changes = true;
					
					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							var cell = row.getCell(column);
							row.getElement().insertBefore(cell.getElement(), row.getCell(this.columns[this.leftCol]).getElement());
							cell.cellRendered();
						}
					});
					
					this.leftCol--; // don't move this below the <= check below

					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							row.modules.vdomHoz.leftCol = this.leftCol;
						}
					});
					
					if(this.leftCol <= 0){ // replicating logic in addColRight
						this.vDomPadLeft = 0;
					}else{
						this.vDomPadLeft -= column.getWidth();
					}
					
					let diff = this.fitDataColActualWidthCheck(column);
					
					if(diff){
						this.scrollLeft = this.elementVertical.scrollLeft = this.elementVertical.scrollLeft + diff;
						this.vDomPadRight -= diff;
					}
					
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}
		
		if(changes){
			this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";
		}
	}
	
	removeColRight(){
		var changes = false,
		working = true;
		
		while(working){
			let column = this.columns[this.rightCol];
			
			if(column){
				if(column.modules.vdomHoz.leftPos > this.vDomScrollPosRight){
					changes = true;
					
					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							var cell = row.getCell(column);
							
							try {
								row.getElement().removeChild(cell.getElement());
							} catch (ex) {
								console.warn("Could not removeColRight", ex.message);
							}
						}
					});
					
					this.vDomPadRight += column.getWidth();
					this.rightCol --;

					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							row.modules.vdomHoz.rightCol = this.rightCol;
						}
					});
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}
		
		if(changes){
			this.tableElement.style.paddingRight = this.vDomPadRight + "px";
		}
	}
	
	removeColLeft(){
		var changes = false,
		working = true;

		while(working){
			let column = this.columns[this.leftCol];
			
			if(column){
				if(column.modules.vdomHoz.rightPos < this.vDomScrollPosLeft){
					changes = true;
					
					this.getVisibleRows().forEach((row) => {					
						if(row.type !== "group"){
							var cell = row.getCell(column);
							
							try {
								row.getElement().removeChild(cell.getElement());
							} catch (ex) {
								console.warn("Could not removeColLeft", ex.message);
							}
						}
					});
					
					this.vDomPadLeft += column.getWidth();
					this.leftCol ++;

					this.getVisibleRows().forEach((row) => {
						if(row.type !== "group"){
							row.modules.vdomHoz.leftCol = this.leftCol;
						}
					});
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}
		
		if(changes){
			this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";
		}
	}
	
	fitDataColActualWidthCheck(column){
		var newWidth, widthDiff;
		
		if(column.modules.vdomHoz.fitDataCheck){
			column.reinitializeWidth();
			
			newWidth = column.getWidth();
			widthDiff = newWidth - column.modules.vdomHoz.width;
			
			if(widthDiff){
				column.modules.vdomHoz.rightPos += widthDiff;
				column.modules.vdomHoz.width = newWidth;
				this.colPositionAdjust(this.columns.indexOf(column) + 1, this.columns.length, widthDiff);
			}
			
			column.modules.vdomHoz.fitDataCheck = false;
		}
		
		return widthDiff;
	}
	
	initializeRow(row){
		if(row.type !== "group"){
			row.modules.vdomHoz = {
				leftCol:this.leftCol,
				rightCol:this.rightCol,
			};

			if(this.table.modules.frozenColumns){
				this.table.modules.frozenColumns.leftColumns.forEach((column) => {
					this.appendCell(row, column);
				});
			}

			for(let i = this.leftCol; i <= this.rightCol; i++){
				this.appendCell(row, this.columns[i]);
			}

			if(this.table.modules.frozenColumns){
				this.table.modules.frozenColumns.rightColumns.forEach((column) => {
					this.appendCell(row, column);
				});
			}
		}
	}
	
	appendCell(row, column){
		if(column && column.visible){
			let cell = row.getCell(column);
			
			row.getElement().appendChild(cell.getElement());
			cell.cellRendered();
		}
	}
	
	reinitializeRow(row, force){
		if(row.type !== "group"){
			if(force || !row.modules.vdomHoz || row.modules.vdomHoz.leftCol !== this.leftCol || row.modules.vdomHoz.rightCol !== this.rightCol){
				
				var rowEl = row.getElement();
				while(rowEl.firstChild) rowEl.removeChild(rowEl.firstChild);

				this.initializeRow(row);
			}
		}
	}
}
