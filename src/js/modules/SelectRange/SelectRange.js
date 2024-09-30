import Module from "../../core/Module.js";
import Range from "./Range.js";
import extensions from './extensions/extensions.js';


export default class SelectRange extends Module {
	
	static moduleName = "selectRange";
	static moduleInitOrder = 1;
	static moduleExtensions = extensions;
	
	constructor(table) {
		super(table);
		
		this.selecting = "cell";
		this.mousedown = false;
		this.ranges = [];
		this.overlay = null;
		this.rowHeader = null;
		this.layoutChangeTimeout = null;
		this.columnSelection = false;
		this.rowSelection = false;
		this.maxRanges = 0;
		this.activeRange = false;
		this.blockKeydown = false;
		
		this.keyDownEvent = this._handleKeyDown.bind(this);
		this.mouseUpEvent = this._handleMouseUp.bind(this);
		
		this.registerTableOption("selectableRange", false); //enable selectable range
		this.registerTableOption("selectableRangeColumns", false); //enable selectable range
		this.registerTableOption("selectableRangeRows", false); //enable selectable range
		this.registerTableOption("selectableRangeClearCells", false); //allow clearing of active range
		this.registerTableOption("selectableRangeClearCellsValue", undefined); //value for cleared active range
		this.registerTableOption("selectableRangeAutoFocus", true); //focus on a cell after resetRanges
		
		this.registerTableFunction("getRangesData", this.getRangesData.bind(this));
		this.registerTableFunction("getRanges", this.getRanges.bind(this));
		this.registerTableFunction("addRange", this.addRangeFromComponent.bind(this));
		
		this.registerComponentFunction("cell", "getRanges", this.cellGetRanges.bind(this));
		this.registerComponentFunction("row", "getRanges", this.rowGetRanges.bind(this));
		this.registerComponentFunction("column", "getRanges", this.colGetRanges.bind(this));
	}
	
	///////////////////////////////////
	///////    Initialization   ///////
	///////////////////////////////////
	
	initialize() {
		if (this.options("selectableRange")) {	
			if(!this.options("selectableRows")){
				this.maxRanges = this.options("selectableRange");
				
				this.initializeTable();
				this.initializeWatchers();
			}else{
				console.warn("SelectRange functionality cannot be used in conjunction with row selection");
			}

			if(this.options('columns').findIndex((column) => column.frozen) > 0) {
				console.warn("Having frozen column in arbitrary position with selectRange option may result in unpredictable behavior.");
			}

			if(this.options('columns').filter((column) => column.frozen) > 1) {
				console.warn("Having multiple frozen columns with selectRange option may result in unpredictable behavior.");
			}
		}
	}
	
	
	initializeTable() {		
		this.overlay = document.createElement("div");
		this.overlay.classList.add("tabulator-range-overlay");
		
		this.rangeContainer = document.createElement("div");
		this.rangeContainer.classList.add("tabulator-range-container");
		
		this.activeRangeCellElement = document.createElement("div");
		this.activeRangeCellElement.classList.add("tabulator-range-cell-active");
		
		this.overlay.appendChild(this.rangeContainer);
		this.overlay.appendChild(this.activeRangeCellElement);
		
		this.table.rowManager.element.addEventListener("keydown", this.keyDownEvent);
		
		this.resetRanges();
		
		this.table.rowManager.element.appendChild(this.overlay);
		this.table.columnManager.element.setAttribute("tabindex", 0);
		this.table.element.classList.add("tabulator-ranges");
	}
	
