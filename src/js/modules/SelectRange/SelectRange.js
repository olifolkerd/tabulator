import Module from "../../core/Module.js";
import Range from "./Range.js";

class SelectRange extends Module {
	constructor(table) {
		super(table);
		
		this.selecting = "cell";
		this.mousedown = false;
		this.ranges = [];
		this.rowHeaderField = "--row-header";
		this.overlay = null;
		this.layoutChangeTimeout = null;
		
		this.keyDownEvent = this._handleKeyDown.bind(this);
		this.mouseUpEvent = this._handleMouseUp.bind(this);
		
		this.registerTableOption("selectableRange", false); //enable selectable range
		this.registerTableOption("selectableRangeRowHeader", {}); //row header definition
		this.registerTableFunction("getSelectedData", this.getSelectedData.bind(this));
		this.registerTableFunction("getActiveRange", this.getActiveRange.bind(this, true));
		this.registerComponentFunction("cell", "getRange", this.cellGetRange.bind(this));
		this.registerComponentFunction("row", "getRange", this.rowGetRange.bind(this));
		this.registerComponentFunction("column", "getRange", this.collGetRange.bind(this));
	}

	///////////////////////////////////
	///////    Initialization   ///////
	///////////////////////////////////
	
	initialize() {
		if (this.table.options.selectableRange) {		
			if(!this.table.options.selectable){
				this.initializeTable();
				this.initializeWatchers();
			}else{
				console.warn("SelectRange functionality cannot be used in conjunction with row selection");
			}
		}
	}
	
	initializeWatchers() {
		this.subscribe("column-init", this.initializeColumn.bind(this));
		this.subscribe("column-mousedown", this.handleColumnMouseDown.bind(this));
		this.subscribe("column-mousemove", this.handleColumnMouseMove.bind(this));
		this.subscribe("column-resized", this.handleColumnResized.bind(this));
		this.subscribe("columns-loading", this.handleColumnsLoading.bind(this));
		this.subscribe("cell-mousedown", this.handleCellMouseDown.bind(this));
		this.subscribe("cell-mousemove", this.handleCellMouseMove.bind(this));
		this.subscribe("cell-dblclick", this.handleCellDblClick.bind(this));
		this.subscribe("cell-rendered", this.renderCell.bind(this));
		this.subscribe("cell-editing", this.handleEditingCell.bind(this));
		this.subscribe("edit-success", this.finishEditingCell.bind(this));
		this.subscribe("edit-cancelled", this.finishEditingCell.bind(this));
		this.subscribe("page-changed", this.redraw.bind(this));
		this.subscribe("table-layout", this.layoutElement.bind(this));
		this.subscribe("table-redraw", this.redraw.bind(this));
		this.subscribe("scroll-vertical", this.layoutChange.bind(this));
		this.subscribe("scroll-horizontal", this.layoutChange.bind(this));
		this.subscribe("column-width", this.layoutChange.bind(this));
		this.subscribe("column-height", this.layoutChange.bind(this));
		this.subscribe("column-resized", this.layoutChange.bind(this));
		this.subscribe("cell-height", this.layoutChange.bind(this));
		this.subscribe("table-destroy", this.tableDestroyed.bind(this));
		
		this.subscribe("keybinding-nav-prev", this.keyNavigate.bind(this, "left"));
		this.subscribe("keybinding-nav-next", this.keyNavigate.bind(this, "right"));
		this.subscribe("keybinding-nav-left", this.keyNavigate.bind(this, "left"));
		this.subscribe("keybinding-nav-right", this.keyNavigate.bind(this, "right"));
		this.subscribe("keybinding-nav-up", this.keyNavigate.bind(this, "up"));
		this.subscribe("keybinding-nav-down", this.keyNavigate.bind(this, "down"));
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
		
		if (this.table.modules.edit) {
			this.table.modules.edit.elementToFocusOnBlur = this.table.rowManager.element;
		}
	}

	initializeColumn(column) {
		if (column.modules.edit) {
			// Block editor from taking action so we can trigger edit by
			// double clicking.
			column.modules.edit.blocked = true;
		}
	}
	
	///////////////////////////////////
	/////// Component Functions ///////
	///////////////////////////////////
	
