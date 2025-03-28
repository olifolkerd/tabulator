import TabulatorFull from "../../../src/js/core/TabulatorFull";
import SelectRange from "../../../src/js/modules/SelectRange/SelectRange";

describe("SelectRange module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {SelectRange} */
    let selectRangeMod;
    let tableData = [
        { id: 1, name: "John", age: 30, position: "Manager" },
        { id: 2, name: "Jane", age: 25, position: "Developer" },
        { id: 3, name: "Bob", age: 35, position: "Designer" }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name" },
        { title: "Age", field: "age" },
        { title: "Position", field: "position" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns,
            selectableRange: true,
        });
        selectRangeMod = tabulator.module("selectRange");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("should have one range initially at the top left", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        expect(range.top).toBe(0);
        expect(range.left).toBe(0);
        expect(range.bottom).toBe(0);
        expect(range.right).toBe(0);
    });

    it("should add a new range when addRange is called", () => {
        const initialRangesCount = selectRangeMod.getRanges().length;
        selectRangeMod.addRange();
        expect(selectRangeMod.getRanges().length).toBe(initialRangesCount + 1);
    });

    it("should reset ranges when resetRanges is called", () => {
        // Add multiple ranges
        selectRangeMod.addRange();
        selectRangeMod.addRange();
        
        // Reset ranges
        const resetRange = selectRangeMod.resetRanges();
        
        // Should have only one range after reset
        expect(selectRangeMod.getRanges().length).toBe(1);
        expect(resetRange).toBe(selectRangeMod.getRanges()[0]._range);
    });

    it("should have correct structure in RangeComponent", () => {
        const rangeComponent = selectRangeMod.getRanges()[0];
        
        // Test component properties
        expect(rangeComponent._range).toBeDefined();
        expect(typeof rangeComponent.getElement).toBe("function");
        expect(typeof rangeComponent.getData).toBe("function");
        expect(typeof rangeComponent.getCells).toBe("function");
        expect(typeof rangeComponent.getRows).toBe("function");
        expect(typeof rangeComponent.getColumns).toBe("function");
    });

    it("should have correct min/max values", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        
        // The min/max values should match the start/end values after they're set
        range.setStart(1, 2);
        range.setEnd(3, 4);
        
        expect(range.top).toBe(1);
        expect(range.bottom).toBe(3);
        expect(range.left).toBe(2);
        expect(range.right).toBe(4);
    });

    it("should handle Range setStart and setEnd", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        
        // Initial values
        expect(range.start.row).toBeUndefined();
        expect(range.start.col).toBeUndefined();
        expect(range.end.row).toBeUndefined();
        expect(range.end.col).toBeUndefined();
        
        // Set start
        range.setStart(1, 2);
        expect(range.start.row).toBe(1);
        expect(range.start.col).toBe(2);
        
        // Set end
        range.setEnd(3, 4);
        expect(range.end.row).toBe(3);
        expect(range.end.col).toBe(4);
    });

    it("should detect overlaps correctly", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        
        // Setup range bounds
        range.top = 1;
        range.bottom = 3;
        range.left = 2;
        range.right = 4;
        
        // Test overlapping case
        expect(range.overlaps(1, 1, 5, 5)).toBe(true);
        expect(range.overlaps(3, 3, 5, 5)).toBe(true);
        
        // Test non-overlapping cases
        expect(range.overlaps(5, 5, 7, 7)).toBe(false);
        expect(range.overlaps(0, 0, 0, 0)).toBe(false);
    });

    it("should handle destroyedGuard", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        
        // Should return true when not destroyed
        expect(range.destroyedGuard("testFunction")).toBe(true);
        
        // Test warning message when destroyed
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        range.destroyed = true;
        expect(range.destroyedGuard("testFunction")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalled();
        
        // Clean up
        consoleWarnSpy.mockRestore();
    });
});
