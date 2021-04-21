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
		element.style.minWidth = "";
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

		var left = this.scrollLeft;

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

		if(callback){
			callback();
		}

		this._virtualRenderFill((topRow === false ? this.rows.length - 1 : topRow), true, topOffset || 0);

		// this.scrollHorizontal(left);
	}

	scrollRows(top, dir){
		var topDiff = top - this.vDomScrollPosTop;
		var bottomDiff = top - this.vDomScrollPosBottom;
		var margin = this.vDomWindowBuffer * 2;
		var rows = this.rows();

		this.scrollTop = top;

		if(-topDiff > margin || bottomDiff > margin){
			//if big scroll redraw table;
			var left = this.scrollLeft;
			this._virtualRenderFill(Math.floor((this.elementVertical.scrollTop / this.elementVertical.scrollHeight) * rows.length));
			// this.scrollHorizontal(left);
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
				//scrolling down
				if(topDiff >= 0){
					//hide top row if needed
					if(this.scrollTop > this.vDomWindowBuffer){

						this._removeTopRow(rows, topDiff);
					}else{
						this.vDomScrollPosTop = this.scrollTop;
					}
				}

				if(bottomDiff >= 0){
					this._addBottomRow(rows, bottomDiff);
				}
			}
		}
	}

	resize(){
		this.vDomWindowBuffer = this.table.options.virtualDomBuffer || this.elementVertical.clientHeight;
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
		topPadHeight = 0,
		i = 0,
		rows = this.rows(),
		rowsCount = rows.length;

		position = position || 0;

		offset = offset || 0;

		if(!position){
			this.clear();
		}else{
			while(element.firstChild) element.removeChild(element.firstChild);

			//check if position is too close to bottom of table
			let heightOccupied  = (rowsCount - position + 1) * this.vDomRowHeight;

			if(heightOccupied  < this.height){
				position -= Math.ceil((this.height - heightOccupied) / this.vDomRowHeight);

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

			while ((rowsHeight <= this.height + this.vDomWindowBuffer || i < this.vDomWindowMinTotalRows) && this.vDomBottom < rowsCount -1){
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

				this.vDomScrollHeight = topPadHeight + rowsHeight + this.vDomBottomPad - this.height;
			}else{
				this.vDomTopPad = !forceMove ? this.scrollTop - topPadHeight : (this.vDomRowHeight * this.vDomTop) + offset;
				this.vDomBottomPad = this.vDomBottom == rowsCount-1 ? 0 : Math.max(this.vDomScrollHeight - this.vDomTopPad - rowsHeight - topPadHeight, 0);
			}

			element.style.paddingTop = this.vDomTopPad + "px";
			element.style.paddingBottom = this.vDomBottomPad + "px";

			if(forceMove){
				this.scrollTop = this.vDomTopPad + (topPadHeight) + offset - (this.elementVertical.scrollWidth > this.elementVertical.clientWidth ? this.elementVertical.offsetHeight - this.elementVertical.clientHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.elementVertical.scrollHeight - this.elementVertical.clientHeight);

			//adjust for horizontal scrollbar if present (and not at top of table)
			if(this.elementVertical.scrollWidth > this.elementVertical.offsetWidth && forceMove){
				this.scrollTop += this.elementVertical.offsetHeight - this.elementVertical.clientHeight;
			}

			this.vDomScrollPosTop = this.scrollTop;
			this.vDomScrollPosBottom = this.scrollTop;

			holder.scrollTop = this.scrollTop;

			this.dispatch("render-virtual-fill");
		}
	}

	_addTopRow(rows, topDiff, i=0){
		var table = this.tableElement;

		if(this.vDomTop){
			let index = this.vDomTop -1,
			topRow = rows[index],
			topRowHeight = topRow.getHeight() || this.vDomRowHeight;

			//hide top row if needed
			if(topDiff >= topRowHeight){
				this.styleRow(topRow, index);
				table.insertBefore(topRow.getElement(), table.firstChild);
				if(!topRow.initialized || !topRow.heightInitialized){
					this.vDomTopNewRows.push(topRow);

					if(!topRow.heightInitialized){
						topRow.clearCellHeight();
					}
				}

				topRow.initialize();

				this.vDomTopPad -= topRowHeight;

				if(this.vDomTopPad < 0){
					this.vDomTopPad = index * this.vDomRowHeight;
				}

				if(!index){
					this.vDomTopPad = 0;
				}

				table.style.paddingTop = this.vDomTopPad + "px";
				this.vDomScrollPosTop -= topRowHeight;
				this.vDomTop--;
			}

			topDiff = -(this.scrollTop - this.vDomScrollPosTop);

			if(topRow.getHeight() > this.vDomWindowBuffer){
				this.vDomWindowBuffer = topRow.getHeight() * 2;
			}

			if(i < this.vDomMaxRenderChain && this.vDomTop && topDiff >= (rows[this.vDomTop -1].getHeight() || this.vDomRowHeight)){
				this._addTopRow(rows, topDiff, i+1);
			}else{
				this._quickNormalizeRowHeight(this.vDomTopNewRows);
			}
		}
	}

	_removeTopRow(rows, topDiff){
		var table = this.tableElement,
		topRow = rows[this.vDomTop],
		topRowHeight = topRow.getHeight() || this.vDomRowHeight;

		if(topDiff >= topRowHeight){

			var rowEl = topRow.getElement();
			rowEl.parentNode.removeChild(rowEl);

			this.vDomTopPad += topRowHeight;
			table.style.paddingTop = this.vDomTopPad + "px";
			this.vDomScrollPosTop += this.vDomTop ? topRowHeight : topRowHeight + this.vDomWindowBuffer;
			this.vDomTop++;

			topDiff = this.scrollTop - this.vDomScrollPosTop;

			this._removeTopRow(rows, topDiff);
		}
	}

	_addBottomRow(rows, bottomDiff, i=0){
		var table = this.tableElement;

		if(this.vDomBottom < rows.length -1){
			let index = this.vDomBottom + 1,
			bottomRow = rows[index],
			bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

			//hide bottom row if needed
			if(bottomDiff >= bottomRowHeight){
				this.styleRow(bottomRow, index);
				table.appendChild(bottomRow.getElement());

				if(!bottomRow.initialized || !bottomRow.heightInitialized){
					this.vDomBottomNewRows.push(bottomRow);

					if(!bottomRow.heightInitialized){
						bottomRow.clearCellHeight();
					}
				}

				bottomRow.initialize();

				this.vDomBottomPad -= bottomRowHeight;

				if(this.vDomBottomPad < 0 || index == rows.length -1){
					this.vDomBottomPad = 0;
				}

				table.style.paddingBottom = this.vDomBottomPad + "px";
				this.vDomScrollPosBottom += bottomRowHeight;
				this.vDomBottom++;
			}

			bottomDiff = this.scrollTop - this.vDomScrollPosBottom;

			if(bottomRow.getHeight() > this.vDomWindowBuffer){
				this.vDomWindowBuffer = bottomRow.getHeight() * 2;
			}

			if(i < this.vDomMaxRenderChain && this.vDomBottom < rows.length -1 && bottomDiff >= (rows[this.vDomBottom + 1].getHeight() || this.vDomRowHeight)){
				this._addBottomRow(rows, bottomDiff, i+1);
			}else{
				this._quickNormalizeRowHeight(this.vDomBottomNewRows);
			}
		}
	}

	_removeBottomRow(rows, bottomDiff){
		var table = this.tableElement,
		bottomRow = rows[this.vDomBottom],
		bottomRowHeight = bottomRow.getHeight() || this.vDomRowHeight;

		if(bottomDiff >= bottomRowHeight){

			var rowEl = bottomRow.getElement();

			if(rowEl.parentNode){
				rowEl.parentNode.removeChild(rowEl);
			}

			this.vDomBottomPad += bottomRowHeight;

			if(this.vDomBottomPad < 0){
				this.vDomBottomPad = 0;
			}

			table.style.paddingBottom = this.vDomBottomPad + "px";
			this.vDomScrollPosBottom -= bottomRowHeight;
			this.vDomBottom--;

			bottomDiff = -(this.scrollTop - this.vDomScrollPosBottom);

			this._removeBottomRow(rows, bottomDiff);
		}
	}

	_quickNormalizeRowHeight(rows){
		rows.forEach(function(row){
			row.calcHeight();
		});

		rows.forEach(function(row){
			row.setCellHeight();
		});

		rows.length = 0;
	}
}