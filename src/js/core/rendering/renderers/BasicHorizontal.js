import Renderer from '../Renderer.js';
import Helpers from '../../tools/Helpers.js';

export default class BaiscHorizontal extends Renderer{
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