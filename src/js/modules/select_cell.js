const SELECTION_LEFT_CLASS = 'selection-left';
const SELECTION_RIGHT_CLASS = 'selection-right';
const SELECTION_TOP_CLASS = 'selection-top';
const SELECTION_BOTTOM_CLASS = 'selection-bottom';

const CELL_SELECTED_CLASS = 'tabulator-selected';
const SELECTABLE_CLASS = 'tabulator-selectable';
const UNSELECTABLE_CLASS = 'tabulator-unselectable';
const BLOCK_TABLE_TEXT_SELECTION = 'tabulator-block-select';

function clearHighlight(table) {
    const columns = table.columnManager.columnsByIndex;
    for (var x = 0; x < columns.length; x++) {
        var col = columns[x];
        col.cells.forEach(cell => {
            [
                CELL_SELECTED_CLASS,
                SELECTION_LEFT_CLASS, 
                SELECTION_TOP_CLASS,
                SELECTION_RIGHT_CLASS,
                SELECTION_BOTTOM_CLASS
            ].forEach(className => cell.getElement().classList.remove(className));
        });
    }
}

function orderRectCoords(start, end) {
    var startCol, endCol;
    var startRow, endRow;

    if (start.col >= end.col) {
        startCol = end.col;
        endCol = start.col;
    } else {
        startCol = start.col;
        endCol = end.col;
    }

    if (start.row >= end.row) {
        startRow = end.row;
        endRow = start.row;
    } else {
        startRow = start.row;
        endRow = end.row;
    }

    return {
        startCol, startRow,
        endCol, endRow
    }
}

function highlightCells(table, start, end) {
    const cells = [];

    var coords = orderRectCoords(start, end);

    // Get the list of active columns.
    const selectedColumns = table.columnManager.columnsByIndex;

    for (var x = coords.startCol; x <= coords.endCol; x++) {
        var col = selectedColumns[x];

        col.cells.forEach(cell => {
            var rowIndex = cell.row.parent.findRowIndex(cell.row, cell.row.parent.rows)

            if (rowIndex >= coords.startRow && rowIndex <= coords.endRow) {
                
                if (!(rowIndex == start.row && x == start.col)) {
                    cell.getElement().classList.add(CELL_SELECTED_CLASS);
                }

                if (x == coords.startCol) {
                    cell.getElement().classList.add(SELECTION_LEFT_CLASS);
                }
                if (x == coords.endCol) {
                    cell.getElement().classList.add(SELECTION_RIGHT_CLASS);
                }

                if (rowIndex == coords.startRow) {
                    cell.getElement().classList.add(SELECTION_TOP_CLASS);
                }
                if (rowIndex == coords.endRow) {
                    cell.getElement().classList.add(SELECTION_BOTTOM_CLASS);
                }

                cells.push(cell);
            }
        });
    }
    return cells;
}

function createEmptySelection() {
    var emptyCoord = {
        row: 0,
        col: 0
    };

    return {
        start: emptyCoord,
        end: emptyCoord,
        data: []
    }
}

var SelectCell = function (table) {
    this.table = table; //hold Tabulator object
    this.selecting = false; //flag selecting in progress

    this.selection = createEmptySelection();
    this.selectedRows = []; //hold selected rows
    this.selectedCols = [];
};

SelectCell.prototype.clearSelectionData = function () {
    this.selecting = false;

    this.selection = createEmptySelection();
    this.selectedRows = [];
    this.selectedCols = [];
};

SelectCell.prototype.getSelection = function () {
    return this.selection; 
};

SelectCell.prototype.getSelectedRows = function(){
	return this.selectedRows.map((row) => row.getComponent());
};

SelectCell.prototype.getSelectedColumns = function() {
    return this.selectedCols.map((col) => col.getComponent());
};

SelectCell.prototype.changeSelection = function (start, end) {
    this.selection.start = start;
    this.selection.end = end;
    this.selectedRows = [];
    this.selectedCols = [];

    clearHighlight(this.table);

    const selectedCells = highlightCells(this.table, start, end);

    const rows = [];
    const cols = [];
    selectedCells.forEach((cell) => {
        rows.push(cell.row);
        cols.push(cell.column);
    });

    // Dedupe the row
    rows.filter(function(item, pos) {
        return rows.indexOf(item) == pos;
    }).forEach((row) => this.selectedRows.push(row));

    cols.filter(function(item, pos) {
        return cols.indexOf(item) == pos;
    }).forEach((col) => this.selectedCols.push(col));
};

SelectCell.prototype.initializeCell = function (cell) {
    var self = this,
        element = cell.getElement();

    //set cell selection class
    element.classList.add(SELECTABLE_CLASS);
    element.classList.remove(UNSELECTABLE_CLASS);

    if (self.table.options.selectable && self.table.options.selectionType == 'cell' && self.table.options.selectable != "highlight") {

        const getCurrentCellPosition = function(cell) {
            return {
                col: cell.column.parent.findColumnIndex(cell.column),
                row: cell.row.parent.findRowIndex(cell.row, cell.row.parent.rows)
            };
        }

        element.addEventListener("mousedown", function (e) {
            self.table._clearSelection();
            self.table.element.classList.add(BLOCK_TABLE_TEXT_SELECTION);
            self.selectedRows = [];
            self.selectedCols = [];
            self.selecting = true;

            const start = getCurrentCellPosition(cell);
            self.changeSelection(start, start);

            return false;
        });

        element.addEventListener("mouseover", function (e) {
            if (self.selecting) {
                self.changeSelection(self.selection.start, getCurrentCellPosition(cell));
            }
        });

        element.addEventListener("mouseup", function (e) {
            if (self.selecting) {
                self.selecting = false;
                self.table.element.classList.remove(BLOCK_TABLE_TEXT_SELECTION);

                self.changeSelection(self.selection.start, getCurrentCellPosition(cell));
            }
        });
    }
};

Tabulator.prototype.registerModule("selectCell", SelectCell);
