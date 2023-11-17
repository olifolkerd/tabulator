import Module from "../../core/Module.js";
import Helpers from "../../core/tools/Helpers.js";
import Range from "./Range.js";

class Spreadsheet extends Module {
	constructor(table) {
		super(table);

		this.selecting = "cell";
		this.mousedown = false;
		this.ranges = [];
		this.rowHeaderField = "--row-header";
		this.overlay = null;

		this.registerTableOption("spreadsheet", false); //enable spreadsheet
		this.registerTableOption("spreadsheetRowHeader", {}); //row header definition

		this.registerColumnOption("__spreadsheet_editable");
		this.registerColumnOption("__spreadsheet_editor");
	}

	initialize() {
		if (!this.table.options.spreadsheet) {
			return;
		}

		this.initializeTable();
		this.initializeWatchers();
		this.initializeFunctions();
		if (this.table.modules.menu) {
			this.initializeMenuNavigation();
		}
	}

	initializeWatchers() {
		this.subscribe("column-mousedown", this.handleColumnMouseDown.bind(this));
		this.subscribe("column-mousemove", this.handleColumnMouseMove.bind(this));
		this.subscribe("cell-mousedown", this.handleCellMouseDown.bind(this));
		this.subscribe("cell-mousemove", this.handleCellMouseMove.bind(this));
		this.subscribe("cell-dblclick", this.handleCellDblClick.bind(this));
		this.subscribe("cell-rendered", this.renderCell.bind(this));
		this.subscribe("edit-success", this.finishEditingCell.bind(this));
		this.subscribe("edit-cancelled", this.finishEditingCell.bind(this));
		this.subscribe("page-changed", this.handlePageChanged.bind(this));
		this.subscribe("table-layout", this.layoutElement.bind(this));

		var debouncedLayoutRanges = Helpers.debounce(this.layoutRanges.bind(this), 200);
		var layoutRanges = () => {
			this.overlay.style.visibility = "hidden";
			debouncedLayoutRanges();
		};

		if ("onscrollend" in window) {
			var scrolling = false;
			var handleScrollEnd = () => {
				this.layoutRanges();
				this.table.rowManager.element.removeEventListener("scrollend", handleScrollEnd);
				scrolling = false;
			};
			var handleScroll = () => {
				this.overlay.style.visibility = "hidden";
				if (scrolling) {
					return;
				}
				scrolling = true;
				this.table.rowManager.element.addEventListener("scrollend", handleScrollEnd);
			};
			this.subscribe("scroll-vertical", handleScroll);
			this.subscribe("scroll-horizontal", handleScroll);
		} else {
			this.subscribe("scroll-vertical", layoutRanges);
			this.subscribe("scroll-horizontal", layoutRanges);
		}

		this.subscribe("column-width", layoutRanges);
		this.subscribe("column-height", layoutRanges);
		this.subscribe("column-resized", layoutRanges);
		this.subscribe("cell-height", layoutRanges);

		var navigate = (mode, dir) => {
			var self = this;
			return function (e) {
				if(self.navigate(mode, dir)) {
					e.preventDefault();
				}
			};
		};

		this.subscribe("keybinding-nav-prev", navigate("normal", "left"));
		this.subscribe("keybinding-nav-next", navigate("normal", "right"));
		this.subscribe("keybinding-nav-left", navigate("normal", "left"));
		this.subscribe("keybinding-nav-right", navigate("normal", "right"));
		this.subscribe("keybinding-nav-up", navigate("normal", "up"));
		this.subscribe("keybinding-nav-down", navigate("normal", "down"));
	}