	initializeWatchers() {
		this.columnSelection = this.options("selectableRangeColumns");
		this.rowSelection = this.options("selectableRangeRows");
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("column-mousedown", this.handleColumnMouseDown.bind(this));
		this.subscribe("column-mousemove", this.handleColumnMouseMove.bind(this));
		this.subscribe("column-resized", this.handleColumnResized.bind(this));
		this.subscribe("column-moving", this.handleColumnMoving.bind(this));
		this.subscribe("column-moved", this.handleColumnMoved.bind(this));
		this.subscribe("column-width", this.layoutChange.bind(this));
		this.subscribe("column-height", this.layoutChange.bind(this));
		this.subscribe("column-resized", this.layoutChange.bind(this));
		this.subscribe("columns-loaded", this.updateHeaderColumn.bind(this));
		
		this.subscribe("cell-height", this.layoutChange.bind(this));
		this.subscribe("cell-rendered", this.renderCell.bind(this));
		this.subscribe("cell-mousedown", this.handleCellMouseDown.bind(this));
		this.subscribe("cell-mousemove", this.handleCellMouseMove.bind(this));
		this.subscribe("cell-click", this.handleCellClick.bind(this));
		this.subscribe("cell-editing", this.handleEditingCell.bind(this));
		
		this.subscribe("page-changed", this.redraw.bind(this));
		
		this.subscribe("scroll-vertical", this.layoutChange.bind(this));
		this.subscribe("scroll-horizontal", this.layoutChange.bind(this));
		
		this.subscribe("data-destroy", this.tableDestroyed.bind(this));
		this.subscribe("data-processed", this.resetRanges.bind(this));
		
		this.subscribe("table-layout", this.layoutElement.bind(this));
		this.subscribe("table-redraw", this.redraw.bind(this));
		this.subscribe("table-destroy", this.tableDestroyed.bind(this));
		
		this.subscribe("edit-editor-clear", this.finishEditingCell.bind(this));
		this.subscribe("edit-blur", this.restoreFocus.bind(this));
		
		this.subscribe("keybinding-nav-prev", this.keyNavigate.bind(this, "left"));
		this.subscribe("keybinding-nav-next", this.keyNavigate.bind(this, "right"));
		this.subscribe("keybinding-nav-left", this.keyNavigate.bind(this, "left"));
		this.subscribe("keybinding-nav-right", this.keyNavigate.bind(this, "right"));
		this.subscribe("keybinding-nav-up", this.keyNavigate.bind(this, "up"));
		this.subscribe("keybinding-nav-down", this.keyNavigate.bind(this, "down"));
		this.subscribe("keybinding-nav-range", this.keyNavigateRange.bind(this));
	}
	
	
	initializeColumn(column) {
		if(this.columnSelection && column.definition.headerSort && this.options("headerSortClickElement") !== "icon"){
			console.warn("Using column headerSort with selectableRangeColumns option may result in unpredictable behavior. Consider using headerSortClickElement: 'icon'.");
		}
		
		if (column.modules.edit) {
			// Block editor from taking action so we can trigger edit by
			// double clicking.
			// column.modules.edit.blocked = true;
		}
	}
	
	updateHeaderColumn(){
		var frozenCols;

		if(this.rowSelection){
			this.rowHeader = this.table.columnManager.getVisibleColumnsByIndex()[0];
			
			if(this.rowHeader){
				this.rowHeader.definition.cssClass = this.rowHeader.definition.cssClass + " tabulator-range-row-header";
				
				if(this.rowHeader.definition.headerSort){
					console.warn("Using column headerSort with selectableRangeRows option may result in unpredictable behavior");
				}
				
				if(this.rowHeader.definition.editor){
					console.warn("Using column editor with selectableRangeRows option may result in unpredictable behavior");
				}
			}
		}

		//warn if invalid frozen column configuration detected
		if(this.table.modules.frozenColumns && this.table.modules.frozenColumns.active){
			frozenCols = this.table.modules.frozenColumns.getFrozenColumns();

			if(frozenCols.length > 1 || (frozenCols.length === 1 && frozenCols[0] !== this.rowHeader)){
				console.warn("Using frozen columns that are not the range header in combination with the selectRange option may result in unpredictable behavior");
			}
		}
	}
	
	///////////////////////////////////
	///////   Table Functions   ///////
	///////////////////////////////////
	
	getRanges(){
		return this.ranges.map((range) => range.getComponent());
	}
	
	getRangesData() {
		return this.ranges.map((range) => range.getData());
	}
	
	addRangeFromComponent(start, end){
		start = start ? start._cell : null;
		end = end ? end._cell : null;
		
		return this.addRange(start, end);
	}
	
	///////////////////////////////////
	/////// Component Functions ///////
	///////////////////////////////////
	
	cellGetRanges(cell){
		var ranges = [];
		
		if (cell.column === this.rowHeader) {
			ranges = this.ranges.filter((range) => range.occupiesRow(cell.row));
		} else {
			ranges = this.ranges.filter((range) => range.occupies(cell));
		}
		
		return ranges.map((range) => range.getComponent());
	}
	
