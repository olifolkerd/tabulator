import CoreFeature from '../CoreFeature.js';

export default class Renderer extends CoreFeature{
	constructor(table){
		super(table);

		this.element = table.rowManager.element;
		this.tableElement =  table.rowManager.tableElement;

		this.verticalFillMode = "fit"; // used by row manager to determin how to size the render area ("fit" - fits container to the contents, "fill" - fills the contianer without resizing it)
	}

	///////////////////////////////////
	/////// External Triggers /////////
	//////// DO NOT OVERRIDE //////////
	///////////////////////////////////

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

	scrollToRow(row){
		//scroll to specific row
	}

	resize(){
		//container has rezied, carry out any needed recalculations (DO NOT RERENDER IN THIS FUNCTION)
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
}