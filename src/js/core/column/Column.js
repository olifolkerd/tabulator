import CoreFeature from '../CoreFeature.js';
import ColumnComponent from './ColumnComponent.js';
import defaultOptions from './defaults/options.js';

import Cell from '../cell/Cell.js';

class Column extends CoreFeature{

	constructor(def, parent){
		super(parent.table);

		this.definition = def; //column definition
		this.parent = parent; //hold parent object
		this.type = "column"; //type of element
		this.columns = []; //child columns
		this.cells = []; //cells bound to this column
		this.element = this.createElement(); //column header element
		this.contentElement = false;
		this.titleHolderElement = false;
		this.titleElement = false;
		this.groupElement = this.createGroupElement(); //column group holder element
		this.isGroup = false;
		this.hozAlign = ""; //horizontal text alignment
		this.vertAlign = ""; //vert text alignment

		//multi dimensional filed handling
		this.field ="";
		this.fieldStructure = "";
		this.getFieldValue = "";
		this.setFieldValue = "";

		this.titleDownload = null;
		this.titleFormatterRendered = false;

		this.mapDefinitions();

		this.setField(this.definition.field);

		this.modules = {}; //hold module variables;

		this.width = null; //column width
		this.widthStyled = ""; //column width pre-styled to improve render efficiency
		this.maxWidth = null; //column maximum width
		this.maxWidthStyled = ""; //column maximum pre-styled to improve render efficiency
		this.maxInitialWidth = null;
		this.minWidth = null; //column minimum width
		this.minWidthStyled = ""; //column minimum pre-styled to improve render efficiency
		this.widthFixed = false; //user has specified a width for this column

		this.visible = true; //default visible state

		this.component = null;

		//initialize column
		if(this.definition.columns){

			this.isGroup = true;

			this.definition.columns.forEach((def, i) => {
				var newCol = new Column(def, this);
				this.attachColumn(newCol);
			});

			this.checkColumnVisibility();
		}else{
			parent.registerColumnField(this);
		}

		this._initialize();
	}

	createElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-col");
		el.setAttribute("role", "columnheader");
		el.setAttribute("aria-sort", "none");

		switch(this.table.options.columnHeaderVertAlign){
			case "middle":
				el.style.justifyContent = "center";
				break;
			case "bottom":
				el.style.justifyContent = "flex-end";
				break;
		}

