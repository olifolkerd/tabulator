import CoreFeature from '../CoreFeature.js';

export default class Renderer extends CoreFeature{
	constructor(table, element, tableElement){
		super(table);

		this.element = element;
		this.tableElement = tableElement;
	}

	clear(){
		//clear down existing layout
	}

	render(){
		//render from a clean slate
	}

	rerender(){
		// rerender and keep position
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

	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////

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