import CoreFeature from './CoreFeature.js';
import Column from './column/Column.js';
import ColumnComponent from './column/ColumnComponent.js';
import Helpers from './tools/Helpers.js';
import OptionsList from './tools/OptionsList.js';

import RendererBasicHorizontal from './rendering/renderers/BasicHorizontal.js';
import RendererVirtualDomHorizontal from './rendering/renderers/VirtualDomHorizontal.js';

import defaultColumnOptions from './column/defaults/options.js';

export default class ColumnManager extends CoreFeature {

	constructor (table){
		super(table);

		this.blockHozScrollEvent = false;
		this.headersElement = null;
		this.element = null ; //containing element
		this.columns = []; // column definition object
		this.columnsByIndex = []; //columns by index
		this.columnsByField = {}; //columns by field
		this.scrollLeft = 0;
		this.optionsList = new OptionsList(this.table, "column definition", defaultColumnOptions);

		this.renderer = null;
	}

	////////////// Setup Functions /////////////////

	initialize(){
		this.initializeRenderer();

		this.headersElement = this.createHeadersElement();
		this.element = this.createHeaderElement();

		this.element.insertBefore(this.headersElement, this.element.firstChild);

		this.subscribe("scroll-horizontal", this.scrollHorizontal.bind(this));
	}

	initializeRenderer(){
		var renderClass;

		var renderers = {
			"virtual": RendererVirtualDomHorizontal,
			"basic": RendererBasicHorizontal,
		};

		if(typeof this.table.options.renderHorizontal === "string"){
			renderClass = renderers[this.table.options.renderHorizontal];
		}else{
			renderClass = this.table.options.renderHorizontal;
		}

		if(renderClass){
			this.renderer = new renderClass(this.table, this.element, this.tableElement);
			this.renderer.initialize();
		}else{
			console.error("Unable to find matching renderer:", table.options.renderHorizontal);
		}
	}


	createHeadersElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-headers");
		el.setAttribute("role", "row");