	initializeTable() {
		for (var column of this.table.options.columns) {
			// Disable sorting by clicking header
			column.headerSort = false;

			// FIXME: tableholder is not focusable if we have a column that's 
			// `editable: false` and `editor: 'input' or something`.

			// Edit on double click
			var editable = column.editable !== undefined ? column.editable : true;
			// TODO: use column init event, and then assign column.modules
			column.__spreadsheet_editable = editable;
			column.editable = false;

			column.__spreadsheet_editor = column.editor;
			column.editor = false;
		}

		var customRowHeader = this.options("spreadsheetRowHeader");

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

			cssClass: customRowHeader.cssClass
				? `tabulator-spreadsheet-row-header ${customRowHeader.cssClass}`
				: "tabulator-spreadsheet-row-header",
		};

		this.rowHeaderField = rowHeaderDef.field;

		this.table.options.columns = [
			rowHeaderDef,
			...this.table.options.columns,
		];

		this.table.options.clipboardCopyRowRange = "spreadsheet";

		this.overlay = document.createElement("div");
		this.overlay.classList.add("tabulator-range-overlay");

		this.rangeContainer = document.createElement("div");
		this.rangeContainer.classList.add("tabulator-range-container");

		this.activeRangeCellElement = document.createElement("div");
		this.activeRangeCellElement.classList.add("tabulator-range-cell-active");

		this.overlay.appendChild(this.rangeContainer);
		this.overlay.appendChild(this.activeRangeCellElement);

		var self = this;

		this.mouseUpHandler = function () {
			self.mousedown = false;
			document.removeEventListener("mouseup", self.mouseUpHandler);
		};

		this.subscribe("table-destroy", function () {
			document.removeEventListener("mouseup", self.mouseUpHandler);
		});

		this.resetRanges();

