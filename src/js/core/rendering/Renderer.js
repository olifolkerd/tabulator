import CoreFeature from '../CoreFeature.js';
import Helpers from '../tools/Helpers.js';

export default class Renderer extends CoreFeature{
	constructor(table){
		super(table);

		this.elementVertical = table.rowManager.element;
		this.elementHorizontal = table.columnManager.element;
		this.tableElement =  table.rowManager.tableElement;

		this.verticalFillMode = "fit"; // used by row manager to determine how to size the render area ("fit" - fits container to the contents, "fill" - fills the container without resizing it)
	}


	///////////////////////////////////
	/////// Internal Bindings /////////
	///////////////////////////////////

	initialize(){
		//initialize core functionality
	}

	clearRows(){
		//clear down existing rows layout
	}

	clearColumns(){
		//clear down existing columns layout
	}


	reinitializeColumnWidths(columns){
		//resize columns to fit data
	}


	renderRows(){
		//render rows from a clean slate
	}

	renderColumns(){
		//render columns from a clean slate
	}

	rerenderRows(callback){
		// rerender rows and keep position
		if(callback){
			callback();
		}
	}

	rerenderColumns(update, blockRedraw){
		//rerender columns
	}

	renderRowCells(row){
		//render the cells in a row
	}

	rerenderRowCells(row, force){
		//rerender the cells in a row
	}

	scrollColumns(left, dir){
		//handle horizontal scrolling
	}

	scrollRows(top, dir){
		//handle vertical scrolling
	}

	resize(){
		//container has resized, carry out any needed recalculations (DO NOT RERENDER IN THIS FUNCTION)
	}

	scrollToRow(row){
		//scroll to a specific row
	}

	scrollToRowNearestTop(row){
		//determine weather the row is nearest the top or bottom of the table, return true for top or false for bottom
	}

	visibleRows(includingBuffer){
		//return the visible rows
		return [];
	}

	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////

	rows(){
		return this.table.rowManager.getDisplayRows();
	}

	styleRow(row, index){
		var rowEl = row.getElement();

		if(index % 2){
			rowEl.classList.add("tabulator-row-even");
			rowEl.classList.remove("tabulator-row-odd");
		}else{
			rowEl.classList.add("tabulator-row-odd");
			rowEl.classList.remove("tabulator-row-even");
		}
	}

	///////////////////////////////////
	/////// External Triggers /////////
	/////// (DO NOT OVERRIDE) /////////
	///////////////////////////////////

	clear(){
		//clear down existing layout
		this.clearRows();
		this.clearColumns();
	}

	render(){
		//render from a clean slate
		this.renderRows();
		this.renderColumns();
	}

	rerender(callback){
		// rerender and keep position
		this.rerenderRows();
		this.rerenderColumns();
	}

	scrollToRowPosition(row, position, ifVisible){
		var rowIndex = this.rows().indexOf(row),
		rowEl = row.getElement(),
		offset = 0;

		return new Promise((resolve, reject) => {
			if(rowIndex > -1){

				if(typeof ifVisible === "undefined"){
					ifVisible = this.table.options.scrollToRowIfVisible;
				}

				//check row visibility
				if(!ifVisible){
					if(Helpers.elVisible(rowEl)){
						offset = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.elementVertical).top;
						
						if(offset > 0 && offset < this.elementVertical.clientHeight - rowEl.offsetHeight){
							resolve();
							return false;
						}
					}
				}

				if(typeof position === "undefined"){
					position = this.table.options.scrollToRowPosition;
				}

				if(position === "nearest"){
					position = this.scrollToRowNearestTop(row) ? "top" : "bottom";
				}

				//scroll to row
				this.scrollToRow(row);

				//align to correct position. After scrollToRow the target row is
				//in the rendered window but NOT necessarily at the top, so derive
				//the alignment from its actual offsetTop rather than assuming the
				//current scrollTop places it at the top.
				switch(position){
					case "middle":
					case "center":
						this.elementVertical.scrollTop = rowEl.offsetTop - (this.elementVertical.clientHeight / 2) + (rowEl.offsetHeight / 2);
						break;

					case "bottom":
						this.elementVertical.scrollTop = rowEl.offsetTop - this.elementVertical.clientHeight + rowEl.offsetHeight;
						break;

					case "top":
						this.elementVertical.scrollTop = rowEl.offsetTop;
						break;
				}

				//keep the virtual renderer's scroll trackers in sync with the
				//manual scrollTop write, so the next user scroll doesn't compute a
				//large diff against a stale tracker and trigger a spurious full
				//re-render/jump. Guarded for the basic renderer, which has no
				//trackers.
				if(this.vDomScrollPosTop !== undefined){
					this.vDomScrollPosTop = this.elementVertical.scrollTop;
					this.vDomScrollPosBottom = this.elementVertical.scrollTop;
				}

				resolve();

			}else{
				console.warn("Scroll Error - Row not visible");
				reject("Scroll Error - Row not visible");
			}
		});
	}
}