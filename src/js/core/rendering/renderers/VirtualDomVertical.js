import Renderer from '../Renderer.js';
import Helpers from '../../tools/Helpers.js';

export default class VirtualDomVertical extends Renderer{
	constructor(table){
		super(table);

		this.verticalFillMode = "fill";

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomRowHeight = 20; //approximation of row heights for padding

		this.vDomTop = 0; //hold position for first rendered row in the virtual DOM
		this.vDomBottom = 0; //hold position for last rendered row in the virtual DOM

		this.vDomScrollPosTop = 0; //last scroll position of the vDom top;
		this.vDomScrollPosBottom = 0; //last scroll position of the vDom bottom;

		this.vDomTopPad = 0; //hold value of padding for top of virtual DOM
		this.vDomBottomPad = 0; //hold value of padding for bottom of virtual DOM

		this.vDomMaxRenderChain = 90; //the maximum number of dom elements that can be rendered in 1 go

		this.vDomWindowBuffer = 0; //window row buffer before removing elements, to smooth scrolling

		this.vDomWindowMinTotalRows = 20; //minimum number of rows to be generated in virtual dom (prevent buffering issues on tables with tall rows)
		this.vDomWindowMinMarginRows = 5; //minimum number of rows to be generated in virtual dom margin

		this.vDomTopNewRows = []; //rows to normalize after appending to optimize render speed
		this.vDomBottomNewRows = []; //rows to normalize after appending to optimize render speed
	}

	//////////////////////////////////////
	///////// Public Functions ///////////
	//////////////////////////////////////

	clearRows(){
		var element = this.tableElement;

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.style.paddingTop = "";
		element.style.paddingBottom = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";

		this.elementVertical.scrollTop = 0;
		this.elementVertical.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomTop = 0;
		this.vDomBottom = 0;
		this.vDomTopPad = 0;
		this.vDomBottomPad = 0;
		this.vDomScrollPosTop = 0;
		this.vDomScrollPosBottom = 0;
	}

	renderRows(){
		this._virtualRenderFill();
	}

	rerenderRows(callback){
		var scrollTop = this.elementVertical.scrollTop;
		var topRow = false;
		var topOffset = false;

		var left = this.table.rowManager.scrollLeft;

		var rows = this.rows();

		for(var i = this.vDomTop; i <= this.vDomBottom; i++){

			if(rows[i]){
				var diff = scrollTop - rows[i].getElement().offsetTop;

				if(topOffset === false || Math.abs(diff) < topOffset){
					topOffset = diff;
					topRow = i;
				}else{
					break;
				}
			}
		}

		rows.forEach((row) => {
			row.deinitializeHeight();
		});

		if(callback){
			callback();
		}

		if(this.rows().length){
			this._virtualRenderFill((topRow === false ? this.rows.length - 1 : topRow), true, topOffset || 0);
		}else{
			this.clear();
			this.table.rowManager.tableEmpty();
		}

		this.scrollColumns(left);
	}

	scrollColumns(left){
		this.table.rowManager.scrollHorizontal(left);
	}

	scrollRows(top, dir){
		var topDiff = top - this.vDomScrollPosTop;
		var bottomDiff = top - this.vDomScrollPosBottom;
		var margin = this.vDomWindowBuffer * 2;
		var rows = this.rows();

		this.scrollTop = top;

		if(-topDiff > margin || bottomDiff > margin){
			//if big scroll redraw table;
			var left = this.table.rowManager.scrollLeft;
			this._virtualRenderFill(Math.floor((this.elementVertical.scrollTop / this.elementVertical.scrollHeight) * rows.length));
			this.scrollColumns(left);
		}else{

			if(dir){
				//scrolling up
				if(topDiff < 0){
					this._addTopRow(rows, -topDiff);
				}

				if(bottomDiff < 0){
					//hide bottom row if needed
					if(this.vDomScrollHeight - this.scrollTop > this.vDomWindowBuffer){
						this._removeBottomRow(rows, -bottomDiff);
					}else{
						this.vDomScrollPosBottom = this.scrollTop;
					}
				}
			}else{

				if(bottomDiff >= 0){
					this._addBottomRow(rows, bottomDiff);
				}

				//scrolling down
				if(topDiff >= 0){
					//hide top row if needed
					if(this.scrollTop > this.vDomWindowBuffer){
						this._removeTopRow(rows, topDiff);
					}else{
						this.vDomScrollPosTop = this.scrollTop;
					}
				}
			}
		}
	}