	rowGetRanges(row){
		var ranges = this.ranges.filter((range) => range.occupiesRow(row));
		
		return ranges.map((range) => range.getComponent());
	}
	
	colGetRanges(col){
		var ranges = this.ranges.filter((range) => range.occupiesColumn(col));
		
		return ranges.map((range) => range.getComponent());
	}
	
	///////////////////////////////////
	////////// Event Handlers /////////
	///////////////////////////////////
	
	_handleMouseUp(e){
		this.mousedown = false;
		document.removeEventListener("mouseup", this.mouseUpEvent);
	}
	
	_handleKeyDown(e) {
		if (!this.blockKeydown && (!this.table.modules.edit || (this.table.modules.edit && !this.table.modules.edit.currentCell))) {
			if (e.key === "Enter") {
				// is editing a cell?
				if (this.table.modules.edit && this.table.modules.edit.currentCell) {
					return;
				}
				
				this.table.modules.edit.editCell(this.getActiveCell());
				
				e.preventDefault();
			}
			
			if ((e.key === "Backspace" || e.key === "Delete") && this.options("selectableRangeClearCells")) {
				if(this.activeRange){
					this.activeRange.clearValues();
				}
			}
		}
	}
	
	initializeFocus(cell){
		var range;

		this.restoreFocus();
		
		try{
			if (document.selection) { // IE
				range = document.body.createTextRange();
				range.moveToElementText(cell.getElement());
				range.select();
			} else if (window.getSelection) {
				range = document.createRange();
				range.selectNode(cell.getElement());
				window.getSelection().removeAllRanges();
				window.getSelection().addRange(range);
			}
		}catch(e){}
	}
	
	restoreFocus(element){
		this.table.rowManager.element.focus();
		
		return true;
	}
	
	///////////////////////////////////
	////// Column Functionality ///////
	///////////////////////////////////
	
	handleColumnResized(column) {
		var selected;
		
		if (this.selecting !== "column" && this.selecting !== "all") {
			return;
		}
		
		selected = this.ranges.some((range) => range.occupiesColumn(column));
		
		if (!selected) {
			return;
		}
		
		this.ranges.forEach((range) => {
			var selectedColumns = range.getColumns(true);
			
			selectedColumns.forEach((selectedColumn) => {
				if (selectedColumn !== column) {
					selectedColumn.setWidth(column.width);
				}
			});
		});
	}
	
	handleColumnMoving(_event, column) {
		this.resetRanges().setBounds(column);
		this.overlay.style.visibility = "hidden";
	}

	handleColumnMoved(from, _to, _after) {
		this.activeRange.setBounds(from);
		this.layoutElement();
	}

	handleColumnMouseDown(event, column) {
		if (event.button === 2 && (this.selecting === "column" || this.selecting === "all") && this.activeRange.occupiesColumn(column)) {
			return;
		}

		//If columns are movable, allow dragging columns only if they are not
		//selected. Dragging selected columns should move the columns instead.
		if(this.table.options.movableColumns && this.selecting === "column" && this.activeRange.occupiesColumn(column)){
			return;
		}
		
		this.mousedown = true;
		
		document.addEventListener("mouseup", this.mouseUpEvent);
		
		this.newSelection(event, column);
	}
	
	handleColumnMouseMove(e, column) {
		if (column === this.rowHeader || !this.mousedown || this.selecting === 'all') {
			return;
		}
		
		this.activeRange.setBounds(false, column, true);
	}
	
	///////////////////////////////////
	//////// Cell Functionality ///////
	///////////////////////////////////
	
	renderCell(cell) {
		var el = cell.getElement(),
		rangeIdx = this.ranges.findIndex((range) => range.occupies(cell));
		
		el.classList.toggle("tabulator-range-selected", rangeIdx !== -1);
		el.classList.toggle("tabulator-range-only-cell-selected", this.ranges.length === 1 && this.ranges[0].atTopLeft(cell) &&	this.ranges[0].atBottomRight(cell));
		
		el.dataset.range = rangeIdx;
	}
	
	handleCellMouseDown(event, cell) {
		if (event.button === 2 && (this.activeRange.occupies(cell) || ((this.selecting === "row" || this.selecting === "all") && this.activeRange.occupiesRow(cell.row)))) {
			return;
		}
		
		this.mousedown = true;
		
		document.addEventListener("mouseup", this.mouseUpEvent);
		
		this.newSelection(event, cell);
	}
	
