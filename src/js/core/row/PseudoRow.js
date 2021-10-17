export default class PseudoRow {

	constructor (type){
		this.type = type;
		this.element = this._createElement();
	}

	_createElement(){
		var el = document.createElement("div");
		el.classList.add("tabulator-row");
		return el;
	}

	getElement(){
		return this.element;
	}

	getComponent(){
		return false;
	}

	getData(){
		return {};
	}

	getHeight(){
		return this.element.outerHeight;
	}

	initialize(){}

	reinitialize(){}

	normalizeHeight(){}

	generateCells(){}

	reinitializeHeight(){}

	calcHeight(){}

	setCellHeight(){}

	clearCellHeight(){}
}