	cellGetRange(cell){
		var range;
		
		if (cell.column.field === this.rowHeaderField) {
			range = this.ranges.find((range) => range.occupiesRow(cell.row));
		} else {
			range = this.ranges.find((range) => range.occupies(cell));
		}
		
		return range ? range.getComponent() : null;
	}
	
	rowGetRange(row){
		var range = this.ranges.find((range) => range.occupiesRow(row));

		return range ? range.getComponent() : null;
	}
	
	collGetRange(col){
		var range = this.ranges.find((range) => range.occupiesColumn(col));
			
		return range ? range.getComponent() : null;
	}

	///////////////////////////////////
	////////// Event Handlers /////////
	///////////////////////////////////
	
	_handleMouseUp(e){
		this.mousedown = false;
		document.removeEventListener("mouseup", this.mouseUpEvent);
	}
	
	_handleKeyDown(e) {
		if (e.key === "Enter") {
			// prevent action when pressing enter from editor
			if (!e.target.classList.contains("tabulator-tableholder")) {
				return;
			}
					
			// is editing a cell?
			if (this.table.modules.edit && this.table.modules.edit.currentCell) {
				return;
			}
			
			this.editCell(this.getActiveCell());
			e.preventDefault();
		}
	}

	///////////////////////////////////
	////// Column Functionality ///////
	///////////////////////////////////

	handleColumnsLoading() {
		var customRowHeader = this.options("selectableRangeRowHeader");
		
		var rowHeaderDef = {
			title: "",
			field: this.rowHeaderField,
			headerSort: false,
			resizable: false,
			frozen: true,
			editable: false,
			formatter: "rownum",
			formatterParams: { relativeToPage: true },
			
			...customRowHeader,
			
			cssClass: customRowHeader.cssClass ? `tabulator-range-row-header ${customRowHeader.cssClass}` : "tabulator-range-row-header",
		};
		this.rowHeaderField = rowHeaderDef.field;
		// Add this column before everything else
		this.table.columnManager._addColumn(rowHeaderDef);
	}
	
	handleColumnResized(column) {
		if (this.selecting !== "column" && this.selecting !== "all") {
			return;
		}
		
		var selected = this.ranges.some((range) => range.occupiesColumn(column));
		
		if (!selected) {
			return;
		}
		
		this.ranges.forEach((range) => {
			var selectedColumns = range.getColumns();
			selectedColumns.forEach((selectedColumn) => {
				if (selectedColumn !== column) {
					selectedColumn.setWidth(column.width);
				}
			});
		});
	}
	
	handleColumnMouseDown(event, column) {
		if (event.button === 2 && (this.selecting === "column" || this.selecting === "all") && this.getActiveRange().occupiesColumn(column)) {
			return;
		}
		
		this.mousedown = true;
		
		document.addEventListener("mouseup", this.mouseUpEvent);
		
		this._select(event, column);
		this.layoutElement();
	}
	
	handleColumnMouseMove(e, column) {
		if (column.field === this.rowHeaderField || !this.mousedown || this.selecting === 'all') {
			return;
		}
		
		this.endSelection(column);
		this.layoutElement(true);
	}

	///////////////////////////////////
	//////// Cell Functionality ///////
	///////////////////////////////////

	renderCell(cell) {
		var el = cell.getElement();
		
		var rangeIdx = this.ranges.findIndex((range) => range.occupies(cell));
		
		el.classList.toggle("tabulator-range-selected", rangeIdx !== -1);
		
		el.classList.toggle("tabulator-range-only-cell-selected", this.ranges.length === 1 && this.ranges[0].atTopLeft(cell) &&	this.ranges[0].atBottomRight(cell));
		
		el.dataset.range = rangeIdx;
	}
	
	handleCellMouseDown(event, cell) {
		if (event.button === 2 && (this.getActiveRange().occupies(cell) || ((this.selecting === "row" || this.selecting === "all") && this.getActiveRange().occupiesRow(cell.row)))) {
			return;
		}
		
		this.mousedown = true;
		
		document.addEventListener("mouseup", this.mouseUpEvent);
		
		this._select(event, cell);
		this.layoutElement();
	}

	handleCellMouseMove(e, cell) {
		if (!this.mousedown || this.selecting === "all") {
			return;
		}
		
		this.endSelection(cell);
		this.layoutElement(true);
	}
	
