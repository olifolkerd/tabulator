import Renderer from '../Renderer.js';

export default class BasicHorizontal extends Renderer{
	constructor(table){
		super(table);
	}

	renderRowCells(row) {
		const rowFrag = document.createDocumentFragment();
		row.cells.forEach((cell) => {
			rowFrag.appendChild(cell.getElement());
		});
		row.element.appendChild(rowFrag);

		row.cells.forEach((cell) => {
			cell.cellRendered();
		});
	}

	reinitializeColumnWidths(columns){
		columns.forEach(function(column){
			column.reinitializeWidth();
		});
	}
}