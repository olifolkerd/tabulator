import TabulatorFull from "../../../src/js/core/TabulatorFull";
import ResponsiveLayout from "../../../src/js/modules/ResponsiveLayout/ResponsiveLayout";

describe("ResponsiveLayout module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {ResponsiveLayout} */
    let responsiveLayoutMod;
    let tableData = [
        { id: 1, name: "John", age: 30, gender: "Male", city: "New York" },
        { id: 2, name: "Jane", age: 25, gender: "Female", city: "Boston" },
        { id: 3, name: "Bob", age: 40, gender: "Male", city: "Chicago" }
    ];
    let tableColumns = [
        { title: "ID", field: "id", responsive: 0 },
        { title: "Name", field: "name", responsive: 1 },
        { title: "Age", field: "age", responsive: 2 },
        { title: "Gender", field: "gender", responsive: 3 },
        { title: "City", field: "city", responsive: 4 }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.style.width = "500px"; // Set fixed width for testing
        el.id = "tabulator";
        document.body.appendChild(el);
    });

    afterEach(() => {
        // Manually remove element without calling destroy() to avoid event listener errors
        if (document.getElementById("tabulator")) {
            document.getElementById("tabulator").remove();
        }
    });

    describe("collapse mode", () => {
        beforeEach(async () => {
            tabulator = new TabulatorFull("#tabulator", {
                data: tableData,
                columns: tableColumns,
                responsiveLayout: "collapse"
            });
            
            responsiveLayoutMod = tabulator.module("responsiveLayout");
            
            return new Promise((resolve) => {
                tabulator.on("tableBuilt", () => {
                    resolve();
                });
            });
        });

        it("should initialize with collapse mode", () => {
            expect(responsiveLayoutMod.mode).toBe("collapse");
            expect(Array.isArray(responsiveLayoutMod.columns)).toBe(true);
        });

        it("should have methods for generating collapsed content", () => {
            // Verify methods exist
            expect(typeof responsiveLayoutMod.generateCollapsedContent).toBe('function');
            expect(typeof responsiveLayoutMod.generateCollapsedRowContent).toBe('function');
            expect(typeof responsiveLayoutMod.generateCollapsedRowData).toBe('function');
            expect(typeof responsiveLayoutMod.formatCollapsedData).toBe('function');
        });

        it("should add column to hiddenColumns when hidden", () => {
            const column = tabulator.columnManager.findColumn("gender");
            const initialHiddenCount = responsiveLayoutMod.hiddenColumns.length;
            
            // Hide column
            responsiveLayoutMod.hideColumn(column);
            
            // Check if column was added to hiddenColumns
            expect(responsiveLayoutMod.hiddenColumns.length).toBe(initialHiddenCount + 1);
            expect(responsiveLayoutMod.hiddenColumns.includes(column)).toBe(true);
            
            // Check if column is actually hidden
            expect(column.visible).toBe(false);
        });

        it("should remove column from hiddenColumns when shown", () => {
            // First hide a column
            const column = tabulator.columnManager.findColumn("city");
            responsiveLayoutMod.hideColumn(column);
            
            // Then show it
            responsiveLayoutMod.showColumn(column);
            
            // Check if column was removed from hiddenColumns
            expect(responsiveLayoutMod.hiddenColumns.includes(column)).toBe(false);
            
            // Check if column is actually visible
            expect(column.visible).toBe(true);
        });
    });

    describe("hide mode", () => {
        beforeEach(async () => {
            tabulator = new TabulatorFull("#tabulator", {
                data: tableData,
                columns: tableColumns,
                responsiveLayout: "hide"
            });
            
            responsiveLayoutMod = tabulator.module("responsiveLayout");
            
            return new Promise((resolve) => {
                tabulator.on("tableBuilt", () => {
                    resolve();
                });
            });
        });

        it("should initialize with hide mode", () => {
            expect(responsiveLayoutMod.mode).toBe("hide");
            expect(Array.isArray(responsiveLayoutMod.columns)).toBe(true);
        });

        it("should have update method for responsivity", () => {
            // Verify update method exists
            expect(typeof responsiveLayoutMod.update).toBe('function');
            
            // Mock required methods
            responsiveLayoutMod.hideColumn = jest.fn();
            responsiveLayoutMod.showColumn = jest.fn();
            
            // Mock a column with responsive order
            const mockColumn = { visible: true };
            responsiveLayoutMod.columns = [mockColumn];
            responsiveLayoutMod.index = 0;
            
            // Force an update with a negative width difference (simulate too narrow table)
            tabulator.modules.layout = { getMode: () => 'fitData' };
            tabulator.columnManager.getWidth = () => 1000;
            tabulator.columnManager.element = { clientWidth: 800 };
            tabulator.element = { clientWidth: 800 };
            tabulator.options.headerVisible = true;
            tabulator.rowManager = { activeRowsCount: 1, renderEmptyScroll: jest.fn() };
            
            // Run update
            responsiveLayoutMod.update();
            
            // Verify hideColumn was called when table is too narrow
            expect(responsiveLayoutMod.hideColumn).toHaveBeenCalled();
        });
    });
});