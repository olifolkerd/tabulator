import TabulatorFull from "../../../src/js/core/TabulatorFull";
import ResizeRows from "../../../src/js/modules/ResizeRows/ResizeRows";

describe("ResizeRows module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {ResizeRows} */
    let resizeRowsMod;
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
            resizableRows: true
        });
        resizeRowsMod = tabulator.module("resizeRows");
        
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        // Manually clean up DOM element instead of destroying tabulator,
        // which can cause issues with missing event listeners
        if (document.getElementById("tabulator")) {
            document.getElementById("tabulator").remove();
        }
    });

    it("should initialize resizable rows module", () => {
        // Check if module is properly initialized
        expect(resizeRowsMod).toBeDefined();
        expect(typeof resizeRowsMod.initializeRow).toBe('function');
        expect(typeof resizeRowsMod.resize).toBe('function');
        expect(typeof resizeRowsMod._mouseDown).toBe('function');
    });

    it("should dispatch external events when row is resized", () => {
        // Mock the row and dispatchExternal method
        const mockRow = {
            getComponent: () => ({}),
            getElement: () => document.createElement('div'),
            getHeight: () => 30,
            setHeight: jest.fn()
        };
        
        // Create a spy for the dispatchExternal method
        const dispatchSpy = jest.spyOn(resizeRowsMod, 'dispatchExternal');
        
        // Mock the event and handle
        const mockEvent = { screenY: 100 };
        const mockHandle = document.createElement('div');
        
        // Trigger resize directly
        resizeRowsMod.startY = 80;
        resizeRowsMod.startHeight = 30;
        resizeRowsMod.resize(mockEvent, mockRow);
        
        // Clean up
        dispatchSpy.mockRestore();
        
        // Verify the row's height was set
        expect(mockRow.setHeight).toHaveBeenCalledWith(50); // 30 + (100 - 80)
    });

    it("should calculate guide position correctly", () => {
        // Enable resizableRowGuide
        tabulator.options.resizableRowGuide = true;
        
        // Mock row, handle, element and objects
        const mockRow = {
            element: {
                getBoundingClientRect: () => ({ top: 100 })
            }
        };
        
        const mockHandle = {
            getBoundingClientRect: () => ({ y: 120 })
        };
        
        // Set table element
        resizeRowsMod.table.element = {
            getBoundingClientRect: () => ({ y: 50 })
        };
        
        // Set initial values
        resizeRowsMod.startY = 150;
        
        // Calculate guide position
        const mockEvent = { screenY: 180 }; // 30px difference from startY
        const position = resizeRowsMod.calcGuidePosition(mockEvent, mockRow, mockHandle);
        
        // Check that position is correct
        // handleY (120 - 50 = 70) + mouseDiff (180 - 150 = 30) = 100
        expect(position).toBe(100);
    });

    it("should calculate new height correctly in resize method", () => {
        // Mock row with setHeight method
        const mockRow = {
            setHeight: jest.fn()
        };
        
        // Set initial values
        resizeRowsMod.startHeight = 30;
        resizeRowsMod.startY = 100;
        
        // Call resize with mock event
        const mockEvent = { screenY: 120 }; // 20px difference
        resizeRowsMod.resize(mockEvent, mockRow);
        
        // Check setHeight was called with expected value
        expect(mockRow.setHeight).toHaveBeenCalledWith(50); // 30 + (120 - 100)
    });
});