	handleCellMouseMove(e, cell) {
		if (!this.mousedown || this.selecting === "all") {
			return;
		}
		
		this.activeRange.setBounds(false, cell, true);
	}
	
	handleCellClick(e, cell){
		this.initializeFocus(cell);
	}
	
	handleEditingCell(cell) {
		if(this.activeRange){
			this.activeRange.setBounds(cell);
		}
	}
	
	finishEditingCell() {
		this.blockKeydown = true;
		this.table.rowManager.element.focus();
		
		setTimeout(() => {
			this.blockKeydown = false;
		}, 10);
	}
	
	///////////////////////////////////
	///////     Navigation      ///////
	///////////////////////////////////
	
	keyNavigate(dir, e){
		if(this.navigate(false, false, dir)){
			// e.preventDefault();
		}
		e.preventDefault();
	}
	
	keyNavigateRange(e, dir, jump, expand){
		if(this.navigate(jump, expand, dir)){
			// e.preventDefault();
		}
		e.preventDefault();
	}
	
	navigate(jump, expand, dir) {
		var moved = false,
		range, rangeEdge, prevRect, nextRow, nextCol, row, column,
		rowRect, rowManagerRect, columnRect, columnManagerRect;
		
		// Don't navigate while editing
		if (this.table.modules.edit && this.table.modules.edit.currentCell) {
			return false;
		}
		
		// If there are more than 1 range, use the active range and destroy the others
		if (this.ranges.length > 1) {
			this.ranges = this.ranges.filter((range) => {
				if (range === this.activeRange) {
					range.setEnd(range.start.row, range.start.col);
					return true;
				}
				range.destroy();
				return false;
			});
		}
		
		range = this.activeRange;
		prevRect = {
			top: range.top,
			bottom: range.bottom,
			left: range.left,
			right: range.right
		};
		
		rangeEdge = expand ? range.end : range.start;
		nextRow = rangeEdge.row;
		nextCol = rangeEdge.col;
		
		if(jump){
			switch(dir){
				case "left":
					nextCol = this.findJumpCellLeft(range.start.row, rangeEdge.col);
					break;
				case "right":
					nextCol = this.findJumpCellRight(range.start.row, rangeEdge.col);
					break;
				case "up":
					nextRow = this.findJumpCellUp(rangeEdge.row, range.start.col);
					break;
				case "down":
					nextRow = this.findJumpCellDown(rangeEdge.row, range.start.col);
					break;
			}
		}else{
			if(expand){
				if ((this.selecting === 'row' && (dir === 'left' || dir === 'right')) || (this.selecting === 'column' && (dir === 'up' || dir === 'down'))) {
					return;
				}
			}
			
			switch(dir){
				case "left":
					nextCol = Math.max(nextCol - 1, 0);
					break;
				case "right":
					nextCol = Math.min(nextCol + 1, this.getTableColumns().length - 1);
					break;
				case "up":
					nextRow = Math.max(nextRow - 1, 0);
					break;
				case "down":
					nextRow = Math.min(nextRow + 1, this.getTableRows().length - 1);
					break;
			}
		}

		if(this.rowHeader && nextCol === 0) {
			nextCol = 1;
		}
		
		if(!expand){
			range.setStart(nextRow, nextCol);
		}
		
		range.setEnd(nextRow, nextCol);
		
		if(!expand){
			this.selecting = "cell";
		}

		moved = prevRect.top !== range.top || prevRect.bottom !== range.bottom || prevRect.left !== range.left || prevRect.right !== range.right;

		if (moved) {
			row = this.getRowByRangePos(range.end.row);
			column = this.getColumnByRangePos(range.end.col);
			rowRect = row.getElement().getBoundingClientRect();
			columnRect = column.getElement().getBoundingClientRect();
			rowManagerRect = this.table.rowManager.getElement().getBoundingClientRect();
			columnManagerRect = this.table.columnManager.getElement().getBoundingClientRect();
			
			if(!(rowRect.top >= rowManagerRect.top && rowRect.bottom <= rowManagerRect.bottom)){
				if(row.getElement().parentNode && column.getElement().parentNode){
					// Use faster autoScroll when the elements are on the DOM
					this.autoScroll(range, row.getElement(), column.getElement());
				}else{
					row.getComponent().scrollTo(undefined, false);
				}
			}

			if(!(columnRect.left >= columnManagerRect.left + this.getRowHeaderWidth() && columnRect.right <= columnManagerRect.right)){
				if(row.getElement().parentNode && column.getElement().parentNode){
					// Use faster autoScroll when the elements are on the DOM
					this.autoScroll(range, row.getElement(), column.getElement());
				}else{
					column.getComponent().scrollTo(undefined, false);
				}
			}

			this.layoutElement();
			
			return true;
		}
	}
	
