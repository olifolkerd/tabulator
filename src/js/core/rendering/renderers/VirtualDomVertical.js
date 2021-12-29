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
		this.vDomBottom = 0; //hold possition for last rendered row in the virtual DOM

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
		// element.style.minWidth = "";
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

		this._virtualRenderFill((topRow === false ? this.rows.length - 1 : topRow), true, topOffset || 0);

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
	_virtualRenderFill(position, forceMove, offset){
		var	element = this.tableElement,
		holder = this.elementVertical,
		topPad = 0,
		rowsHeight = 0,
		heightOccupied = 0,
		topPadHeight = 0,
		i = 0,
		rows = this.rows(),
		rowsCount = rows.length,
		containerHeight = this.elementVertical.clientHeight;

		position = position || 0;

		offset = offset || 0;

		if(!position){
			this.clear();
		}else{
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

			while ((rowsHeight <= containerHeight + this.vDomWindowBuffer || i < this.vDomWindowMinTotalRows) && this.vDomBottom < rowsCount -1){
				var index = this.vDomBottom + 1,
				row = rows[index],
				rowHeight = 0;

				this.styleRow(row, index);

				element.appendChild(row.getElement());

				row.initialize();

				if(!row.heightInitialized){
					row.normalizeHeight(true);
				}

				rowHeight = row.getHeight();

				if(i < topPad){
					topPadHeight += rowHeight;
				}else{
					rowsHeight += rowHeight;
				}

				if(rowHeight > this.vDomWindowBuffer){
					this.vDomWindowBuffer = rowHeight * 2;
				}

				this.vDomBottom ++;
				i++;
			}

			if(!position){
				this.vDomTopPad = 0;
				//adjust rowheight to match average of rendered elements
				this.vDomRowHeight = Math.floor((rowsHeight + topPadHeight) / i);
				this.vDomBottomPad = this.vDomRowHeight * (rowsCount - this.vDomBottom -1);

				this.vDomScrollHeight = topPadHeight + rowsHeight + this.vDomBottomPad - containerHeight;
			}else{
				this.vDomTopPad = !forceMove ? this.scrollTop - topPadHeight : (this.vDomRowHeight * this.vDomTop) + offset;
				this.vDomBottomPad = this.vDomBottom == rowsCount-1 ? 0 : Math.max(this.vDomScrollHeight - this.vDomTopPad - rowsHeight - topPadHeight, 0);
			}

			element.style.paddingTop = this.vDomTopPad + "px";
			element.style.paddingBottom = this.vDomBottomPad + "px";

			if(forceMove){
				this.scrollTop = this.vDomTopPad + (topPadHeight) + offset - (this.elementVertical.scrollWidth > this.elementVertical.clientWidth ? this.elementVertical.offsetHeight - containerHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.elementVertical.scrollHeight - containerHeight);

			//adjust for horizontal scrollbar if present (and not at top of table)
			if(this.elementVertical.scrollWidth > this.elementVertical.offsetWidth && forceMove){
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
		i = 0;

		while(true){
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
						break;
					}

				}else{
					break;
				}

			}else{
				break;
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
		i = 0;

		while(true){
			let row = rows[this.vDomTop],
			rowHeight, diff;

			if(row && i < this.vDomMaxRenderChain){
				rowHeight = row.getHeight() || this.vDomRowHeight;

				if(fillableSpace >= rowHeight){
					this.vDomTop++;

					fillableSpace -= rowHeight;
					paddingAdjust += rowHeight;

					removableRows.push(row);
					i++;
				}else{
					break;
				}
			}else{
				break;
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
		i = 0;

		while(true){
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
					break;
				}
			}else{
				break;
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
		i = 0;

		while(true){
			let row = rows[this.vDomBottom],
			rowHeight, diff;

			if(row && i < this.vDomMaxRenderChain){
				rowHeight = row.getHeight() || this.vDomRowHeight;

				if(fillableSpace >= rowHeight){
					this.vDomBottom --;

					fillableSpace -= rowHeight;
					paddingAdjust += rowHeight;

					removableRows.push(row);
					i++;
				}else{
					break;
				}
			}else{
				break;
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