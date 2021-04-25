import Renderer from '../Renderer.js';
import Helpers from '../../tools/Helpers.js';

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

		this.window = 200; //pixel margin to make column visible before it is shown on screen

		this.initialized = false;

		this.columns = [];
	}

	initialize(){
		this.compatabilityCheck();
		console.log("INIT")
	}

	compatabilityCheck(){
		var columns = this.options("columns"),
		frozen = false,
		ok = true;

		if(this.options("layout") == "fitDataTable"){
			console.warn("Horizontal Vitrual DOM is not compatible with fitDataTable layout mode");
			ok = false;
		}

		if(this.options("responsiveLayout")){
			console.warn("Horizontal Vitrual DOM is not compatible with responsive columns");
			ok = false;
		}

		if(this.options("rtl")){
			console.warn("Horizontal Vitrual DOM is not currently compatible with RTL text direction");
			ok = false;
		}

		if(columns){
			frozen = columns.find((col) => {
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

			this.scroll(left - (this.vDomScrollPosLeft + this.window));
		}
	}

	rerenderColumns(update, blockRedraw){
		var old = {
			cols:this.columns,
			leftCol:this.leftCol,
			rightCol:this.rightCol,
		};

		if(update && !this.initialized){
			return;
		}

		this.clear();

		this.scrollLeft = this.elementVertical.scrollLeft;

		this.vDomScrollPosLeft = this.scrollLeft - this.window;
		this.vDomScrollPosRight = this.scrollLeft + this.elementVertical.clientWidth + this.window;

		var colPos = 0;

		this.table.columnManager.columnsByIndex.forEach((column) => {
			var config = {};

			if(column.visible){
				var width = column.getWidth();

				config.leftPos = colPos;
				config.rightPos = colPos + width;

				config.width = width;

				if (this.options("layout") === "fitData") {
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

		this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";
		this.tableElement.style.paddingRight = this.vDomPadRight + "px";

		this.initialized = true;

		if(!blockRedraw){
			if(!update || this.reinitChanged(old)){
				this.renitializeRows();
			}
		}

		this.elementVertical.scrollLeft = this.scrollLeft;
	}

	renderRowCells(row){
		if(this.initialized){
			this.initializeRow(row);
		}else{
			row.cells.forEach((cell) => {
				row.element.appendChild(cell.getElement());
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
		collsWidth = 0,
		colEnd = 0,
		group, row, rowEl;

		if(this.options("layout") === "fitData"){
			this.table.columnManager.columnsByIndex.forEach((column) => {
				if(!column.definition.width && column.visible){
					change = true;
				}
			});

			if(change){
				if(change && this.table.rowManager.getDisplayRows().length){

					this.vDomScrollPosRight = this.scrollLeft + this.elementVertical.clientWidth + this.window;

					var row = this.chain("rows-sample", [1], [], () => {
						return this.table.rowManager.getDisplayRows()[0];
					})[0];

					if(row){

						rowEl = row.getElement();

						row.generateCells();

						this.tableElement.appendChild(rowEl);

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

						this.rerenderColumns(false, true);
					}
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

	renitializeRows(){
		var rows = this.table.rowManager.getVisibleRows();
		rows.forEach((row) => {
			this.reinitializeRow(row, true);
		});
	}

	scroll(diff){
		this.vDomScrollPosLeft += diff;
		this.vDomScrollPosRight += diff;

		if(diff > (this.elementVertical.clientWidth * .8)){
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

			this.tableElement.style.paddingRight = this.vDomPadRight + "px";

			this.addColRight();
		}
	}

	addColLeft(){
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

			this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";

			this.leftCol--;

			this.addColLeft();
		}
	}

	removeColRight(column){
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
			this.tableElement.style.paddingRight = this.vDomPadRight + "px";

			this.rightCol --;

			this.removeColRight();
		}
	}

	removeColLeft(){
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
			this.tableElement.style.paddingLeft = this.vDomPadLeft + "px";

			this.leftCol ++;

			this.removeColLeft();
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
	            this.colPositionAdjust(this.rightCol + 2, this.columns.length, widthDiff);
	        }

	        column.modules.vdomHoz.fitDataCheck = false;
	    }
	};

	initializeRow(row){
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