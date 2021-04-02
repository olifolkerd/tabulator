import CoreFeature from '../CoreFeature.js';
import Helpers from '../Helpers.js';

export default class Renderer extends CoreFeature{
	constructor(table){
		super(table);

		this.elementVertical = table.rowManager.element;
		this.tableElement =  table.rowManager.tableElement;

		this.verticalFillMode = "fit"; // used by row manager to determin how to size the render area ("fit" - fits container to the contents, "fill" - fills the contianer without resizing it)
	}


	///////////////////////////////////
	/////// Internal Bindings /////////
	///////////////////////////////////


	clear(){
		//clear down existing layout
	}

	render(){
		//render from a clean slate
	}

	rerender(callback){
		// rerender and keep position
		if(callback){
			callback();
		}
	}

	scrollHorizontal(left, dir){
		//handle horizontal scrolling
	}

	scrollVertical(top, dir){
		//handle vertical scolling
	}

	resize(){
		//container has rezied, carry out any needed recalculations (DO NOT RERENDER IN THIS FUNCTION)
	}

	scrollToRow(row){
		//scroll to a specific row
	}

	scrollToRowNearestTop(row){
		//determin weather the row is nearest the top or bottom of the table, retur true for top or false for bottom
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

	scrollToRowPosition(row, position, ifVisible){
		var rowIndex = this.rows().indexOf(row),
		rowEl = row.getElement(),
		offset = 0;

		return new Promise((resolve, reject) => {
			if(rowIndex > -1){

				if(typeof ifVisible === "undefined"){
					ifVisible = this.table.options.scrollToRowIfVisible;
				}

				console.log("if vis", ifVisible)

				//check row visibility
				if(!ifVisible){
					if(Helpers.elVisible(rowEl)){
						offset = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.elementVertical).top;

						if(offset > 0 && offset < this.elementVertical.clientHeight - rowEl.offsetHeight){
							return false;
						}
					}
				}

				if(typeof position === "undefined"){
					position = this.table.options.scrollToRowPosition;
				}

				if(position === "nearest"){
					position = this.scrollToRowNearestTop(row) ? "top" : "bottom"
				}

				//scroll to row
				this.scrollToRow(row);

				//align to correct position
				switch(position){
					case "middle":
					case "center":

					if(this.elementVertical.scrollHeight - this.elementVertical.scrollTop == this.elementVertical.clientHeight){
						this.elementVertical.scrollTop = this.elementVertical.scrollTop + (rowEl.offsetTop - this.elementVertical.scrollTop) - ((this.elementVertical.scrollHeight - rowEl.offsetTop) / 2);
					}else{
						this.elementVertical.scrollTop = this.elementVertical.scrollTop - (this.elementVertical.clientHeight / 2);
					}

					break;

					case "bottom":

					if(this.elementVertical.scrollHeight - this.elementVertical.scrollTop == this.elementVertical.clientHeight){
						this.elementVertical.scrollTop = this.elementVertical.scrollTop - (this.elementVertical.scrollHeight - rowEl.offsetTop) + rowEl.offsetHeight;
					}else{
						this.elementVertical.scrollTop = this.elementVertical.scrollTop - this.elementVertical.clientHeight + rowEl.offsetHeight;
					}

					break;
				}

				resolve();

			}else{
				console.warn("Scroll Error - Row not visible");
				reject("Scroll Error - Row not visible");
			}
		});
	}
}