import Renderer from '../Renderer.js';
import Helpers from '../../Helpers.js';

export default class VirtualDomVertical extends Renderer{
	constructor(table){
		super(table);

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

		this.rows = []
	}

	clear(){

		var element = this.tableElement;

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.style.paddingTop = "";
		element.style.paddingBottom = "";
		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";

		this.element.scrollTop = 0;
		this.element.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.vDomTop = 0;
		this.vDomBottom = 0;
		this.vDomTopPad = 0;
		this.vDomBottomPad = 0;
	}

	render(rows){
		this.rows = rows;
		this._virtualRenderFill();
	}

	//full virtual render
	_virtualRenderFill(position, forceMove, offset){
		var	element = this.tableElement,
		holder = this.element,
		topPad = 0,
		rowsHeight = 0,
		topPadHeight = 0,
		i = 0,
		onlyGroupHeaders = true,
		rows = this.rows,
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

		if(rowsCount && Helpers.elVisible(this.element)){
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

				if(row.type !== "group"){
					onlyGroupHeaders = false;
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
				this.scrollTop = this.vDomTopPad + (topPadHeight) + offset - (this.element.scrollWidth > this.element.clientWidth ? this.element.offsetHeight - this.element.clientHeight : 0);
			}

			this.scrollTop = Math.min(this.scrollTop, this.element.scrollHeight - this.height);

			//adjust for horizontal scrollbar if present (and not at top of table)
			if(this.element.scrollWidth > this.element.offsetWidth && forceMove){
				this.scrollTop += this.element.offsetHeight - this.element.clientHeight;
			}

			this.vDomScrollPosTop = this.scrollTop;
			this.vDomScrollPosBottom = this.scrollTop;

			holder.scrollTop = this.scrollTop;

			element.style.minWidth = onlyGroupHeaders ? this.table.columnManager.getWidth() + "px" : "";

			if(this.table.options.groupBy){
				if(this.table.modules.layout.getMode() != "fitDataFill" && rowsCount == this.table.modules.groupRows.countGroups()){
					this.tableElement.style.minWidth = this.table.columnManager.getWidth();
				}
			}
		}
	}
}