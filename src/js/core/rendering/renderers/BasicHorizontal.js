import Renderer from '../Renderer.js';

export default class BasicHorizontal extends Renderer{
	constructor(table){
		super(table);
	}

	renderRowCells(row){
		row.cells.forEach((cell) => {
			row.element.appendChild(cell.getElement());
			cell.cellRendered();
		});
	}

	reinitializeColumnWidths(columns){
		columns.forEach(function(column){
			column.reinitializeWidth();
		});
	}
}