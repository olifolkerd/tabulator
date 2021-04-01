import Renderer from '../Renderer.js';
import Renderer from '../Renderer.js';

export default class Classic extends Renderer{
	constructor(table, element, tableElement){
		super(table, element, tableElement);

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;

	}

	clear(){
		var element = this.tableElement;

		// element.children.detach();
		while(element.firstChild) element.removeChild(element.firstChild);

		element.scrollTop = 0;
		element.scrollLeft = 0;

		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";
	}

	render(rows){
		var element = this.tableElement,
		onlyGroupHeaders = true;

		rows.forEach((row, index) => {
			this.styleRow(row, index);
			element.appendChild(row.getElement());
			row.initialize(true);

			if(row.type !== "group"){
				onlyGroupHeaders = false;
			}
		});

		if(onlyGroupHeaders){
			element.style.minWidth = this.table.columnManager.getWidth() + "px";
		}else{
			element.style.minWidth = "";
		}
	}


	rerender(rows){
		this.render(rows);
	}

	scrollToRow(row){

	}

}