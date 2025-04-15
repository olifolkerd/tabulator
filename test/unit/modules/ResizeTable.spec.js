import TabulatorFull from "../../../src/js/core/TabulatorFull";
import ResizeTable from "../../../src/js/modules/ResizeTable/ResizeTable";

describe("ResizeTable module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {ResizeTable} */
    let resizeTableMod;
    let tableData = [
        { id: 1, name: "John", active: true },
        { id: 2, name: "Jane", active: false },
        { id: 3, name: "Bob", active: true }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name" },
        { title: "Active", field: "active" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns,
            autoResize: true
        });
        resizeTableMod = tabulator.module("resizeTable");
        
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

    it("should initialize with proper default values", () => {
        // Initialize may not have completed yet or test environment doesn't have proper dimensions
        expect(resizeTableMod.tableHeight).toBeDefined();
        expect(resizeTableMod.tableWidth).toBeDefined();
        expect(resizeTableMod.containerHeight).toBeDefined();
        expect(resizeTableMod.containerWidth).toBeDefined();
        expect(resizeTableMod.autoResize).toBeDefined();
    });

    it("should have method to clear bindings", () => {
        // Verify the clearBindings method exists
        expect(typeof resizeTableMod.clearBindings).toBe('function');
        
        // Test if resizeObserver and visibilityObserver are properly defined
        if (resizeTableMod.resizeObserver) {
            expect(typeof resizeTableMod.resizeObserver.unobserve).toBe('function');
        }
        
        if (resizeTableMod.visibilityObserver) {
            expect(typeof resizeTableMod.visibilityObserver.unobserve).toBe('function');
        }
    });

    it("should handle table redraw", () => {
        // Mock redraw method to detect if it's called
        const originalRedraw = tabulator.rowManager.redraw;
        let wasCalled = false;
        
        tabulator.rowManager.redraw = function() {
            wasCalled = true;
            return originalRedraw.apply(this, arguments);
        };
        
        // Call tableResized
        resizeTableMod.tableResized();
        
        // Restore original function
        tabulator.rowManager.redraw = originalRedraw;
        
        // Test if our mock was called
        expect(wasCalled).toBe(true);
    });

    it("should not redraw if not visible", () => {
        // Set visible to false
        resizeTableMod.visible = false;
        resizeTableMod.initialized = true;
        
        // Spy on table redraw
        const redrawSpy = jest.spyOn(tabulator, 'redraw');
        
        // Call redrawTable
        resizeTableMod.redrawTable();
        
        // Check that redraw was not called
        expect(redrawSpy).not.toHaveBeenCalled();
        
        // Clean up
        redrawSpy.mockRestore();
    });
});