		return el;
	}

	createGroupElement (){
		var el = document.createElement("div");

		el.classList.add("tabulator-col-group-cols");

		return el;
	}

	mapDefinitions(){
		var defaults = this.table.options.columnDefaults;

		//map columnDefaults onto column definitions
		if(defaults){
			for(let key in defaults){
				if(typeof this.definition[key] === "undefined"){
					this.definition[key] = defaults[key];
				}
			}
		}

		this.definition = this.table.columnManager.optionsList.generate(Column.defaultOptionList, this.definition);
	}

	checkDefinition(){
		Object.keys(this.definition).forEach((key) => {
			if(Column.defaultOptionList.indexOf(key) === -1){
				console.warn("Invalid column definition option in '" + (this.field || this.definition.title) + "' column:", key);
			}
		});
	}

	setField(field){
		this.field = field;
		this.fieldStructure = field ? (this.table.options.nestedFieldSeparator ? field.split(this.table.options.nestedFieldSeparator) : [field]) : [];
		this.getFieldValue = this.fieldStructure.length > 1 ? this._getNestedData : this._getFlatData;
		this.setFieldValue = this.fieldStructure.length > 1 ? this._setNestedData : this._setFlatData;
	}

	//register column position with column manager
	registerColumnPosition(column){
		this.parent.registerColumnPosition(column);
	}

	//register column position with column manager
	registerColumnField(column){
		this.parent.registerColumnField(column);
	}

	//trigger position registration
	reRegisterPosition(){
		if(this.isGroup){
			this.columns.forEach(function(column){
				column.reRegisterPosition();
			});
		}else{
			this.registerColumnPosition(this);
		}
	}

	//build header element
	_initialize(){
		var def = this.definition;

		while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

		if(def.headerVertical){
			this.element.classList.add("tabulator-col-vertical");

			if(def.headerVertical === "flip"){
				this.element.classList.add("tabulator-col-vertical-flip");
			}
		}

		this.contentElement = this._buildColumnHeaderContent();

		this.element.appendChild(this.contentElement);

		if(this.isGroup){
			this._buildGroupHeader();
		}else{
			this._buildColumnHeader();
		}

		this.dispatch("column-init", this);
	}

	//build header element for header
	_buildColumnHeader(){
		var def = this.definition;

		this.dispatch("column-layout", this);

		//set column visibility
		if(typeof def.visible != "undefined"){
			if(def.visible){
				this.show(true);
			}else{
				this.hide(true);
			}
		}

		//assign additional css classes to column header
		if(def.cssClass){
			var classNames = def.cssClass.split(" ");
			classNames.forEach((className) => {
				this.element.classList.add(className);
			});
		}

		if(def.field){
			this.element.setAttribute("tabulator-field", def.field);
		}

		//set min width if present
		this.setMinWidth(parseInt(def.minWidth));

		if (def.maxInitialWidth) {
			this.maxInitialWidth = parseInt(def.maxInitialWidth);
		}
		
		if(def.maxWidth){
			this.setMaxWidth(parseInt(def.maxWidth));
		}

		this.reinitializeWidth();

		//set horizontal text alignment
		this.hozAlign = this.definition.hozAlign;
		this.vertAlign = this.definition.vertAlign;

		this.titleElement.style.textAlign = this.definition.headerHozAlign;
	}

	_buildColumnHeaderContent(){
		var contentElement = document.createElement("div");
		contentElement.classList.add("tabulator-col-content");

		this.titleHolderElement = document.createElement("div");
		this.titleHolderElement.classList.add("tabulator-col-title-holder");

		contentElement.appendChild(this.titleHolderElement);

		this.titleElement = this._buildColumnHeaderTitle();

		this.titleHolderElement.appendChild(this.titleElement);

		return contentElement;
	}

	//build title element of column
	_buildColumnHeaderTitle(){
		var def = this.definition;

		var titleHolderElement = document.createElement("div");
		titleHolderElement.classList.add("tabulator-col-title");
		
		if(def.headerWordWrap){
			titleHolderElement.classList.add("tabulator-col-title-wrap");
		}

		if(def.editableTitle){
			var titleElement = document.createElement("input");
			titleElement.classList.add("tabulator-title-editor");

			titleElement.addEventListener("click", (e) => {
				e.stopPropagation();
				titleElement.focus();
			});

			titleElement.addEventListener("change", () => {
				def.title = titleElement.value;
				this.dispatchExternal("columnTitleChanged", this.getComponent());
			});

			titleHolderElement.appendChild(titleElement);

			if(def.field){
				this.langBind("columns|" + def.field, (text) => {
					titleElement.value = text || (def.title || "&nbsp;");
				});
			}else{
				titleElement.value  = def.title || "&nbsp;";
			}

		}else{
			if(def.field){
				this.langBind("columns|" + def.field, (text) => {
					this._formatColumnHeaderTitle(titleHolderElement, text || (def.title || "&nbsp;"));
				});
			}else{
				this._formatColumnHeaderTitle(titleHolderElement, def.title || "&nbsp;");
			}
		}

		return titleHolderElement;
	}

	_formatColumnHeaderTitle(el, title){
		var contents = this.chain("column-format", [this, title, el], null, () => {
			return title;
		});

		switch(typeof contents){
			case "object":
				if(contents instanceof Node){
					el.appendChild(contents);
				}else{
					el.innerHTML = "";
					console.warn("Format Error - Title formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", contents);
				}
				break;
			case "undefined":
				el.innerHTML = "";
				break;
			default:
				el.innerHTML = contents;
		}
	}

	//build header element for column group
	_buildGroupHeader(){
		this.element.classList.add("tabulator-col-group");
		this.element.setAttribute("role", "columngroup");
		this.element.setAttribute("aria-title", this.definition.title);

		//asign additional css classes to column header
		if(this.definition.cssClass){
			var classNames = this.definition.cssClass.split(" ");
			classNames.forEach((className) => {
				this.element.classList.add(className);
			});
		}

		this.titleElement.style.textAlign = this.definition.headerHozAlign;

		this.element.appendChild(this.groupElement);
	}

	//flat field lookup
	_getFlatData(data){
		return data[this.field];
	}

	//nested field lookup
	_getNestedData(data){
		var dataObj = data,
		structure = this.fieldStructure,
		length = structure.length,
		output;

		for(let i = 0; i < length; i++){

			dataObj = dataObj[structure[i]];

			output = dataObj;

			if(!dataObj){
				break;
			}
		}

		return output;
	}

	//flat field set
	_setFlatData(data, value){
		if(this.field){
			data[this.field] = value;
		}
	}

	//nested field set
	_setNestedData(data, value){
		var dataObj = data,
		structure = this.fieldStructure,
		length = structure.length;

		for(let i = 0; i < length; i++){

			if(i == length -1){
				dataObj[structure[i]] = value;
			}else{
				if(!dataObj[structure[i]]){
					if(typeof value !== "undefined"){
						dataObj[structure[i]] = {};
					}else{
						break;
					}
				}

				dataObj = dataObj[structure[i]];
			}
		}
	}

	//attach column to this group
	attachColumn(column){
		if(this.groupElement){
			this.columns.push(column);
			this.groupElement.appendChild(column.getElement());

			column.columnRendered();
		}else{
			console.warn("Column Warning - Column being attached to another column instead of column group");
		}
	}

	//vertically align header in column
	verticalAlign(alignment, height){

		//calculate height of column header and group holder element
		var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : (height || this.parent.getHeadersElement().clientHeight);
		// var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : this.parent.getHeadersElement().clientHeight;

		this.element.style.height = parentHeight + "px";

		this.dispatch("column-height", this, this.element.style.height);

		if(this.isGroup){
			this.groupElement.style.minHeight = (parentHeight - this.contentElement.offsetHeight) + "px";
		}

		//vertically align cell contents
		// if(!this.isGroup && alignment !== "top"){
		// 	if(alignment === "bottom"){
		// 		this.element.style.paddingTop = (this.element.clientHeight - this.contentElement.offsetHeight) + "px";
		// 	}else{
		// 		this.element.style.paddingTop = ((this.element.clientHeight - this.contentElement.offsetHeight) / 2) + "px";
		// 	}
		// }

		this.columns.forEach(function(column){
			column.verticalAlign(alignment);
		});
	}

	//clear vertical alignment
	clearVerticalAlign(){
		this.element.style.paddingTop = "";
		this.element.style.height = "";
		this.element.style.minHeight = "";
		this.groupElement.style.minHeight = "";

		this.columns.forEach(function(column){
			column.clearVerticalAlign();
		});

		this.dispatch("column-height", this, "");
	}

	//// Retrieve Column Information ////
	//return column header element
	getElement(){
		return this.element;
	}

	//return column group element
	getGroupElement(){
		return this.groupElement;
	}

	//return field name
	getField(){
		return this.field;
	}

	getTitleDownload() {
		return this.titleDownload;
	}

	//return the first column in a group
	getFirstColumn(){
		if(!this.isGroup){
			return this;
		}else{
			if(this.columns.length){
				return this.columns[0].getFirstColumn();
			}else{
				return false;
			}
		}
	}

	//return the last column in a group
	getLastColumn(){
		if(!this.isGroup){
			return this;
		}else{
			if(this.columns.length){
				return this.columns[this.columns.length -1].getLastColumn();
			}else{
				return false;
			}
		}
	}

	//return all columns in a group
	getColumns(traverse){
		var columns = [];

		if(traverse){
			this.columns.forEach((column) => {
				columns.push(column);
					
				columns = columns.concat(column.getColumns(true));
			});
		}else{
			columns = this.columns;
		}
		
		return columns;
	}

	//return all columns in a group
	getCells(){
		return this.cells;
	}

	//retrieve the top column in a group of columns
	getTopColumn(){
		if(this.parent.isGroup){
			return this.parent.getTopColumn();
		}else{
			return this;
		}
	}

	//return column definition object
	getDefinition(updateBranches){
		var colDefs = [];

		if(this.isGroup && updateBranches){
			this.columns.forEach(function(column){
				colDefs.push(column.getDefinition(true));
			});

			this.definition.columns = colDefs;
		}

		return this.definition;
	}

	//////////////////// Actions ////////////////////
	checkColumnVisibility(){
		var visible = false;

		this.columns.forEach(function(column){
			if(column.visible){
				visible = true;
			}
		});

		if(visible){
			this.show();
			this.dispatchExternal("columnVisibilityChanged", this.getComponent(), false);
		}else{
			this.hide();
		}
	}

	//show column
	show(silent, responsiveToggle){
		if(!this.visible){
			this.visible = true;

			this.element.style.display = "";

			if(this.parent.isGroup){
				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function(cell){
				cell.show();
			});

			if(!this.isGroup && this.width === null){
				this.reinitializeWidth();
			}

			this.table.columnManager.verticalAlignHeaders();

			this.dispatch("column-show", this, responsiveToggle);

			if(!silent){
				this.dispatchExternal("columnVisibilityChanged", this.getComponent(), true);
			}

			if(this.parent.isGroup){
				this.parent.matchChildWidths();
			}

			if(!this.silent){
				this.table.columnManager.rerenderColumns();
			}
		}
	}

	//hide column
	hide(silent, responsiveToggle){
		if(this.visible){
			this.visible = false;

			this.element.style.display = "none";

			this.table.columnManager.verticalAlignHeaders();

			if(this.parent.isGroup){
				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function(cell){
				cell.hide();
			});

			this.dispatch("column-hide", this, responsiveToggle);

			if(!silent){
				this.dispatchExternal("columnVisibilityChanged", this.getComponent(), false);
			}

			if(this.parent.isGroup){
				this.parent.matchChildWidths();
			}

			if(!this.silent){
				this.table.columnManager.rerenderColumns();
			}
		}
	}

	matchChildWidths(){
		var childWidth = 0;

		if(this.contentElement && this.columns.length){
			this.columns.forEach(function(column){
				if(column.visible){
					childWidth += column.getWidth();
				}
			});

			this.contentElement.style.maxWidth = (childWidth - 1) + "px";

			if(this.parent.isGroup){
				this.parent.matchChildWidths();
			}
		}
	}

	removeChild(child){
		var index = this.columns.indexOf(child);

		if(index > -1){
			this.columns.splice(index, 1);
		}

		if(!this.columns.length){
			this.delete();
		}
	}

	setWidth(width){
		this.widthFixed = true;
		this.setWidthActual(width);
	}

	setWidthActual(width){
		if(isNaN(width)){
			width = Math.floor((this.table.element.clientWidth/100) * parseInt(width));
		}

		width = Math.max(this.minWidth, width);

		if(this.maxWidth){
			width = Math.min(this.maxWidth, width);
		}

		this.width = width;
		this.widthStyled = width ? width + "px" : "";

		this.element.style.width = this.widthStyled;

		if(!this.isGroup){
			this.cells.forEach(function(cell){
				cell.setWidth();
			});
		}

		if(this.parent.isGroup){
			this.parent.matchChildWidths();
		}

		this.dispatch("column-width", this);
	}

	checkCellHeights(){
		var rows = [];

		this.cells.forEach(function(cell){
			if(cell.row.heightInitialized){
				if(cell.row.getElement().offsetParent !== null){
					rows.push(cell.row);
					cell.row.clearCellHeight();
				}else{
					cell.row.heightInitialized = false;
				}
			}
		});

		rows.forEach(function(row){
			row.calcHeight();
		});

		rows.forEach(function(row){
			row.setCellHeight();
		});
	}

	getWidth(){
		var width = 0;

		if(this.isGroup){
			this.columns.forEach(function(column){
				if(column.visible){
					width += column.getWidth();
				}
			});
		}else{
			width = this.width;
		}

		return width;
	}

	getLeftOffset(){
		var offset = this.element.offsetLeft;

		if(this.parent.isGroup){
			offset += this.parent.getLeftOffset();
		}

		return offset;
	}

	getHeight(){
		return Math.ceil(this.element.getBoundingClientRect().height);
	}

	setMinWidth(minWidth){
		if(this.maxWidth && minWidth > this.maxWidth){
			minWidth = this.maxWidth;

			console.warn("the minWidth ("+ minWidth + "px) for column '" + this.field + "' cannot be bigger that its maxWidth ("+ this.maxWidthStyled + ")");
		}

		this.minWidth = minWidth;
		this.minWidthStyled = minWidth ? minWidth + "px" : "";

		this.element.style.minWidth = this.minWidthStyled;

		this.cells.forEach(function(cell){
			cell.setMinWidth();
		});
	}

	setMaxWidth(maxWidth){
		if(this.minWidth && maxWidth < this.minWidth){
			maxWidth = this.minWidth;

			console.warn("the maxWidth ("+ maxWidth + "px) for column '" + this.field + "' cannot be smaller that its minWidth ("+ this.minWidthStyled + ")");
		}

		this.maxWidth = maxWidth;
		this.maxWidthStyled = maxWidth ? maxWidth + "px" : "";

		this.element.style.maxWidth = this.maxWidthStyled;

		this.cells.forEach(function(cell){
			cell.setMaxWidth();
		});
	}

	delete(){
		return new Promise((resolve, reject) => {
			if(this.isGroup){
				this.columns.forEach(function(column){
					column.delete();
				});
			}

			this.dispatch("column-delete", this);

			var cellCount = this.cells.length;

			for(let i = 0; i < cellCount; i++){
				this.cells[0].delete();
			}

			if(this.element.parentNode){
				this.element.parentNode.removeChild(this.element);
			}

			this.element = false;
			this.contentElement = false;
			this.titleElement = false;
			this.groupElement = false;

			if(this.parent.isGroup){
				this.parent.removeChild(this);
			}

			this.table.columnManager.deregisterColumn(this);

			this.table.columnManager.rerenderColumns(true);

			resolve();
		});
	}

	columnRendered(){
		if(this.titleFormatterRendered){
			this.titleFormatterRendered();
		}

		this.dispatch("column-rendered", this);
	}

	//////////////// Cell Management /////////////////
	//generate cell for this column
	generateCell(row){
		var cell = new Cell(this, row);

		this.cells.push(cell);

		return cell;
	}

	nextColumn(){
		var index = this.table.columnManager.findColumnIndex(this);
		return index > -1 ? this._nextVisibleColumn(index + 1) : false;
	}

	_nextVisibleColumn(index){
		var column = this.table.columnManager.getColumnByIndex(index);
		return !column || column.visible ? column : this._nextVisibleColumn(index + 1);
	}

	prevColumn(){
		var index = this.table.columnManager.findColumnIndex(this);
		return index > -1 ? this._prevVisibleColumn(index - 1) : false;
	}

	_prevVisibleColumn(index){
		var column = this.table.columnManager.getColumnByIndex(index);
		return !column || column.visible ? column : this._prevVisibleColumn(index - 1);
	}

	reinitializeWidth(force){
		this.widthFixed = false;

		//set width if present
		if(typeof this.definition.width !== "undefined" && !force){
			// maxInitialWidth ignored here as width specified
			this.setWidth(this.definition.width);
		}

		this.dispatch("column-width-fit-before", this);

		this.fitToData(force);

		this.dispatch("column-width-fit-after", this);
	}

	//set column width to maximum cell width for non group columns
	fitToData(force){
		if(this.isGroup){
			return;
		}

		if(!this.widthFixed){
			this.element.style.width = "";

			this.cells.forEach((cell) => {
				cell.clearWidth();
			});
		}

		var maxWidth = this.element.offsetWidth;

		if(!this.width || !this.widthFixed){
			this.cells.forEach((cell) => {
				var width = cell.getWidth();

				if(width > maxWidth){
					maxWidth = width;
				}
			});

			if(maxWidth){
				var setTo = maxWidth + 1;
				if (this.maxInitialWidth && !force) {
					setTo = Math.min(setTo, this.maxInitialWidth);
				}
				this.setWidthActual(setTo);
			}
		}
	}

	updateDefinition(updates){
		var definition;

		if(!this.isGroup){
			if(!this.parent.isGroup){
				definition = Object.assign({}, this.getDefinition());
				definition = Object.assign(definition, updates);

				return this.table.columnManager.addColumn(definition, false, this)
					.then((column) => {

						if(definition.field == this.field){
							this.field = false; //clear field name to prevent deletion of duplicate column from arrays
						}

						return this.delete()
							.then(() => {
								return column.getComponent();
							});

					});
			}else{
				console.error("Column Update Error - The updateDefinition function is only available on ungrouped columns");
				return Promise.reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
			}
		}else{
			console.error("Column Update Error - The updateDefinition function is only available on ungrouped columns");
			return Promise.reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
		}
	}

	deleteCell(cell){
		var index = this.cells.indexOf(cell);

		if(index > -1){
			this.cells.splice(index, 1);
		}
	}

	//////////////// Object Generation /////////////////
	getComponent(){
		if(!this.component){
			this.component = new ColumnComponent(this);
		}

		return this.component;
	}
}

Column.defaultOptionList = defaultOptions;

export default Column;
