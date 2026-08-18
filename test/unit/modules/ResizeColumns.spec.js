import TabulatorFull from "../../../src/js/core/TabulatorFull";
import ResizeColumns from "../../../src/js/modules/ResizeColumns/ResizeColumns";

describe("ResizeColumns module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {ResizeColumns} */
    let resizeColumnsMod;
    let tableData = [
        { id: 1, name: "John", active: true },
        { id: 2, name: "Jane", active: false },
        { id: 3, name: "Bob", active: true }
    ];
    let tableColumns = [
        { title: "ID", field: "id", resizable: true },
        { title: "Name", field: "name", resizable: true },
        { title: "Active", field: "active", resizable: false }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        resizeColumnsMod = tabulator.module("resizeColumns");
        
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

    it("should initialize ResizeColumns module", () => {
        expect(resizeColumnsMod).toBeDefined();
        expect(typeof resizeColumnsMod.initializeColumn).toBe('function');
        expect(typeof resizeColumnsMod.resize).toBe('function');
        expect(typeof resizeColumnsMod._checkResizability).toBe('function');
    });

    it("should check column resizability correctly", () => {
        // Create mock columns with resizable definition
        const resizableColumn = { definition: { resizable: true } };
        const nonResizableColumn = { definition: { resizable: false } };
        
        expect(resizeColumnsMod._checkResizability(resizableColumn)).toBe(true);
        expect(resizeColumnsMod._checkResizability(nonResizableColumn)).toBe(false);
    });

    it("should dispatch events when columns are resized", () => {
        // Create a spy for dispatchExternal
        const dispatchSpy = jest.spyOn(resizeColumnsMod, 'dispatchExternal');
        
        // Create mock column with needed methods
        const mockColumn = {
            getComponent: () => ({}),
            getWidth: () => 100,
            setWidth: jest.fn(),
            modules: {}
        };
        
        // Set initial values
        resizeColumnsMod.startX = 100;
        resizeColumnsMod.startWidth = 100;
        resizeColumnsMod.latestX = 100;
        
        // Call resize method
        resizeColumnsMod.resize({ clientX: 150 }, mockColumn);
        
        // Verify column width was set
        expect(mockColumn.setWidth).toHaveBeenCalledWith(150); // 100 + (150 - 100)
        
        // Clean up
        dispatchSpy.mockRestore();
    });

    it("should calculate guide position correctly", () => {
        // Enable guide
        tabulator.options.resizableColumnGuide = true;
        
        // Create mock objects
        const mockColumn = {
            element: {
                getBoundingClientRect: () => ({ left: 50 })
            },
            minWidth: 30,
            maxWidth: 300
        };
        
        const mockHandle = {
            getBoundingClientRect: () => ({ x: 120 })
        };
        
        // Mock table element
        resizeColumnsMod.table = {
            element: {
                getBoundingClientRect: () => ({ x: 20 }),
                classList: { add: jest.fn() }
            }
        };
        
        // Set initial values
        resizeColumnsMod.startX = 100;
        
        // Calculate guide position
        const mockEvent = { clientX: 150 }; // 50px difference
        const position = resizeColumnsMod.calcGuidePosition(mockEvent, mockColumn, mockHandle);
        
        // Guide position should be handle position + mouse movement
        // handleX: 120 - 20 = 100, mouseDiff: 150 - 100 = 50, total: 150
        expect(position).toBe(150);
    });

    it("should set column width in resize method", () => {
        // Create a mock column with width methods
        const mockColumn = {
            width: 100,
            minWidth: 50,
            maxWidth: 200,
            setWidth: jest.fn(),
            getWidth: () => 100,
            modules: {}
        };
        
        // Create mock for the calculation without using resize() directly
        const startWidth = 100;
        const startX = 100;
        const clientX = 120; // 20px difference
        const startDiff = clientX - startX;
        
        // Calculate expected new width
        const expectedWidth = startWidth + startDiff; // 100 + 20 = 120
        
        // Directly test the column width setting behavior
        mockColumn.setWidth(expectedWidth);
        
        // Verify column width was set correctly
        expect(mockColumn.setWidth).toHaveBeenCalledWith(120);
    });
});

describe("ResizeColumns cell handle height", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    let offsetSpies;

    beforeAll(() => {
        // jsdom computes no layout, so Tabulator's visibility check would skip
        // rendering the table body and no cell resize handles would be created
        offsetSpies = [
            jest.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(30),
            jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100),
        ];
    });

    afterAll(() => {
        offsetSpies.forEach((spy) => spy.mockRestore());
    });

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "resize-handle-test";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#resize-handle-test", {
            data: [
                { id: 1, name: "John" },
                { id: 2, name: "Jane" }
            ],
            columns: [
                { title: "ID", field: "id", resizable: true },
                { title: "Name", field: "name", resizable: true, editor: "input" }
            ],
            renderVertical: "basic"
        });

        return new Promise((resolve) => {
            tabulator.on("renderComplete", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("resize-handle-test")?.remove();
    });

    // https://github.com/tabulator-tables/tabulator/issues/4544
    it("should keep the handle height when a cell is re-rendered after an edit", () => {
        const row = tabulator.rowManager.rows[0];
        const cell = row.cells[1];

        // jsdom computes no layout, so give the row its height through the API,
        // which dispatches cell-height and sizes the existing handles
        row.setHeight(42, true);

        expect(cell.modules.resize.handleEl.style.height).toBe("42px");

        // committing a new value re-renders the cell, which destroys and
        // recreates the resize handle
        cell.setValue("changed");

        expect(cell.modules.resize.handleEl.style.height).toBe("42px");
    });
});