	resize(){
		this.vDomWindowBuffer = this.table.options.renderVerticalBuffer || this.elementVertical.clientHeight;
	}

	scrollToRowNearestTop(row){
		var rowIndex = this.rows().indexOf(row);

		return !(Math.abs(this.vDomTop - rowIndex) > Math.abs(this.vDomBottom - rowIndex));
	}

	scrollToRow(row){
		var index = this.rows().indexOf(row);

		if(index > -1){
			this._virtualRenderFill(index, true);
		}
	}

	visibleRows(includingBuffer){
		var topEdge = this.elementVertical.scrollTop,
		bottomEdge = this.elementVertical.clientHeight + topEdge,
		topFound = false,
		topRow = 0,
		bottomRow = 0,
		rows = this.rows();

		if(includingBuffer){
			topRow = this.vDomTop;
			bottomRow = this.vDomBottom;
		}else{
			for(var i = this.vDomTop; i <= this.vDomBottom; i++){
				if(rows[i]){
					if(!topFound){
						if((topEdge - rows[i].getElement().offsetTop) >= 0){
							topRow = i;
						}else{
							topFound = true;

							if(bottomEdge - rows[i].getElement().offsetTop >= 0){
								bottomRow = i;
							}else{
								break;
							}
						}
					}else{
						if(bottomEdge - rows[i].getElement().offsetTop >= 0){
							bottomRow = i;
						}else{
							break;
						}
					}
				}
			}
		}

		return rows.slice(topRow, bottomRow + 1);
	}

	//////////////////////////////////////
	//////// Internal Rendering //////////
	//////////////////////////////////////