	rangeRemoved(removed){
		this.ranges = this.ranges.filter((range) => range !== removed);
		
		if(this.activeRange === removed){
			if(this.ranges.length){
				this.activeRange = this.ranges[this.ranges.length - 1];
			}else{
				this.addRange();
			}
		}
		
		this.layoutElement();
	}
	
	findJumpRow(column, rows, reverse, emptyStart, emptySide){
		if(reverse){
			rows = rows.reverse();
		}

		return this.findJumpItem(emptyStart, emptySide, rows, function(row){return row.getData()[column.getField()];});
	}
	
	findJumpCol(row, columns, reverse, emptyStart, emptySide){
		if(reverse){
			columns = columns.reverse();
		}

		return this.findJumpItem(emptyStart, emptySide, columns, function(column){return row.getData()[column.getField()];});
	}

	findJumpItem(emptyStart, emptySide, items, valueResolver){
		var nextItem;

		for(let currentItem of items){
			let currentValue = valueResolver(currentItem);
			
			if(emptyStart){
				nextItem = currentItem;
				if(currentValue){
					break;
				}
			}else{
				if(emptySide){
					nextItem = currentItem;
					
					if(currentValue){
						break;
					}
				}else{
					if(currentValue){
						nextItem = currentItem;
					}else{
						break;
					}
				}
			}
		}

		return nextItem;
	}

	findJumpCellLeft(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos),
		columns = this.getTableColumns(),
		isStartingCellEmpty = this.isEmpty(row.getData()[columns[colPos].getField()]),
		isLeftOfStartingCellEmpty = columns[colPos - 1] ? this.isEmpty(row.getData()[columns[colPos - 1].getField()]) : false,
		targetCols = this.rowHeader ? columns.slice(1, colPos) : columns.slice(0, colPos),
		jumpCol = this.findJumpCol(row, targetCols, true, isStartingCellEmpty, isLeftOfStartingCellEmpty);
		
		if(jumpCol){
			return jumpCol.getPosition() - 1;
		}
		