		this.table.rowManager.element.appendChild(this.overlay);
		this.table.columnManager.element.setAttribute("tabindex", 0);

	}

	initializeFunctions() {
		this.registerTableFunction("getSelectedData", this.getSelectedData.bind(this));
		this.registerTableFunction("getActiveRange", this.getActiveRange.bind(this, true));

		this.registerComponentFunction("cell", "getRange", (cell) => {
			var range;

			if (cell.column.field === this.rowHeaderField) {
				range = this.ranges.find((range) => range.occupiesRow(cell.row));
			} else {
				range = this.ranges.find((range) => range.occupies(cell));
			}

			if (!range) { 
				return null;
			}

			return range.getComponent();
		});

		this.registerComponentFunction("row", "getRange", (row) => {
			var range = this.ranges.find((range) => range.occupiesRow(row));

			if (!range) {
				return null;
			}

			return range.getComponent();
		});

		this.registerComponentFunction("column", "getRange", (col) => {
			var range = this.ranges.find((range) => range.occupiesColumn(col));

			if (!range) {
				return null;
			}

			return range.getComponent();
		});
	}
	
	initializeMenuNavigation() {
		var self = this;
		var pressingContextMenu = false;

		function contextMenuKeyCheck(e) {
			if (e.key === "ContextMenu") {
				pressingContextMenu = true;
			}
		}

		function handleContextMenu(e) {
			if (!pressingContextMenu) return;

			var activeCell = self.getActiveCell();
			var menuDef = activeCell.column.definition.contextMenu;
			var menu =
				typeof menuDef === "function"
					? menuDef.call(self.table, e, activeCell.getComponent())
					: menuDef;

			self.table.modules.menu.loadMenu(e, activeCell, menu, activeCell.element);

			pressingContextMenu = false;
			e.preventDefault();
		}

		this.table.rowManager.element.addEventListener(
			"keyup",
			contextMenuKeyCheck,
		);
		this.table.rowManager.element.addEventListener(
			"contextmenu",
			handleContextMenu,
		);

		this.subscribe("table-destroy", () => {
			this.table.rowManager.element.removeEventListener(
				"keyup",
				contextMenuKeyCheck,
			);
			this.table.rowManager.element.removeEventListener(
				"contextmenu",
				handleContextMenu,
			);
		});

		this.subscribe("menu-opened", (menu, popup) => {
			var stack = [createState(menu, popup)];

			function createState(menu, popup) {
				var elements = popup.element.querySelectorAll(".tabulator-menu-item");
				var focusIdx = 0;

				function handleMouseOver(e) {
					focusIdx = Array.prototype.indexOf.call(elements, e.target);
					draw();
				}

				// We do this because the menu items use user-select: none;
				function preventLosingFocus(e) {
					e.preventDefault();
				}

				elements.forEach((element) => {
					element.addEventListener("mouseover", handleMouseOver);
					element.addEventListener("mousedown", preventLosingFocus);
				});

				return {
					menu,
					popup,
					elements,
					get focusIdx() {
						return focusIdx;
					},
					set focusIdx(value) {
						if (value < 0) {
							value = 0;
						} else if (value >= elements.length) {
							value = elements.length - 1;
						}
						focusIdx = value;
					},
					get focusedMenu() {
						return this.menu[focusIdx];
					},
					get focusedElement() {
						return this.elements[focusIdx];
					},
					destroy() {
						this.popup.hide(true);
						this.elements.forEach((element) => {
							element.removeEventListener("mouseover", handleMouseOver);
							element.removeEventListener("mousedown", preventLosingFocus);
						});
					},
				};
			}

			function navigate(nav) {
				var state = stack[stack.length - 1];
				switch (nav) {
					case "up":
						state.focusIdx--;
						break;
					case "down":
						state.focusIdx++;
						break;
					case "left":
						if (stack.length > 1) {
							stack.pop().destroy();
						}
						break;
					case "right":
						if (state.focusedMenu.menu && state.focusedMenu.menu.length) {
							state.focusedElement.click();
							var nextState = createState(
								state.focusedMenu.menu,
								state.popup.childPopup,
							);
							stack.push(nextState);
						}
						break;
				}
				draw();
			}

			function draw() {
				var state = stack[stack.length - 1];
				state.elements.forEach((element) => {
					var selected = element === state.focusedElement;
					element.classList.toggle(
						"tabulator-spreadsheet-menu-item-focused",
						selected,
					);
				});
			}

			function handleUp(e) {
				e.preventDefault();
				navigate("up");
			}

			function handleDown(e) {
				e.preventDefault();
				navigate("down");
			}

			function handleLeft(e) {
				e.preventDefault();
				navigate("left");
			}

			function handleRight(e) {
				e.preventDefault();
				navigate("right");
			}

			function handleKeyUp(e) {
				if (e.key === "Enter") {
					var state = stack[stack.length - 1];
					state.focusedElement.click();
				}
			}

			function subscribeListeners() {
				self.subscribe("keybinding-nav-up", handleUp);
				self.subscribe("keybinding-nav-down", handleDown);
				self.subscribe("keybinding-nav-left", handleLeft);
				self.subscribe("keybinding-nav-right", handleRight);
				// TODO use keybinding module
				self.table.element.addEventListener("keyup", handleKeyUp);
			}

			function unsubscribeListeners() {
				self.unsubscribe("keybinding-nav-up", handleUp);
				self.unsubscribe("keybinding-nav-down", handleDown);
				self.unsubscribe("keybinding-nav-left", handleLeft);
				self.unsubscribe("keybinding-nav-right", handleRight);
				self.table.element.removeEventListener("keyup", handleKeyUp);
			}

			this.subscribe("menu-closed", unsubscribeListeners);
			subscribeListeners();
			draw();
		});
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

	renderCell(cell) {
		var el = cell.getElement();

		var rangeIdx = this.ranges.findIndex((range) => range.occupies(cell));

		el.classList.toggle("tabulator-spreadsheet-selected", rangeIdx !== -1);

		el.classList.toggle(
			"tabulator-spreadsheet-only-cell-selected",
			this.ranges.length === 1 &&
				this.ranges[0].atTopLeft(cell) &&
				this.ranges[0].atBottomRight(cell),
		);

		el.dataset.range = rangeIdx;
	}

	handleColumnMouseDown(event, column) {
		if (
			event.button === 2 &&
			(this.selecting === "column" || this.selecting === "all") &&
			this.getActiveRange().occupiesColumn(column)
		) {
			return;
		}

		this.mousedown = true;

		document.addEventListener("mouseup", this.mouseUpHandler);

		this._select(event, column);
		this.layoutElement();
	}

	handleColumnMouseMove(_, column) {
		if (column.field === this.rowHeaderField || !this.mousedown || this.selecting === 'all') {
			return;
		}

		this.endSelection(column);
		this.layoutElement(true);
	}

	handleCellMouseDown(event, cell) {
		if (
			event.button === 2 &&
			(this.getActiveRange().occupies(cell) ||
				((this.selecting === "row" || this.selecting === "all") &&
					this.getActiveRange().occupiesRow(cell.row)))
		) {
			return;
		}

		this.mousedown = true;

		document.addEventListener("mouseup", this.mouseUpHandler);

		this._select(event, cell);
		this.layoutElement();
	}

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

	handleCellMouseMove(_, cell) {
		if (!this.mousedown || this.selecting === "all") {
			return;
		}

		this.endSelection(cell);
		this.layoutElement(true);
	}

	handleCellDblClick(_, cell) {
		if (cell.column.field === this.rowHeaderField) {
			return;
		}

		this.editCell(cell);
	}

	editActiveCell() {
		this.editCell(this.getActiveCell());
	}

	editCell(cell) {
		cell.column.definition.editable =
			cell.column.definition.__spreadsheet_editable;
		cell.column.definition.editor =
			cell.column.definition.__spreadsheet_editor;
		this.table.modules.edit.initializeColumnCheck(cell.column);

		if (this.table.modules.edit.allowEdit(cell)) {
			cell.getComponent().edit();
		}
	}

	finishEditingCell(cell) {
		cell.column.definition.editable = false;
		cell.column.definition.editor = false;
		this.table.rowManager.element.focus();
	}

	navigate(mode, dir) {
		// Don't navigate while editing
		if (this.table.modules.edit && this.table.modules.edit.currentCell) {
			return false;
		}

		// Don't navigate while a menu is open
		if (this.table.modules.menu && this.table.modules.menu.currentComponent) {
			return false;
		}

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

		this.autoScroll(range);

		this.layoutElement();

		return true;
	}

	autoScroll(range) {
		var tableHolder = this.table.rowManager.element;
		var rowHeader = this.rowHeaderColumn.getElement();
		var row = this.getRowByRangePos(range.end.row).getElement();
		var column = this.getColumnByRangePos(range.end.col).getElement();

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
			bottom:
				tableHolder.scrollTop +
				tableHolder.offsetHeight -
				this.table.rowManager.scrollbarWidth,
		};

		var withinHorizontalView =
			view.left < rect.left &&
			rect.left < view.right &&
			view.left < rect.right &&
			rect.right < view.right;

		var withinVerticalView =
			view.top < rect.top &&
			rect.top < view.bottom &&
			view.top < rect.bottom &&
			rect.bottom < view.bottom;

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

	findJumpCellLeft(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos);
		var cells = row.cells.filter((cell) => Helpers.elVisible(cell.getElement()));
		var jumpCol = 0;
	
		for (var i = colPos; i >= 0; i--){
			var cell = cells[i];
			if (Helpers.elVisible(cell.getElement()) && cell.column.field !== this.rowHeaderField) {
				jumpCol = cell.column.position - 2;
				if (cell.getValue()) break;
			}
		}
	
		return jumpCol;
	}

	findJumpCellRight(rowPos, colPos){
		var row = this.getRowByRangePos(rowPos);
		var cells = row.cells.filter((cell) => Helpers.elVisible(cell.getElement()));
		var jumpCol = 0;

		for (var i = colPos + 2; i < cells.length; i++){
			var cell = cells[i];
			if (Helpers.elVisible(cell.getElement())) {
				jumpCol = cell.column.position - 2;
				if (cell.getValue()) break;
			}
		}

		return jumpCol;
	}

	findJumpCellUp(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos);
		var cells = column.cells.filter((cell) => Helpers.elVisible(cell.getElement()));
		var jumpRow = 0;
		var jumpRowIdx = cells.findIndex((cell) => cell.row.position - 1 === rowPos) - 1;

		for (var i = jumpRowIdx; i >= 0; i--){
			var cell = cells[i];
			if (Helpers.elVisible(cell.getElement())) {
				jumpRow = cell.row.position - 1;
				if (cell.getValue()) break;
			}
		}

		return jumpRow;
	}

	findJumpCellDown(rowPos, colPos) {
		var column = this.getColumnByRangePos(colPos);
		var cells = column.cells.filter((cell) => Helpers.elVisible(cell.getElement()));
		var jumpRow = 0;
		var jumpRowIdx = cells.findIndex((cell) => cell.row.position - 1 === rowPos) + 1;

		for (var i = jumpRowIdx; i < cells.length; i++){
			var cell = cells[i];
			if (Helpers.elVisible(cell.getElement())) {
				jumpRow = cell.row.position - 1;
				if (cell.getValue()) break;
			}
		}

		return jumpRow;
	}

	beginSelection(element) {
		var range = this.getActiveRange();

		if (element.type === "column") {
			range.setStart(0, element.position - 2);
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;

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
				range.setEnd(rowsCount - 1, element.position - 2);
			} else if (this.selecting === "cell") {
				range.setEnd(0, element.position - 2);
			}
			return;
		}

		var row = element.row.position - 1;
		var col = element.column.position - 2;
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

		el.classList.toggle("tabulator-spreadsheet-selected", selected);
		el.classList.toggle("tabulator-spreadsheet-highlight", occupied);
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

		el.classList.toggle("tabulator-spreadsheet-selected", selected);
		el.classList.toggle("tabulator-spreadsheet-highlight", occupied);
	}

	layoutRanges() {
		if (!this.table.initialized) {
			return;
		}

		var activeCell = this.getActiveCell();

		if (!activeCell) {
			return;
		}

		this.activeRangeCellElement.style.left =
			activeCell.row.getElement().offsetLeft +
			activeCell.getElement().offsetLeft +
			"px";
		this.activeRangeCellElement.style.top =
			activeCell.row.getElement().offsetTop + "px";
		this.activeRangeCellElement.style.width =
			activeCell.getElement().offsetLeft +
			activeCell.getElement().offsetWidth -
			activeCell.getElement().offsetLeft +
			"px";
		this.activeRangeCellElement.style.height =
			activeCell.row.getElement().offsetTop +
			activeCell.row.getElement().offsetHeight -
			activeCell.row.getElement().offsetTop +
			"px";

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

		range.element.classList.toggle(
			"tabulator-range-active",
			range === this.getActiveRange(),
		);

		range.element.style.left = 
			topLeftCell.row.getElement().offsetLeft +
			topLeftCell.getElement().offsetLeft +
			"px";
		range.element.style.top = topLeftCell.row.getElement().offsetTop + "px";
		range.element.style.width =
			bottomRightCell.getElement().offsetLeft +
			bottomRightCell.getElement().offsetWidth -
			topLeftCell.getElement().offsetLeft +
			"px";
		range.element.style.height =
			bottomRightCell.row.getElement().offsetTop +
			bottomRightCell.row.getElement().offsetHeight -
			topLeftCell.row.getElement().offsetTop +
			"px";
	}

	handlePageChanged() {
		this.selecting = 'cell';
		this.resetRanges();
		this.layoutElement();
	}

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

	get selectedRows() {
		return this.getRowsByRange(this.getActiveRange());
	}

	get selectedColumns() {
		return this.getColumnsByRange(this.getActiveRange()).map((col) =>
			col.getComponent(),
		);
	}

	get rowHeaderColumn() {
		return this.table.columnManager.columnsByField[this.rowHeaderField];
	}
}

Spreadsheet.moduleName = "spreadsheet";

export default Spreadsheet;