	//full virtual render
	_virtualRenderFill(position, forceMove, offset) {
		var	element = this.tableElement,
		holder = this.elementVertical,
		topPad = 0,
		rowsHeight = 0,
		rowHeight = 0,
		heightOccupied = 0,
		topPadHeight = 0,
		i = 0,
		rows = this.rows(),
		rowsCount = rows.length,
		index = 0,
		row,
		rowFragment,
		renderedRows = [],
		totalRowsRendered = 0,
		rowsToRender = 0,
		fixedHeight = this.table.rowManager.fixedHeight,
		containerHeight = this.elementVertical.clientHeight, 
		avgRowHeight = this.table.options.rowHeight, 
		resized = true;

		position = position || 0;

		offset = offset || 0;

		if(!position){
			this.clear();
		}else {
			while(element.firstChild) element.removeChild(element.firstChild);

			//check if position is too close to bottom of table
			heightOccupied = (rowsCount - position + 1) * this.vDomRowHeight;

			if(heightOccupied < containerHeight){
				position -= Math.ceil((containerHeight - heightOccupied) / this.vDomRowHeight);
				if(position < 0){
					position = 0;
				}
			}

			//calculate initial pad
			topPad = Math.min(Math.max(Math.floor(this.vDomWindowBuffer / this.vDomRowHeight),  this.vDomWindowMinMarginRows), position);
			position -= topPad;
		}

		if(rowsCount && Helpers.elVisible(this.elementVertical)){
			this.vDomTop = position;
			this.vDomBottom = position -1;

			if(fixedHeight || this.table.options.maxHeight) {
				if(avgRowHeight) {
					rowsToRender = (containerHeight / avgRowHeight) + (this.vDomWindowBuffer / avgRowHeight);
				}
				rowsToRender = Math.max(this.vDomWindowMinTotalRows, Math.ceil(rowsToRender));
			}
			else {
				rowsToRender = rowsCount;
			}

			while(((rowsToRender == rowsCount || rowsHeight <= containerHeight + this.vDomWindowBuffer) || totalRowsRendered < this.vDomWindowMinTotalRows) && this.vDomBottom < rowsCount -1) {
				renderedRows = [];
				rowFragment = document.createDocumentFragment();

				i = 0;

				while ((i < rowsToRender) && this.vDomBottom < rowsCount -1) {	
					index = this.vDomBottom + 1,
					row = rows[index];

					this.styleRow(row, index);

					row.initialize(false, true);
					if(!row.heightInitialized && !this.table.options.rowHeight){
						row.clearCellHeight();
					}

					rowFragment.appendChild(row.getElement());
					renderedRows.push(row);
					this.vDomBottom ++;
					i++;
				}

				if(!renderedRows.length){
					break;
				}

				element.appendChild(rowFragment);
				
				// NOTE: The next 3 loops are separate on purpose
				// This is to batch up the dom writes and reads which drastically improves performance 

				renderedRows.forEach((row) => {
					row.rendered();

					if(!row.heightInitialized) {
						row.calcHeight(true);
					}
				});

				renderedRows.forEach((row) => {
					if(!row.heightInitialized) {
						row.setCellHeight();
					}
				});

				renderedRows.forEach((row) => {
					rowHeight = row.getHeight();
					
					if(totalRowsRendered < topPad){
						topPadHeight += rowHeight;
					}else {
						rowsHeight += rowHeight;
					}

					if(rowHeight > this.vDomWindowBuffer){
						this.vDomWindowBuffer = rowHeight * 2;
					}
					totalRowsRendered++;
				});

				resized = this.table.rowManager.adjustTableSize();
				containerHeight = this.elementVertical.clientHeight;
				if(resized && (fixedHeight || this.table.options.maxHeight))
				{
					avgRowHeight = rowsHeight / totalRowsRendered;
					rowsToRender = Math.max(this.vDomWindowMinTotalRows, Math.ceil((containerHeight / avgRowHeight) + (this.vDomWindowBuffer / avgRowHeight)));
				}
			}

			if(!position){
				this.vDomTopPad = 0;
				//adjust row height to match average of rendered elements
				this.vDomRowHeight = Math.floor((rowsHeight + topPadHeight) / totalRowsRendered);
				this.vDomBottomPad = this.vDomRowHeight * (rowsCount - this.vDomBottom -1);

				this.vDomScrollHeight = topPadHeight + rowsHeight + this.vDomBottomPad - containerHeight;
			}else {
				this.vDomTopPad = !forceMove ? this.scrollTop - topPadHeight : (this.vDomRowHeight * this.vDomTop) + offset;
				this.vDomBottomPad = this.vDomBottom == rowsCount-1 ? 0 : Math.max(this.vDomScrollHeight - this.vDomTopPad - rowsHeight - topPadHeight, 0);
			}
			
			element.style.paddingTop = this.vDomTopPad+"px";
			element.style.paddingBottom = this.vDomBottomPad+"px";

			if(forceMove){
				this.scrollTop = this.vDomTopPad + (topPadHeight) + offset - (this.elementVertical.scrollWidth > this.elementVertical.clientWidth ? this.elementVertical.offsetHeight - containerHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.elementVertical.scrollHeight - containerHeight);

			//adjust for horizontal scrollbar if present (and not at top of table)
			if(this.elementVertical.scrollWidth > this.elementVertical.clientWidth && forceMove){
				this.scrollTop += this.elementVertical.offsetHeight - containerHeight;
			}

			this.vDomScrollPosTop = this.scrollTop;
			this.vDomScrollPosBottom = this.scrollTop;

			holder.scrollTop = this.scrollTop;

			this.dispatch("render-virtual-fill");
		}
	}

	_addTopRow(rows, fillableSpace){
		var table = this.tableElement,
		addedRows = [],
		paddingAdjust = 0,
		index = this.vDomTop -1,
		i = 0,
		working = true;

		while(working){
			if(this.vDomTop){
				let row = rows[index],
				rowHeight, initialized;

				if(row && i < this.vDomMaxRenderChain){
					rowHeight = row.getHeight() || this.vDomRowHeight;
					initialized = row.initialized;

					if(fillableSpace >= rowHeight){

						this.styleRow(row, index);
						table.insertBefore(row.getElement(), table.firstChild);

						if(!row.initialized || !row.heightInitialized){
							addedRows.push(row);
						}

						row.initialize();

						if(!initialized){
							rowHeight = row.getElement().offsetHeight;

							if(rowHeight > this.vDomWindowBuffer){
								this.vDomWindowBuffer = rowHeight * 2;
							}
						}

						fillableSpace -= rowHeight;
						paddingAdjust += rowHeight;

						this.vDomTop--;
						index--;
						i++;

					}else{
						working = false;
					}

				}else{
					working = false;
				}

			}else{
				working = false;
			}
		}

		for (let row of addedRows){
			row.clearCellHeight();
		}

		this._quickNormalizeRowHeight(addedRows);

		if(paddingAdjust){
			this.vDomTopPad -= paddingAdjust;

			if(this.vDomTopPad < 0){
				this.vDomTopPad = index * this.vDomRowHeight;
			}

			if(index < 1){
				this.vDomTopPad = 0;
			}

			table.style.paddingTop = this.vDomTopPad + "px";
			this.vDomScrollPosTop -= paddingAdjust;
		}
	}

	_removeTopRow(rows, fillableSpace){
		var removableRows = [],
		paddingAdjust = 0,
		i = 0,
		working = true;

		while(working){
			let row = rows[this.vDomTop],
			rowHeight;

			if(row && i < this.vDomMaxRenderChain){
				rowHeight = row.getHeight() || this.vDomRowHeight;

				if(fillableSpace >= rowHeight){
					this.vDomTop++;

					fillableSpace -= rowHeight;
					paddingAdjust += rowHeight;

					removableRows.push(row);
					i++;
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}

		for (let row of removableRows){
			let rowEl = row.getElement();

			if(rowEl.parentNode){
				rowEl.parentNode.removeChild(rowEl);
			}
		}

		if(paddingAdjust){
			this.vDomTopPad += paddingAdjust;
			this.tableElement.style.paddingTop = this.vDomTopPad + "px";
			this.vDomScrollPosTop += this.vDomTop ? paddingAdjust : paddingAdjust + this.vDomWindowBuffer;
		}
	}

	_addBottomRow(rows, fillableSpace){
		var table = this.tableElement,
		addedRows = [],
		paddingAdjust = 0,
		index = this.vDomBottom + 1,
		i = 0,
		working = true;

		while(working){
			let row = rows[index],
			rowHeight, initialized;

			if(row && i < this.vDomMaxRenderChain){
				rowHeight = row.getHeight() || this.vDomRowHeight;
				initialized = row.initialized;

				if(fillableSpace >= rowHeight){

					this.styleRow(row, index);
					table.appendChild(row.getElement());

					if(!row.initialized || !row.heightInitialized){
						addedRows.push(row);
					}

					row.initialize();

					if(!initialized){
						rowHeight = row.getElement().offsetHeight;

						if(rowHeight > this.vDomWindowBuffer){
							this.vDomWindowBuffer = rowHeight * 2;
						}
					}

					fillableSpace -= rowHeight;
					paddingAdjust += rowHeight;

					this.vDomBottom++;
					index++;
					i++;
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}

		for (let row of addedRows){
			row.clearCellHeight();
		}

		this._quickNormalizeRowHeight(addedRows);

		if(paddingAdjust){
			this.vDomBottomPad -= paddingAdjust;

			if(this.vDomBottomPad < 0 || index == rows.length -1){
				this.vDomBottomPad = 0;
			}

			table.style.paddingBottom = this.vDomBottomPad + "px";
			this.vDomScrollPosBottom += paddingAdjust;
		}
	}

	_removeBottomRow(rows, fillableSpace){
		var removableRows = [],
		paddingAdjust = 0,
		i = 0,
		working = true;

		while(working){
			let row = rows[this.vDomBottom],
			rowHeight;

			if(row && i < this.vDomMaxRenderChain){
				rowHeight = row.getHeight() || this.vDomRowHeight;

				if(fillableSpace >= rowHeight){
					this.vDomBottom --;

					fillableSpace -= rowHeight;
					paddingAdjust += rowHeight;

					removableRows.push(row);
					i++;
				}else{
					working = false;
				}
			}else{
				working = false;
			}
		}

		for (let row of removableRows){
			let rowEl = row.getElement();

			if(rowEl.parentNode){
				rowEl.parentNode.removeChild(rowEl);
			}
		}

		if(paddingAdjust){
			this.vDomBottomPad += paddingAdjust;

			if(this.vDomBottomPad < 0){
				this.vDomBottomPad = 0;
			}

			this.tableElement.style.paddingBottom = this.vDomBottomPad + "px";
			this.vDomScrollPosBottom -= paddingAdjust;
		}
	}

	_quickNormalizeRowHeight(rows){
		for(let row of rows){
			row.calcHeight();
		}

		for(let row of rows){
			row.setCellHeight();
		}
	}
}