		return el;
	}

	createHeaderElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-header");
		el.setAttribute("role", "rowgroup");

		if(!this.table.options.headerVisible){
			el.classList.add("tabulator-header-hidden");
		}

		return el;
	}

	//return containing element
	getElement(){
		return this.element;
	}

	//return header containing element
	getHeadersElement(){
		return this.headersElement;
	}

	//scroll horizontally to match table body
	scrollHorizontal(left){
		var hozAdjust = 0,
		scrollWidth = this.element.scrollWidth - this.table.element.clientWidth;

		// this.tempScrollBlock();
		this.element.scrollLeft = left;

		//adjust for vertical scrollbar moving table when present
		if(left > scrollWidth){
			hozAdjust = left - scrollWidth;
			this.element.style.marginLeft = (-(hozAdjust)) + "px";
		}else{
			this.element.style.marginLeft = 0;
		}

		this.scrollLeft = left;

		this.renderer.scrollColumns(left);
	}

	///////////// Column Setup Functions /////////////
	generateColumnsFromRowData(data){
		var cols = [],
		definitions = this.table.options.autoColumnsDefinitions,
		row, sorter;

		if(data && data.length){

			row = data[0];

			for(var key in row){
				let col = {
					field:key,
					title:key,
				};

				let value = row[key];

				switch(typeof value){
					case "undefined":
					sorter = "string";
					break;

					case "boolean":
					sorter = "boolean";
					break;

					case "object":
					if(Array.isArray(value)){
						sorter = "array";
					}else{
						sorter = "string";
					}
					break;

					default:
					if(!isNaN(value) && value !== ""){
						sorter = "number";
					}else{
						if(value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+$/i)){
							sorter = "alphanum";
						}else{
							sorter = "string";
						}
					}
					break;
				}

				col.sorter = sorter;

				cols.push(col);
			}

			if(definitions){

				switch(typeof definitions){
					case "function":
					this.table.options.columns = definitions.call(this.table, cols);
					break;

					case "object":
					if(Array.isArray(definitions)){
						cols.forEach((col) => {
							var match = definitions.find((def) => {
								return def.field === col.field;
							});

							if(match){
								Object.assign(col, match);
							}
						});

					}else{
						cols.forEach((col) => {
							if(definitions[col.field]){
								Object.assign(col, definitions[col.field]);
							}
						});
					}

					this.table.options.columns = cols;
					break;
				}
			}else{
				this.table.options.columns = cols;
			}

			this.setColumns(this.table.options.columns);
		}
	}

	setColumns(cols, row){
		while(this.headersElement.firstChild) this.headersElement.removeChild(this.headersElement.firstChild);

		this.columns = [];
		this.columnsByIndex = [];
		this.columnsByField = {};

		this.dispatch("columns-loading");

		cols.forEach((def, i) => {
			this._addColumn(def);
		});

		this._reIndexColumns();

		this.dispatch("columns-loaded");

		this.renderer.rerenderColumns(false, true);

		this.redraw(true);
	}

	_addColumn(definition, before, nextToColumn){
		var column = new Column(definition, this),
		colEl = column.getElement(),
		index = nextToColumn ? this.findColumnIndex(nextToColumn) : nextToColumn;

		if(nextToColumn && index > -1){
			var topColumn = nextToColumn.getTopColumn()
			var parentIndex = this.columns.indexOf(topColumn);
			var nextEl = topColumn.getElement();

			if(before){
				this.columns.splice(parentIndex, 0, column);
				nextEl.parentNode.insertBefore(colEl, nextEl);
			}else{
				this.columns.splice(parentIndex + 1, 0, column);
				nextEl.parentNode.insertBefore(colEl, nextEl.nextSibling);
			}
		}else{
			if(before){
				this.columns.unshift(column);
				this.headersElement.insertBefore(column.getElement(), this.headersElement.firstChild);
			}else{
				this.columns.push(column);
				this.headersElement.appendChild(column.getElement());
			}
		}

		column.columnRendered();

		return column;
	}

	registerColumnField(col){
		if(col.definition.field){
			this.columnsByField[col.definition.field] = col;
		}
	}

	registerColumnPosition(col){
		this.columnsByIndex.push(col);
	}

	_reIndexColumns(){
		this.columnsByIndex = [];

		this.columns.forEach(function(column){
			column.reRegisterPosition();
		});
	}

	//ensure column headers take up the correct amount of space in column groups
	verticalAlignHeaders(){
		var minHeight = 0;

		this.columns.forEach((column) => {
			var height;

			column.clearVerticalAlign();

			height = column.getHeight();

			if(height > minHeight){
				minHeight = height;
			}
		});

		this.columns.forEach((column) => {
			column.verticalAlign(this.table.options.columnHeaderVertAlign, minHeight);
		});

		this.table.rowManager.adjustTableSize();
	}

	//////////////// Column Details /////////////////
	findColumn(subject){
		if(typeof subject == "object"){

			if(subject instanceof Column){
				//subject is column element
				return subject;
			}else if(subject instanceof ColumnComponent){
				//subject is public column component
				return subject._getSelf() || false;
			}else if(typeof HTMLElement !== "undefined" && subject instanceof HTMLElement){
				//subject is a HTML element of the column header
				let match = this.columns.find((column) => {
					return column.element === subject;
				});

				return match || false;
			}

		}else{
			//subject should be treated as the field name of the column
			return this.columnsByField[subject] || false;
		}

		//catch all for any other type of input
		return false;
	}

	getColumnByField(field){
		return this.columnsByField[field];
	}

	getColumnsByFieldRoot(root){
		var matches = [];

		Object.keys(this.columnsByField).forEach((field) => {
			var fieldRoot = field.split(".")[0];
			if(fieldRoot === root){
				matches.push(this.columnsByField[field]);
			}
		});

		return matches;
	}

	getColumnByIndex(index){
		return this.columnsByIndex[index];
	}

	getFirstVisibleColumn(index){
		var index = this.columnsByIndex.findIndex((col) => {
			return col.visible;
		});

		return index > -1 ? this.columnsByIndex[index] : false;
	}

	getColumns(){
		return this.columns;
	}

	findColumnIndex(column){
		return this.columnsByIndex.findIndex((col) => {
			return column === col;
		});
	}

	//return all columns that are not groups
	getRealColumns(){
		return this.columnsByIndex;
	}

	//travers across columns and call action
	traverse(callback){
		this.columnsByIndex.forEach((column,i) =>{
			callback(column, i);
		});
	}

	//get defintions of actual columns
	getDefinitions(active){
		var output = [];

		this.columnsByIndex.forEach((column) => {
			if(!active || (active && column.visible)){
				output.push(column.getDefinition());
			}
		});

		return output;
	}

	//get full nested definition tree
	getDefinitionTree(){
		var output = [];

		this.columns.forEach((column) => {
			output.push(column.getDefinition(true));
		});

		return output;
	}

	getComponents(structured){
		var output = [],
		columns = structured ? this.columns : this.columnsByIndex;

		columns.forEach((column) => {
			output.push(column.getComponent());
		});

		return output;
	}

	getWidth(){
		var width = 0;

		this.columnsByIndex.forEach((column) => {
			if(column.visible){
				width += column.getWidth();
			}
		});

		return width;
	}

	moveColumn(from, to, after){
		this.moveColumnActual(from, to, after);

		to.element.parentNode.insertBefore(from.element, to.element);

		if(after){
			to.element.parentNode.insertBefore(to.element, from.element);
		}

		this.verticalAlignHeaders();

		this.table.rowManager.reinitialize();
	}

	moveColumnActual(from, to, after){
		if(from.parent.isGroup){
			this._moveColumnInArray(from.parent.columns, from, to, after);
		}else{
			this._moveColumnInArray(this.columns, from, to, after);
		}

		this._moveColumnInArray(this.columnsByIndex, from, to, after, true);

		this.renderer.rerenderColumns(true);

		this.dispatch("column-moved", from, to, after);

		if(this.subscribedExternal("columnMoved")){
			this.dispatchExternal("columnMoved", from.getComponent(), this.table.columnManager.getComponents());
		}
	}

	_moveColumnInArray(columns, from, to, after, updateRows){
		var	fromIndex = columns.indexOf(from),
		toIndex, rows = [];

		if (fromIndex > -1) {

			columns.splice(fromIndex, 1);

			toIndex = columns.indexOf(to);

			if (toIndex > -1) {

				if(after){
					toIndex = toIndex+1;
				}

			}else{
				toIndex = fromIndex;
			}

			columns.splice(toIndex, 0, from);

			if(updateRows){

				rows = this.chain("column-moving-rows", [from, to, after], null, []) || [];

				rows = rows.concat(this.table.rowManager.rows);

				rows.forEach(function(row){
					if(row.cells.length){
						var cell = row.cells.splice(fromIndex, 1)[0];
						row.cells.splice(toIndex, 0, cell);
					}
				});

			}
		}
	}

	scrollToColumn(column, position, ifVisible){
		var left = 0,
		offset = 0,
		adjust = 0,
		colEl = column.getElement();

		return new Promise((resolve, reject) => {

			if(typeof position === "undefined"){
				position = this.table.options.scrollToColumnPosition;
			}

			if(typeof ifVisible === "undefined"){
				ifVisible = this.table.options.scrollToColumnIfVisible;
			}

			if(column.visible){

				//align to correct position
				switch(position){
					case "middle":
					case "center":
					adjust = -this.element.clientWidth / 2;
					break;

					case "right":
					adjust = colEl.clientWidth - this.headersElement.clientWidth;
					break;
				}

				//check column visibility
				if(!ifVisible){

					offset = colEl.offsetLeft;

					if(offset > 0 && offset + colEl.offsetWidth < this.element.clientWidth){
						return false;
					}
				}

				//calculate scroll position
				left = colEl.offsetLeft + adjust;

				left = Math.max(Math.min(left, this.table.rowManager.element.scrollWidth - this.table.rowManager.element.clientWidth),0);

				this.table.rowManager.scrollHorizontal(left);
				this.scrollHorizontal(left);

				resolve();
			}else{
				console.warn("Scroll Error - Column not visible");
				reject("Scroll Error - Column not visible");
			}

		});
	}

	//////////////// Cell Management /////////////////
	generateCells(row){
		var cells = [];

		this.columnsByIndex.forEach((column) => {
			cells.push(column.generateCell(row));
		});

		return cells;
	}

	//////////////// Column Management /////////////////
	getFlexBaseWidth(){
		var totalWidth = this.table.element.clientWidth, //table element width
		fixedWidth = 0;

		//adjust for vertical scrollbar if present
		if(this.table.rowManager.element.scrollHeight > this.table.rowManager.element.clientHeight){
			totalWidth -= this.table.rowManager.element.offsetWidth - this.table.rowManager.element.clientWidth;
		}

		this.columnsByIndex.forEach(function(column){
			var width, minWidth, colWidth;

			if(column.visible){

				width = column.definition.width || 0;

				minWidth = parseInt(column.minWidth);

				if(typeof(width) == "string"){
					if(width.indexOf("%") > -1){
						colWidth = (totalWidth / 100) * parseInt(width) ;
					}else{
						colWidth = parseInt(width);
					}
				}else{
					colWidth = width;
				}

				fixedWidth += colWidth > minWidth ? colWidth : minWidth;

			}
		});

		return fixedWidth;
	}

	addColumn(definition, before, nextToColumn){
		return new Promise((resolve, reject) => {
			var column = this._addColumn(definition, before, nextToColumn);

			this._reIndexColumns();

			this.dispatch("column-add", definition, before, nextToColumn);

			if(this.layoutMode() != "fitColumns"){
				column.reinitializeWidth();
			}

			this.redraw(true);

			this.table.rowManager.reinitialize();

			this.renderer.rerenderColumns();

			resolve(column);
		});
	}

	//remove column from system
	deregisterColumn(column){
		var field = column.getField(),
		index;

		//remove from field list
		if(field){
			delete this.columnsByField[field];
		}

		//remove from index list
		index = this.columnsByIndex.indexOf(column);

		if(index > -1){
			this.columnsByIndex.splice(index, 1);
		}

		//remove from column list
		index = this.columns.indexOf(column);

		if(index > -1){
			this.columns.splice(index, 1);
		}

		this.verticalAlignHeaders();

		this.redraw();
	}

	//redraw columns
	redraw(force){
		if(Helpers.elVisible(this.element)){
			this.verticalAlignHeaders();
		}

		if(force){
			this.table.rowManager.resetScroll();
			this.table.rowManager.reinitialize();
		}

		if(!this.confirm("table-redrawing", force)){
			this.layoutRefresh();
		}

		this.dispatch("table-redraw", force);

		this.table.footerManager.redraw();
	}
}