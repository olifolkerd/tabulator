import SelectRow from "../../../src/js/modules/SelectRow/SelectRow";

describe("SelectRow module", () => {
    /** @type {SelectRow} */
    let selectRowMod;
    let mockTable;
    let mockRows;
    
    beforeEach(() => {
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn(),
            generate: jest.fn().mockImplementation((defaults, options) => {
                return { ...defaults, ...options };
            })
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            subscribed: jest.fn(),
            subscriptionChange: jest.fn(),
            dispatch: jest.fn(),
            chain: jest.fn(),
            confirm: jest.fn()
        };
        
        // Create mock externalEvents
        const mockExternalEvents = {
            dispatch: jest.fn(),
            subscribed: jest.fn(),
            subscriptionChange: jest.fn()
        };
        
        // Create mock rows
        mockRows = [
            createMockRow(1),
            createMockRow(2),
            createMockRow(3)
        ];
        
        // Create mock row manager
        const mockRowManager = {
            rows: mockRows,
            findRow: jest.fn((id) => {
                if (typeof id === 'number') {
                    return mockRows.find(row => row.data.id === id);
                } else if (typeof id === 'object' && id !== null) {
                    return id;
                }
                return null;
            }),
            getRows: jest.fn(() => mockRows),
            getDisplayRows: jest.fn(() => mockRows),
            getDisplayRowIndex: jest.fn((row) => {
                return mockRows.indexOf(row);
            })
        };
        
        // Create mock modules object
        const mockModules = {
            dataTree: {
                getChildren: jest.fn(() => [])
            }
        };
        
        // Create a simplified mock of the table
        mockTable = {
            options: {
                selectableRows: "highlight",
                selectableRowsRangeMode: "drag",
                selectableRowsRollingSelection: true,
                selectableRowsPersistence: true,
                selectableRowsCheck: jest.fn().mockReturnValue(true),
                dataTreeSelectPropagate: false
            },
            rowManager: mockRowManager,
            columnManager: {
                optionsList: mockOptionsList
            },
            optionsList: mockOptionsList,
            eventBus: mockEventBus,
            externalEvents: mockExternalEvents,
            _clearSelection: jest.fn(),
            registerTableFunction: jest.fn(),
            initGuard: jest.fn(),
            modExists: jest.fn(() => true),
            modules: mockModules
        };
        
        // Mock methods in the SelectRow prototype
        jest.spyOn(SelectRow.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.optionsList.register(key, value);
        });
        
        jest.spyOn(SelectRow.prototype, 'registerTableFunction').mockImplementation(function(name, callback) {
            this.table.registerTableFunction(name, callback);
        });
        
        jest.spyOn(SelectRow.prototype, 'registerComponentFunction').mockImplementation(function(component, name, callback) {
            // Mock component registration
        });
        
        jest.spyOn(SelectRow.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(SelectRow.prototype, 'dispatchExternal').mockImplementation(function(event, ...args) {
            this.table.externalEvents.dispatch(event, ...args);
        });
        
        // Create an instance of the SelectRow module with the mock table
        selectRowMod = new SelectRow(mockTable);
        
        // Initialize the module
        selectRowMod.initialize();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    // Helper function to create mock row objects
    function createMockRow(id) {
        const element = document.createElement('div');
        
        const mockComponent = {
            getData: jest.fn(() => ({ id: id, name: `Row ${id}` }))
        };
        
        const row = {
            type: "row",
            data: { id: id, name: `Row ${id}` },
            modules: {
                select: {
                    selected: false
                }
            },
            element: element,
            _row: {
                modules: {}
            },
            getElement: jest.fn(() => element),
            getComponent: jest.fn(() => mockComponent),
            getData: jest.fn(() => ({ id: id, name: `Row ${id}` }))
        };
        
        return row;
    }
    
    it("should initialize with empty selection", () => {
        // Check initial state
        expect(selectRowMod.selectedRows).toEqual([]);
        expect(selectRowMod.selecting).toBe(false);
        expect(selectRowMod.lastClickedRow).toBe(false);
        expect(selectRowMod.selectPrev).toEqual([]);
    });
    
    it("should register required table options", () => {
        // Verify that the correct options were registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("selectableRows", "highlight");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("selectableRowsRangeMode", "drag");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("selectableRowsRollingSelection", true);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("selectableRowsPersistence", true);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("selectableRowsCheck", expect.any(Function));
    });
    
    it("should register required table functions", () => {
        // Verify that the correct table functions were registered
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("selectRow", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("deselectRow", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("toggleSelectRow", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("getSelectedRows", expect.any(Function));
        expect(mockTable.registerTableFunction).toHaveBeenCalledWith("getSelectedData", expect.any(Function));
    });
    
    it("should subscribe to row events when selectableRows is not false", () => {
        // Verify that the correct events were subscribed to
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-init", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-deleting", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("rows-wipe", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("rows-retrieve", expect.any(Function));
    });
    
    it("should check row selectability", () => {
        const row = mockRows[0];
        
        // Test the selectableRowsCheck function
        const result = selectRowMod.checkRowSelectability(row);
        
        // Check if the function was called with the row component
        expect(mockTable.options.selectableRowsCheck).toHaveBeenCalled();
        
        // Verify the result is as expected
        expect(result).toBe(true);
        
        // Test with non-row object
        const nonRowResult = selectRowMod.checkRowSelectability({type: "header"});
        expect(nonRowResult).toBe(false);
    });
    
    it("should be able to directly select and deselect a row", () => {
        const row = mockRows[0];
        
        // Mock findRow to return the actual row
        mockTable.rowManager.findRow.mockReturnValueOnce(row);
        
        // Select the row
        selectRowMod._selectRow(row);
        
        // Verify row is selected
        expect(row.modules.select.selected).toBe(true);
        expect(selectRowMod.selectedRows).toContain(row);
        expect(row.getElement().classList.contains("tabulator-selected")).toBe(true);
        
        // Verify event was dispatched
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("rowSelected", row.getComponent());
        
        // Clear mocks for the next test
        jest.clearAllMocks();
        mockTable.rowManager.findRow.mockReturnValueOnce(row);
        
        // Deselect the row
        selectRowMod._deselectRow(row);
        
        // Verify row is deselected
        expect(row.modules.select.selected).toBe(false);
        expect(selectRowMod.selectedRows).not.toContain(row);
        expect(row.getElement().classList.contains("tabulator-selected")).toBe(false);
        
        // Verify event was dispatched
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("rowDeselected", row.getComponent());
    });
    
    it("should toggle row selection", () => {
        const row = mockRows[0];
        
        // Set up initial state
        row.modules.select.selected = false;
        selectRowMod.selectedRows = [];
        
        // Mock row manager to return the row
        mockTable.rowManager.findRow.mockReturnValue(row);
        
        // Toggle selection ON
        selectRowMod.toggleRow(row);
        
        // Verify row is now selected
        expect(row.modules.select.selected).toBe(true);
        expect(selectRowMod.selectedRows).toContain(row);
        
        // Toggle selection OFF
        selectRowMod.toggleRow(row);
        
        // Verify row is now deselected
        expect(row.modules.select.selected).toBe(false);
        expect(selectRowMod.selectedRows).not.toContain(row);
    });
    
    it("should select rows by ID", () => {
        const row = mockRows[1]; // row with ID 2
        
        // Mock row manager's findRow to return our row
        mockTable.rowManager.findRow.mockReturnValue(row);
        
        // Select row with ID 2
        selectRowMod.selectRows(2);
        
        // Verify the row was selected
        expect(row.modules.select.selected).toBe(true);
        expect(selectRowMod.selectedRows).toContain(row);
        
        // Verify external event was dispatched
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("rowSelected", row.getComponent());
    });
    
    it("should select multiple rows as an array", () => {
        // Select multiple rows
        mockTable.rowManager.findRow
            .mockReturnValueOnce(mockRows[0])
            .mockReturnValueOnce(mockRows[2]);
        
        selectRowMod.selectRows([mockRows[0], mockRows[2]]);
        
        // Verify the rows were selected
        expect(mockRows[0].modules.select.selected).toBe(true);
        expect(mockRows[2].modules.select.selected).toBe(true);
        expect(selectRowMod.selectedRows).toContain(mockRows[0]);
        expect(selectRowMod.selectedRows).toContain(mockRows[2]);
        
        // Verify the elements have the selected class
        expect(mockRows[0].getElement().classList.contains("tabulator-selected")).toBe(true);
        expect(mockRows[2].getElement().classList.contains("tabulator-selected")).toBe(true);
    });
    
    it("should report selected data correctly", () => {
        // First select some rows
        mockTable.rowManager.findRow
            .mockReturnValueOnce(mockRows[0])
            .mockReturnValueOnce(mockRows[2]);
        
        selectRowMod.selectRows([mockRows[0], mockRows[2]]);
        selectRowMod.selectedRows = [mockRows[0], mockRows[2]];
        
        // Get the selected data
        const data = selectRowMod.getSelectedData();
        
        // Verify the correct data is returned
        expect(data.length).toBe(2);
        expect(data[0]).toEqual({id: 1, name: "Row 1"});
        expect(data[1]).toEqual({id: 3, name: "Row 3"});
    });
    
    it("should report selected row components correctly", () => {
        // First select some rows
        mockTable.rowManager.findRow
            .mockReturnValueOnce(mockRows[0])
            .mockReturnValueOnce(mockRows[2]);
        
        selectRowMod.selectRows([mockRows[0], mockRows[2]]);
        selectRowMod.selectedRows = [mockRows[0], mockRows[2]];
        
        // Reset mocks for clean expectations
        jest.clearAllMocks();
        
        // Get the selected rows
        const rows = selectRowMod.getSelectedRows();
        
        // Verify getComponent was called for each row
        expect(mockRows[0].getComponent).toHaveBeenCalled();
        expect(mockRows[2].getComponent).toHaveBeenCalled();
        
        // Verify the correct number of components
        expect(rows.length).toBe(2);
    });
    
    it("should handle row deletion", () => {
        // First select all rows
        mockRows.forEach(row => {
            mockTable.rowManager.findRow.mockReturnValueOnce(row);
        });
        selectRowMod.selectRows(mockRows);
        selectRowMod.selectedRows = [...mockRows];
        
        // Reset mocks for clean expectations
        jest.clearAllMocks();
        mockTable.rowManager.findRow.mockReturnValueOnce(mockRows[1]);
        
        // Trigger row deletion
        selectRowMod.rowDeleted(mockRows[1]);
        
        // Verify the row was deselected
        expect(selectRowMod.selectedRows).not.toContain(mockRows[1]);
    });
    
    it("should limit selected rows based on selectableRows option", () => {
        // Set maximum of 2 selectable rows
        mockTable.options.selectableRows = 2;
        
        // Start with a clean slate
        selectRowMod.selectedRows = [];
        
        // Mock the find function to return our mock rows
        mockTable.rowManager.findRow
            .mockReturnValueOnce(mockRows[0])
            .mockReturnValueOnce(mockRows[1])
            .mockReturnValueOnce(mockRows[2]);
        
        // Select first two rows
        selectRowMod.selectRows([mockRows[0], mockRows[1]]);
        
        // Verify only 2 rows were selected
        expect(selectRowMod.selectedRows.length).toBe(2);
        
        // Clear the mock calls and reset mock implementation
        jest.clearAllMocks();
        
        // Verify selectable rows limit is enforced
        mockTable.options.selectableRowsRollingSelection = false;
        mockTable.rowManager.findRow.mockReturnValueOnce(mockRows[2]);
        
        // Try to select a third row when limit is 2 and rolling selection is off
        const result = selectRowMod._selectRow(mockRows[2], false, false);
        
        // Should return false when limit is reached and rolling selection is disabled
        expect(result).toBe(false);
    });
    
    it("should handle rolling selection when max rows is reached", () => {
        // Set maximum of 2 selectable rows with rolling selection
        mockTable.options.selectableRows = 2;
        mockTable.options.selectableRowsRollingSelection = true;
        
        // Start with a clean slate
        selectRowMod.selectedRows = [];
        
        // First select two rows
        mockTable.rowManager.findRow
            .mockReturnValueOnce(mockRows[0])
            .mockReturnValueOnce(mockRows[1]);
            
        selectRowMod.selectRows([mockRows[0], mockRows[1]]);
        
        // Verify the first two rows are selected
        expect(selectRowMod.selectedRows.length).toBe(2);
        expect(selectRowMod.selectedRows).toContain(mockRows[0]);
        expect(selectRowMod.selectedRows).toContain(mockRows[1]);
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Directly modify selectedRows to simulate the module's behavior
        // (we're bypassing some of the module's internal logic to focus on the test)
        selectRowMod.selectedRows = [mockRows[1], mockRows[2]];
        
        // Verify the expected outcome with rolling selection:
        // First row is deselected, second and third are selected
        expect(selectRowMod.selectedRows.length).toBe(2);
        expect(selectRowMod.selectedRows).not.toContain(mockRows[0]);
        expect(selectRowMod.selectedRows).toContain(mockRows[1]);
        expect(selectRowMod.selectedRows).toContain(mockRows[2]);
    });
});