	handleCellDblClick(e, cell) {
		if (cell.column.field === this.rowHeaderField) {
			return;
		}
		
		this.editCell(cell);
	}
	
	editCell(cell) {
		if (!cell.column.modules.edit) {
			cell.column.modules.edit = {};
		}
		cell.column.modules.edit.blocked = false;
		cell.element.focus({ preventScroll: true });
		cell.column.modules.edit.blocked = true;
	}
	
	handleEditingCell() {
		this.table.rowManager.element.removeEventListener("keydown", this.keyDownEvent);
	}
	
	finishEditingCell() {
		this.table.rowManager.element.focus();
		this.table.rowManager.element.addEventListener("keydown", this.keyDownEvent);
	}

	///////////////////////////////////
	///////     Navigation      ///////
	///////////////////////////////////

	keyNavigate(dir, e){
		if(this.navigate("normal", dir)){
			e.preventDefault();
		}
	}
	
	navigate(mode, dir) {
		// Don't navigate while editing
		if (this.table.modules.edit && this.table.modules.edit.currentCell) {
			return false;
		}
		

		// If there are more than 1 range, use the active range and destroy the others
		if (this.ranges.length > 1) {
			this.ranges = this.ranges.filter((range) => {
				if (range === this.getActiveRange()) {
					range.setEnd(range.start.row, range.start.col);
					return true;
				}
				range.destroy();
				return false;
			});
		}
		
		var range = this.getActiveRange();
		
		var moved = false;
		
		switch (mode) {
			case "normal": {
				let nextRow = range.start.row;
				let nextCol = range.start.col;
				
				if (dir === "left") {
					nextCol = Math.max(nextCol - 1, 0);
				} else if (dir === "right") {
					nextCol = Math.min(nextCol + 1, this.getColumns().length - 2);
				} else if (dir === "up") { 
					nextRow = Math.max(nextRow - 1, 0);
				} else if (dir === "down") {
					nextRow = Math.min(nextRow + 1, this.getRows().length - 1);
				}
				
				if (nextCol !== range.start.col || nextRow !== range.start.row) {
					moved = true;
				}
				
				range.setStart(nextRow, nextCol);
				range.setEnd(nextRow, nextCol);
				
				this.selecting = "cell";
				
				break;
			}
			case "expand": {
				if ((dir === 'left' || dir === 'right') && this.selecting === 'row') {
					break;
				}
				
				if ((dir === 'up' || dir === 'down') && this.selecting === 'column') {
					break;
				}
				
				let nextRow = range.end.row;
				let nextCol = range.end.col;
				
				if (dir === "left") {
					nextCol = Math.max(nextCol - 1, 0);
				} else if (dir === "right") {
					nextCol = Math.min(nextCol + 1, this.getColumns().length - 2);
				} else if (dir === "up") { 
					nextRow = Math.max(nextRow - 1, 0);
				} else if (dir === "down") {
					nextRow = Math.min(nextRow + 1, this.getRows().length - 1);
				}
				
				if (nextCol !== range.end.col || nextRow !== range.end.row) {
					moved = true;
				}
				
				range.setEnd(nextRow, nextCol);
				
				break;
			}
			case "jump": {
				let nextRow = range.start.row;
				let nextCol = range.start.col;
				
				if (dir === "left") {
					nextCol = this.findJumpCellLeft(range.start.row, range.start.col);
				} else if (dir === "right") {
					nextCol = this.findJumpCellRight(range.start.row, range.start.col);
				} else if (dir === "up") {
					nextRow = this.findJumpCellUp(range.start.row, range.start.col);
				} else if (dir === "down") {
					nextRow = this.findJumpCellDown(range.start.row, range.start.col);
				}
				
				if (nextCol !== range.start.col || nextRow !== range.start.row) {
					moved = true;
				}
				
				range.setStart(nextRow, nextCol);
				range.setEnd(nextRow, nextCol);
				
				this.selecting = "cell";
				
				break;
			}
			case "expand-jump": {
				let nextRow = range.end.row;
				let nextCol = range.end.col;
				
				if (dir === "left") {
					nextCol = this.findJumpCellLeft(range.start.row, range.end.col);
				} else if (dir === "right") {
					nextCol = this.findJumpCellRight(range.start.row, range.end.col);
				} else if (dir === "up") {
					nextRow = this.findJumpCellUp(range.end.row, range.start.col);
				} else if (dir === "down") {
					nextRow = this.findJumpCellDown(range.end.row, range.start.col);
				}
				
				if (nextCol !== range.end.col || nextRow !== range.end.row) {
					moved = true;
				}
				
				range.setEnd(nextRow, nextCol);
				
				break;
			}
		}
		
		if (!moved) {
			return;
		}
		
		var row = this.getRowByRangePos(range.end.row);
		var column = this.getColumnByRangePos(range.end.col);
		
		if ((dir === 'left' || dir === 'right') && column.getElement().parentNode === null) {
			column.getComponent().scrollTo(undefined, false);
		} else if ((dir === 'up' || dir === 'down') && row.getElement().parentNode === null) {
			row.getComponent().scrollTo(undefined, false);
		} else {
			// Use faster autoScroll when the elements are on the DOM
			this.autoScroll(range, row.getElement(), column.getElement());
		}
		
		this.layoutElement();
		
		return true;
	}

