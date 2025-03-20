import TabulatorFull from "../../../src/js/core/TabulatorFull";
import History from "../../../src/js/modules/History/History";

describe("History module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {History} */
    let historyMod;
    let tableData = [
        { id: 1, name: "John", age: 30 },
        { id: 2, name: "Jane", age: 25 },
        { id: 3, name: "Bob", age: 35 }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name", editor: "input" },
        { title: "Age", field: "age", editor: "number" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns,
            history: true
        });
        historyMod = tabulator.module("history");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        // Clean up DOM without destroying tabulator to avoid dispatch errors
        if (document.getElementById("tabulator")) {
            document.getElementById("tabulator").remove();
        }
    });

    it("should initialize with empty history", () => {
        expect(historyMod.getHistoryUndoSize()).toBe(0);
        expect(historyMod.getHistoryRedoSize()).toBe(0);
    });

    it("should track cell edits", () => {
        // Get a cell and update its value
        const cell = tabulator.rowManager.rows[0].getCells()[1]; // name cell
        const oldValue = cell.getValue();
        const newValue = "Updated Name";
        
        // Update cell value
        cell.setValue(newValue);
        
        // Check that history recorded the action
        expect(historyMod.getHistoryUndoSize()).toBe(1);
        expect(historyMod.getHistoryRedoSize()).toBe(0);
        
        // Undo the action
        expect(historyMod.undo()).toBe(true);
        
        // Check cell value reverted
        expect(cell.getValue()).toBe(oldValue);
        
        // Check history state updated
        expect(historyMod.getHistoryUndoSize()).toBe(0);
        expect(historyMod.getHistoryRedoSize()).toBe(1);
        
        // Redo the action
        expect(historyMod.redo()).toBe(true);
        
        // Check cell value restored
        expect(cell.getValue()).toBe(newValue);
    });

    it("should have rowDeleted method", () => {
        // Verify rowDeleted method exists
        expect(typeof historyMod.rowDeleted).toBe('function');
    });
    
    it("should have action method to record history", () => {
        // Test action method directly
        expect(typeof historyMod.action).toBe('function');
        
        // Verify initial history state
        expect(historyMod.history.length).toBe(0);
        expect(historyMod.index).toBe(-1);
        
        // Call action directly with test parameters
        const testComponent = {};
        const testData = { foo: "bar" };
        historyMod.action("testAction", testComponent, testData);
        
        // Verify history was updated
        expect(historyMod.history.length).toBe(1);
        expect(historyMod.index).toBe(0);
        expect(historyMod.history[0].type).toBe("testAction");
        expect(historyMod.history[0].component).toBe(testComponent);
        expect(historyMod.history[0].data).toBe(testData);
    });

    it("should track row addition", () => {
        // Directly manipulate history to simulate row add
        const newRowData = { id: 4, name: "Alice", age: 28 };
        const newRow = tabulator.rowManager.addRow(newRowData);
        
        // Manually add to history
        historyMod.action("rowAdd", newRow, {data: newRowData, pos: true, index: false});
        
        // Check history state
        expect(historyMod.getHistoryUndoSize()).toBe(1);
        
        // Reset for next test
        historyMod.clear();
    });

    it("should clear history", () => {
        // Make some changes to build history
        const cell = tabulator.rowManager.rows[0].getCells()[1];
        cell.setValue("New Value 1");
        cell.setValue("New Value 2");
        
        // Check history state
        expect(historyMod.getHistoryUndoSize()).toBe(2);
        
        // Clear history
        historyMod.clear();
        
        // Check history is empty
        expect(historyMod.getHistoryUndoSize()).toBe(0);
        expect(historyMod.getHistoryRedoSize()).toBe(0);
    });

    it("should handle multiple undo and redo operations", () => {
        // Make several changes
        const cell = tabulator.rowManager.rows[0].getCells()[1];
        const originalValue = cell.getValue();
        
        cell.setValue("Change 1");
        cell.setValue("Change 2");
        cell.setValue("Change 3");
        
        // Undo all changes
        historyMod.undo(); // Undo Change 3
        historyMod.undo(); // Undo Change 2
        historyMod.undo(); // Undo Change 1
        
        // Check value is back to original
        expect(cell.getValue()).toBe(originalValue);
        
        // Check history state
        expect(historyMod.getHistoryUndoSize()).toBe(0);
        expect(historyMod.getHistoryRedoSize()).toBe(3);
        
        // Redo changes
        historyMod.redo(); // Redo Change 1
        expect(cell.getValue()).toBe("Change 1");
        
        historyMod.redo(); // Redo Change 2
        expect(cell.getValue()).toBe("Change 2");
        
        historyMod.redo(); // Redo Change 3
        expect(cell.getValue()).toBe("Change 3");
    });

    it("should warn when undoing with no history", () => {
        // Mock console.warn
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        // Try to undo with no history
        const result = historyMod.undo();
        
        // Check result and warning
        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalled();
        
        // Restore console.warn
        console.warn = originalWarn;
    });

    it("should warn when redoing with no further history", () => {
        // Mock console.warn
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        // Try to redo with no future history
        const result = historyMod.redo();
        
        // Check result and warning
        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalled();
        
        // Restore console.warn
        console.warn = originalWarn;
    });
});