		return colPos;
	}
	
	findJumpCellRight(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos),
		columns = this.getTableColumns(),
		isStartingCellEmpty = this.isEmpty(row.getData()[columns[colPos].getField()]),
		isRightOfStartingCellEmpty = columns[colPos + 1] ? this.isEmpty(row.getData()[columns[colPos + 1].getField()]) : false,
		jumpCol = this.findJumpCol(row, columns.slice(colPos + 1, columns.length), false, isStartingCellEmpty, isRightOfStartingCellEmpty);
		
		if(jumpCol){
			return jumpCol.getPosition() - 1;
		}
		
		return colPos;
	}
	
	findJumpCellUp(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos),
		rows = this.getTableRows(),
		isStartingCellEmpty = this.isEmpty(rows[rowPos].getData()[column.getField()]),
		isTopOfStartingCellEmpty = rows[rowPos - 1] ? this.isEmpty(rows[rowPos - 1].getData()[column.getField()]) : false,
		jumpRow = this.findJumpRow(column, rows.slice(0, rowPos), true, isStartingCellEmpty, isTopOfStartingCellEmpty);
		
		if(jumpRow){
			return jumpRow.position - 1;
		}
		
		return rowPos;
	}
	
	findJumpCellDown(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos),
		rows = this.getTableRows(),
		isStartingCellEmpty = this.isEmpty(rows[rowPos].getData()[column.getField()]),
		isBottomOfStartingCellEmpty = rows[rowPos + 1] ? this.isEmpty(rows[rowPos + 1].getData()[column.getField()]) : false,
		jumpRow = this.findJumpRow(column, rows.slice(rowPos + 1, rows.length), false, isStartingCellEmpty, isBottomOfStartingCellEmpty);
		
		if(jumpRow){
			return jumpRow.position - 1;
		}
		
		return rowPos;
	}
	
	///////////////////////////////////
	///////      Selection      ///////
	///////////////////////////////////
	newSelection(event, element) {
		var range;
		
		if (element.type === "column") {
			if(!this.columnSelection){
				return;
			}
			
			if (element === this.rowHeader) {
				range = this.resetRanges();
				this.selecting = "all";
				
				var topLeftCell, bottomRightCell = this.getCell(-1, -1);
				
				if(this.rowHeader){
					topLeftCell = this.getCell(0, 1);
				}else{
					topLeftCell = this.getCell(0, 0);
				}
				
				range.setBounds(topLeftCell, bottomRightCell);		
				return;
			} else {
				this.selecting = "column";
			}
		} else if (element.column === this.rowHeader) {
			this.selecting = "row";
		} else {
			this.selecting = "cell";
		}
		
		if (event.shiftKey) {
			this.activeRange.setBounds(false, element);
		} else if (event.ctrlKey) {
			this.addRange().setBounds(element);
		} else {
			this.resetRanges().setBounds(element);
		}
	}
	
	autoScroll(range, row, column) {
		var tableHolder = this.table.rowManager.element,
		rect, view, withinHorizontalView, withinVerticalView;
		
		if (typeof row === 'undefined') {
			row = this.getRowByRangePos(range.end.row).getElement();
		}
		
		if (typeof column === 'undefined') {
			column = this.getColumnByRangePos(range.end.col).getElement();
		}
		
		rect = {
			left: column.offsetLeft,
			right: column.offsetLeft + column.offsetWidth,
			top: row.offsetTop,
			bottom: row.offsetTop + row.offsetHeight,
		};
		
		view = {
			left: tableHolder.scrollLeft + this.getRowHeaderWidth(),
			right: Math.ceil(tableHolder.scrollLeft + tableHolder.clientWidth),
			top: tableHolder.scrollTop,
			bottom:	tableHolder.scrollTop +	tableHolder.offsetHeight - this.table.rowManager.scrollbarWidth,
		};
		
		withinHorizontalView = view.left < rect.left &&	rect.left < view.right && view.left < rect.right &&	rect.right < view.right;
		
		withinVerticalView = view.top < rect.top &&	rect.top < view.bottom && view.top < rect.bottom &&	rect.bottom < view.bottom;
		
		if (!withinHorizontalView) {
			if (rect.left < view.left) {
				tableHolder.scrollLeft = rect.left - this.getRowHeaderWidth();
			} else if (rect.right > view.right) {
				tableHolder.scrollLeft = Math.min(rect.right - tableHolder.clientWidth, rect.left - this.getRowHeaderWidth());
			}
		}
		
		if (!withinVerticalView) {
			if (rect.top < view.top) {
				tableHolder.scrollTop = rect.top;
			} else if (rect.bottom > view.bottom) {
				tableHolder.scrollTop = rect.bottom - tableHolder.clientHeight;
			}
		}
	}
	
	
	///////////////////////////////////
	///////       Layout        ///////
	///////////////////////////////////
	
	layoutChange(){
		this.overlay.style.visibility = "hidden";
		clearTimeout(this.layoutChangeTimeout);
		this.layoutChangeTimeout = setTimeout(this.layoutRanges.bind(this), 200);
	}
	
	redraw(force) {
		if (force) {
			this.selecting = 'cell';
			this.resetRanges();
			this.layoutElement();
		}
	}
	
	layoutElement(visibleRows) {
		var rows;
		
		if (visibleRows) {
			rows = this.table.rowManager.getVisibleRows(true);
		} else {
			rows = this.table.rowManager.getRows();
		}
		
		rows.forEach((row) => {
			if (row.type === "row") {
				this.layoutRow(row);
				row.cells.forEach((cell) => this.renderCell(cell));
			}
		});
		
		this.getTableColumns().forEach((column) => {
			this.layoutColumn(column);
		});
		
		this.layoutRanges();
	}
	
	layoutRow(row) {
		var el = row.getElement(),
		selected = false,
		occupied = this.ranges.some((range) => range.occupiesRow(row));
		
		if (this.selecting === "row") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}
		
		el.classList.toggle("tabulator-range-selected", selected);
		el.classList.toggle("tabulator-range-highlight", occupied);
	}
	
	layoutColumn(column) {
		var el = column.getElement(),		
		selected = false,
		occupied = this.ranges.some((range) => range.occupiesColumn(column));
		
		if (this.selecting === "column") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}
		
		el.classList.toggle("tabulator-range-selected", selected);
		el.classList.toggle("tabulator-range-highlight", occupied);
	}
	
	layoutRanges() {
		var activeCell, activeCellEl, activeRowEl;
		
		if (!this.table.initialized) {
			return;
		}
		
		activeCell = this.getActiveCell();
		
		if (!activeCell) {
			return;
		}

		activeCellEl = activeCell.getElement();
		activeRowEl = activeCell.row.getElement();

		if(this.table.rtl){
			this.activeRangeCellElement.style.right = activeRowEl.offsetWidth - activeCellEl.offsetLeft - activeCellEl.offsetWidth + "px";
		}else{
			this.activeRangeCellElement.style.left = activeRowEl.offsetLeft + activeCellEl.offsetLeft + "px";
		}

		this.activeRangeCellElement.style.top =	activeRowEl.offsetTop + "px";
		this.activeRangeCellElement.style.width = activeCellEl.offsetWidth + "px";
		this.activeRangeCellElement.style.height =  activeRowEl.offsetHeight  + "px";
		
		this.ranges.forEach((range) => range.layout());
		
		this.overlay.style.visibility = "visible";
	}
	
	
	///////////////////////////////////
	///////  Helper Functions   ///////
	///////////////////////////////////	
	
	getCell(rowIdx, colIdx) {
		var row;
		
		if (colIdx < 0) {
			colIdx = this.getTableColumns().length + colIdx;
			if (colIdx < 0) {
				return null;
			}
		}
		
		if (rowIdx < 0) {
			rowIdx = this.getTableRows().length + rowIdx;
		}
		
		row = this.table.rowManager.getRowFromPosition(rowIdx + 1);
		
		return row ? row.getCells(false, true).filter((cell) => cell.column.visible)[colIdx] : null;
	}
	
	
	getActiveCell() {
		return this.getCell(this.activeRange.start.row, this.activeRange.start.col);
	}
	
	getRowByRangePos(pos) {
		return this.getTableRows()[pos];
	}
	
	getColumnByRangePos(pos) {
		return this.getTableColumns()[pos];
	}
	
	getTableRows() {
		return this.table.rowManager.getDisplayRows().filter(row=> row.type === "row");
	}
	
	getTableColumns() {
		return this.table.columnManager.getVisibleColumnsByIndex();
	}
	
	addRange(start, end) {
		var  range;
		
		if(this.maxRanges !== true && this.ranges.length >= this.maxRanges){
			this.ranges.shift().destroy();
		}
		
		range = new Range(this.table, this, start, end);
		
		this.activeRange = range;
		this.ranges.push(range);
		this.rangeContainer.appendChild(range.element);
		
		return range;
	}
	
	resetRanges() {
		var range, cell, visibleCells;
		
		this.ranges.forEach((range) => range.destroy());
		this.ranges = [];
		
		range = this.addRange();
		
		if(this.table.rowManager.activeRows.length){
			visibleCells = this.table.rowManager.activeRows[0].cells.filter((cell) => cell.column.visible);
			cell = visibleCells[this.rowHeader ? 1 : 0];

			if(cell){
				range.setBounds(cell);
				if(this.options("selectableRangeAutoFocus")){
					this.initializeFocus(cell);
				}
			}
		}
		
		return range;
	}
	
	tableDestroyed(){
		document.removeEventListener("mouseup", this.mouseUpEvent);
		this.table.rowManager.element.removeEventListener("keydown", this.keyDownEvent);
	}
	
	selectedRows(component) {
		return component ? this.activeRange.getRows().map((row) => row.getComponent()) : this.activeRange.getRows();
	}
	
	selectedColumns(component) {
		return component ? this.activeRange.getColumns().map((col) => col.getComponent()) : this.activeRange.getColumns();
	}

	getRowHeaderWidth(){
		if(!this.rowHeader){
			return 0;
		}
		return this.rowHeader.getElement().offsetWidth;
	}

	isEmpty(value) {
		return value === null || value === undefined || value === "";
	}
}