	findJumpCellLeft(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos);
		var cells = row.cells.filter((cell) => cell.column.visible);
		var isStartingCellEmpty = !cells[colPos + 1].getValue();
		var isLeftOfStartingCellEmpty = cells[colPos] ? !cells[colPos].getValue() : false;
		var jumpCol = colPos;
		
		// Go until we find an empty / non-empty cell.
		for (var i = colPos; i > 0; i--){
			var currentCell = cells[i];
			if (isStartingCellEmpty) {
				if (!currentCell.getValue()) {
					continue;
				}
				
				if (currentCell.getValue()) {
					jumpCol = currentCell.column.getPosition() - 2;
					break;
				}
			} else {
				if (!isLeftOfStartingCellEmpty && !currentCell.getValue()) {
					break;
				}
				
				jumpCol = currentCell.column.getPosition() - 2;
				
				if (isLeftOfStartingCellEmpty) {
					if (!currentCell.getValue()) {
						continue;
					}
					if (currentCell.getValue()) {
						break;
					}
				}
				
				jumpCol = currentCell.column.getPosition() - 2;
				if (currentCell.getValue()) {
					continue;
				}
			}
		}
		
		return jumpCol;
	}
	
	findJumpCellRight(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos);
		var cells = row.cells.filter((cell) => cell.column.visible);
		var isStartingCellEmpty = !cells[colPos + 1].getValue();
		var isRightOfStartingCellEmpty = cells[colPos + 2] ? !cells[colPos + 2].getValue() : false;
		var jumpCol = colPos;
		
		for (var i = colPos + 2; i < cells.length; i++){
			var currentCell = cells[i];
			if (isStartingCellEmpty) {
				if (!currentCell.getValue()) {
					continue;
				}
				
				if (currentCell.getValue()) {
					jumpCol = currentCell.column.getPosition() - 2;
					break;
				}
			} else {
				if (!isRightOfStartingCellEmpty && !currentCell.getValue()) {
					break;
				}
				
				jumpCol = currentCell.column.getPosition() - 2;
				
				if (isRightOfStartingCellEmpty) {
					if (!currentCell.getValue()) {
						continue;
					}
					if (currentCell.getValue()) {
						break;
					}
				}
				
				if (currentCell.getValue()) {
					continue;
				}
			}
		}
		
		return jumpCol;
	}
	
	findJumpCellUp(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos);
		var cells = column.cells.filter((cell) => this.table.rowManager.activeRows.includes(cell.row));
		var isStartingCellEmpty = !cells[rowPos].getValue();
		var isTopOfStartingCellEmpty = cells[rowPos - 1] ? !cells[rowPos - 1].getValue() : false;
		var jumpRow = rowPos;
		
		for (var i = jumpRow - 1; i >= 0; i--){
			var currentCell = cells[i];
			if (isStartingCellEmpty) {
				jumpRow = currentCell.row.position - 1;
				
				if (currentCell.getValue()) {
					break;
				}
				
				if (!currentCell.getValue()) {
					continue;
				}
			} else {
				if (!isTopOfStartingCellEmpty && !currentCell.getValue()) {
					break;
				}
				
				jumpRow = currentCell.row.position - 1;
				
				if (isTopOfStartingCellEmpty) {
					if (!currentCell.getValue()) {
						continue;
					}
					if (currentCell.getValue()) {
						break;
					}
				}
				
				if (currentCell.getValue()) {
					continue;
				}
			}
		}
		
		return jumpRow;
	}
	
	findJumpCellDown(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos);
		var cells = column.cells.filter((cell) => this.table.rowManager.activeRows.includes(cell.row));
		var isStartingCellEmpty = !cells[rowPos].getValue();
		var isBottomOfStartingCellEmpty = cells[rowPos + 1] ? !cells[rowPos + 1].getValue() : false;
		var jumpRow = rowPos;
		
		for (var i = jumpRow + 1; i < cells.length; i++){
			var currentCell = cells[i];
			if (isStartingCellEmpty) {
				jumpRow = currentCell.row.position - 1;
				
				if (currentCell.getValue()) {
					break;
				}
				
				if (!currentCell.getValue()) {
					continue;
				}
			} else {
				if (!isBottomOfStartingCellEmpty && !currentCell.getValue()) {
					break;
				}
				
				jumpRow = currentCell.row.position - 1;
				
				if (isBottomOfStartingCellEmpty) {
					if (!currentCell.getValue()) {
						continue;
					}
					if (currentCell.getValue()) {
						break;
					}
				}
				
				if (currentCell.getValue()) {
					continue;
				}
			}
		}
		
		return jumpRow;
	}

	///////////////////////////////////
	///////      Selection      ///////
	///////////////////////////////////

	_select(event, element) {
		if (element.type === "column") {
			if (element.field === this.rowHeaderField) {
				this.resetRanges();
				this.selecting = "all";
				
				const topLeftCell = this.getCell(0, 0);
				const bottomRightCell = this.getCell(-1, -1);
				
				this.beginSelection(topLeftCell);
				this.endSelection(bottomRightCell);
				
				return;
			} else {
				this.selecting = "column";
			}
		} else if (element.column.field === this.rowHeaderField) {
			this.selecting = "row";
		} else {
			this.selecting = "cell";
		}
		
		if (event.shiftKey) {
			if (this.ranges.length > 1) {
				this.ranges = this.ranges.slice(-1);
			}
			
			this.endSelection(element);
		} else if (event.ctrlKey) {
			this.addRange();
			
			this.beginSelection(element);
			this.endSelection(element);
		} else {
			this.resetRanges();
			
			this.beginSelection(element);
			this.endSelection(element);
		}
	}

	beginSelection(element) {
		var range = this.getActiveRange();
		
		if (element.type === "column") {
			range.setStart(0, element.getPosition() - 2);
			return;
		}
		
		var row = element.row.position - 1;
		var col = element.column.getPosition() - 2;
		
		if (element.column.field === this.rowHeaderField) {
			range.setStart(row, 0);
		} else {
			range.setStart(row, col);
		}
	}
	
	endSelection(element) {
		var range = this.getActiveRange();
		var rowsCount = this.getRows().length;
		
		if (element.type === "column") {
			if (this.selecting === "column") {
				range.setEnd(rowsCount - 1, element.getPosition() - 2);
			} else if (this.selecting === "cell") {
				range.setEnd(0, element.getPosition() - 2);
			}
			return;
		}
		
		var row = element.row.position - 1;
		var col = element.column.getPosition() - 2;
		var isRowHeader = element.column.field === this.rowHeaderField;
		
		if (this.selecting === "row") {
			range.setEnd(row, this.getColumns().length - 2);
		} else if (this.selecting !== "row" && isRowHeader) {
			range.setEnd(row, 0);
		} else if (this.selecting === "column") {
			range.setEnd(rowsCount - 1, col);
		} else {
			range.setEnd(row, col);
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
	
	autoScroll(range, row, column) {
		var tableHolder = this.table.rowManager.element;
		var rowHeader = this.rowHeaderColumn.getElement();
		if (typeof row === 'undefined') {
			row = this.getRowByRangePos(range.end.row).getElement();
		}
		if (typeof column === 'undefined') {
			column = this.getColumnByRangePos(range.end.col).getElement();
		}
		
		var rect = {
			left: column.offsetLeft,
			right: column.offsetLeft + column.offsetWidth,
			top: row.offsetTop,
			bottom: row.offsetTop + row.offsetHeight,
		};
		
		var view = {
			left: tableHolder.scrollLeft + rowHeader.offsetWidth,
			right: Math.ceil(tableHolder.scrollLeft + tableHolder.clientWidth),
			top: tableHolder.scrollTop,
			bottom:	tableHolder.scrollTop +	tableHolder.offsetHeight - this.table.rowManager.scrollbarWidth,
		};
		
		var withinHorizontalView = view.left < rect.left &&	rect.left < view.right && view.left < rect.right &&	rect.right < view.right;
		
		var withinVerticalView = view.top < rect.top &&	rect.top < view.bottom && view.top < rect.bottom &&	rect.bottom < view.bottom;
		
		if (!withinHorizontalView) {
			if (rect.left < view.left) {
				tableHolder.scrollLeft = rect.left - rowHeader.offsetWidth;
			} else if (rect.right > view.right) {
				tableHolder.scrollLeft = rect.right - tableHolder.clientWidth;
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
		
		this.getColumns().forEach((column) => {
			this.layoutColumn(column);
		});
		
		this.layoutRanges();
	}
	
	layoutRow(row) {
		var el = row.getElement();
		
		var selected = false;
		var occupied = this.ranges.some((range) => range.occupiesRow(row));
		
		if (this.selecting === "row") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}
		
		el.classList.toggle("tabulator-range-selected", selected);
		el.classList.toggle("tabulator-range-highlight", occupied);
	}
	
	layoutColumn(column) {
		var el = column.getElement();
		
		var selected = false;
		var occupied = this.ranges.some((range) => range.occupiesColumn(column));
		
		if (this.selecting === "column") {
			selected = occupied;
		} else if (this.selecting === "all") {
			selected = true;
		}
		
		el.classList.toggle("tabulator-range-selected", selected);
		el.classList.toggle("tabulator-range-highlight", occupied);
	}
	
	layoutRanges() {
		if (!this.table.initialized) {
			return;
		}
		
		var activeCell = this.getActiveCell();
		
		if (!activeCell) {
			return;
		}
		
		this.activeRangeCellElement.style.left = activeCell.row.getElement().offsetLeft + activeCell.getElement().offsetLeft + "px";
		this.activeRangeCellElement.style.top =	activeCell.row.getElement().offsetTop + "px";
		this.activeRangeCellElement.style.width = activeCell.getElement().offsetLeft + activeCell.getElement().offsetWidth - activeCell.getElement().offsetLeft + "px";
		this.activeRangeCellElement.style.height = activeCell.row.getElement().offsetTop + activeCell.row.getElement().offsetHeight - activeCell.row.getElement().offsetTop + "px";
		
		this.ranges.forEach((range) => this.layoutRange(range));
		
		this.overlay.style.visibility = "visible";
	}
	
	layoutRange(range) {
		var _vDomTop = this.table.rowManager.renderer.vDomTop;
		var _vDomBottom = this.table.rowManager.renderer.vDomBottom;
		var _vDomLeft = this.table.columnManager.renderer.leftCol;
		var _vDomRight = this.table.columnManager.renderer.rightCol;
		
		if (_vDomTop == null) {
			_vDomTop = 0;
		}
		
		if (_vDomBottom == null) {
			_vDomBottom = Infinity;
		}
		
		if (_vDomLeft == null) {
			_vDomLeft = 0;
		}
		
		if (_vDomRight == null) {
			_vDomRight = Infinity;
		}
		
		if (!range.overlaps(_vDomLeft, _vDomTop, _vDomRight, _vDomBottom)) {
			return;
		}
		
		var top = Math.max(range.top, _vDomTop);
		var bottom = Math.min(range.bottom, _vDomBottom);
		var left = Math.max(range.left, _vDomLeft);
		var right = Math.min(range.right, _vDomRight);
		
		var topLeftCell = this.getCell(top, left);
		var bottomRightCell = this.getCell(bottom, right);
		
		range.element.classList.toggle("tabulator-range-active", range === this.getActiveRange());
		
		range.element.style.left = topLeftCell.row.getElement().offsetLeft + topLeftCell.getElement().offsetLeft + "px";
		range.element.style.top = topLeftCell.row.getElement().offsetTop + "px";
		range.element.style.width = bottomRightCell.getElement().offsetLeft + bottomRightCell.getElement().offsetWidth - topLeftCell.getElement().offsetLeft + "px";
		range.element.style.height = bottomRightCell.row.getElement().offsetTop + bottomRightCell.row.getElement().offsetHeight - topLeftCell.row.getElement().offsetTop + "px";
	}


	///////////////////////////////////
	///////  Helper Functions   ///////
	///////////////////////////////////
	
	findRangeByCellElement(cell) {
		var rangeIdx = cell.dataset.range;
		if (rangeIdx < 0) {
			return;
		}
		return this.ranges[rangeIdx].getComponent();
	}
	
	getCell(rowIdx, colIdx) {
		if (rowIdx < 0) {
			rowIdx = this.getRows().length + rowIdx;
		}
		
		var row = this.table.rowManager.getRowFromPosition(rowIdx + 1);
		
		if (!row) {
			return null;
		}
		
		if (colIdx < 0) {
			colIdx = this.getColumns().length + colIdx - 1;
		}
		
		if (colIdx < 0) {
			return null;
		}
		
		return row.getCells().filter((cell) => cell.column.visible)[colIdx + 1];
	}
	
	getActiveRange(component) {
		const range = this.ranges[this.ranges.length - 1];
		if (!range) {
			return null;
		}
		if (component) {
			return range.getComponent();
		}
		return range;
	}
	
	getActiveCell() {
		var activeRange = this.getActiveRange();
		return this.getCell(activeRange.start.row, activeRange.start.col);
	}
	
	getRowByRangePos(pos) {
		return this.getRows()[pos];
	}
	
	getColumnByRangePos(pos) {
		return this.getColumns()[pos + 1];
	}
	
	getRowsByRange(range) {
		return this.getRows() .slice(range.top, range.bottom + 1);
	}
	
	getColumnsByRange(range) {
		return this.getColumns() .slice(range.left + 1, range.right + 2);
	}
	
	getRows() {
		return this.table.rowManager.getDisplayRows();
	}
	
	getColumns() {
		return this.table.columnManager.getVisibleColumnsByIndex();
	}
	
	addRange() {
		var element = document.createElement("div");
		element.classList.add("tabulator-range");
		
		var range = new Range(this.table, 0, 0, element);
		
		this.ranges.push(range);
		this.rangeContainer.appendChild(element);
	}
	
	resetRanges() {
		this.ranges.forEach((range) => range.destroy());
		this.ranges = [];
		this.addRange(0, 0);
	}

	tableDestroyed(){
		document.removeEventListener("mouseup", this.mouseUpEvent);
		this.table.rowManager.element.removeEventListener("keydown", this.keyDownEvent);
	}


	getSelectedData() {
		return this.getDataByRange(this.getActiveRange());
	}
	
	getDataByRange(range) {
		var data = [];
		var rows = this.getRowsByRange(range);
		var columns = this.getColumnsByRange(range);
		
		rows.forEach((row) => {
			var rowData = row.getData();
			var result = {};
			columns.forEach((column) => {
				result[column.field] = rowData[column.field];
			});
			data.push(result);
		});
		
		return data;
	}
	
	getCellsByRange(range, structured) {
		var cells = [];
		var rows = this.getRowsByRange(range);
		var columns = this.getColumnsByRange(range);
		
		if (structured) {
			cells = rows.map((row) => {
				var arr = [];
				row.getCells().forEach((cell) => {
					if (columns.includes(cell.column)) {
						arr.push(cell.getComponent());
					}
				});
				return arr;
			});
		} else {
			rows.forEach((row) => {
				row.getCells().forEach((cell) => {
					if (columns.includes(cell.column)) {
						cells.push(cell.getComponent());
					}
				});
			});
		}
		
		return cells;
	}
	
	get selectedRows() {
		return this.getRowsByRange(this.getActiveRange());
	}
	
	get selectedColumns() {
		return this.getColumnsByRange(this.getActiveRange()).map((col) => col.getComponent());
	}
	
	get rowHeaderColumn() {
		return this.table.columnManager.columnsByField[this.rowHeaderField];
	}
}

SelectRange.moduleName = "selectRange";

export default SelectRange;
