import ReactiveData from "../../../src/js/modules/ReactiveData/ReactiveData";

describe("ReactiveData module", () => {
    /** @type {ReactiveData} */
    let reactiveData;
    let mockTable;
    
    beforeEach(() => {
        // Create mock rowManager
        const mockRowManager = {
            addRowActual: jest.fn(),
            getRowFromDataObject: jest.fn(),
            reRenderInPosition: jest.fn(),
            refreshActiveData: jest.fn()
        };
        
        // Create mock dataTree module
        const mockDataTree = {
            initializeRow: jest.fn(),
            layoutRow: jest.fn()
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            rowManager: mockRowManager,
            modules: {
                dataTree: mockDataTree
            },
            options: {
                reactiveData: false,
                dataTree: false,
                dataTreeChildField: "children"
            },
            eventBus: mockEventBus
        };
        
        // Mock methods in the ReactiveData prototype
        jest.spyOn(ReactiveData.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(ReactiveData.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        // Create an instance of the ReactiveData module with the mock table
        reactiveData = new ReactiveData(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should register reactiveData table option during construction", () => {
        // Verify table option is registered
        expect(mockTable.options.reactiveData).toBe(false);
    });
    
    it("should not subscribe to events if reactiveData is disabled", () => {
        // Initialize module with reactiveData = false
        mockTable.options.reactiveData = false;
        reactiveData.initialize();
        
        // Verify no events are subscribed
        expect(mockTable.eventBus.subscribe).not.toHaveBeenCalled();
    });
    
    it("should subscribe to events when reactiveData is enabled", () => {
        // Initialize module with reactiveData = true
        mockTable.options.reactiveData = true;
        reactiveData.initialize();
        
        // Verify events are subscribed
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-value-save-before", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-value-save-after", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-data-save-before", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-data-save-after", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-data-init-after", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("data-processing", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("table-destroy", expect.any(Function));
    });
    
    it("should block and unblock reactivity", () => {
        // Initially not blocked
        expect(reactiveData.blocked).toBe(false);
        
        // Block reactivity
        reactiveData.block("test");
        expect(reactiveData.blocked).toBe("test");
        
        // Try to block with another key
        reactiveData.block("another");
        expect(reactiveData.blocked).toBe("test"); // Still blocked by first key
        
        // Unblock with wrong key
        reactiveData.unblock("wrong");
        expect(reactiveData.blocked).toBe("test"); // Still blocked
        
        // Unblock with correct key
        reactiveData.unblock("test");
        expect(reactiveData.blocked).toBe(false); // Unblocked
    });
    
    it("should watch a row and its data properties", () => {
        // Create a mock row
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John",
                age: 30
            }),
            updateData: jest.fn()
        };
        
        // Spy on watchKey
        jest.spyOn(reactiveData, 'watchKey');
        
        // Watch row
        reactiveData.watchRow(mockRow);
        
        // Verify watchKey was called for each property
        expect(reactiveData.watchKey).toHaveBeenCalledWith(mockRow, mockRow.getData(), "id");
        expect(reactiveData.watchKey).toHaveBeenCalledWith(mockRow, mockRow.getData(), "name");
        expect(reactiveData.watchKey).toHaveBeenCalledWith(mockRow, mockRow.getData(), "age");
    });
    
    it("should watch tree children if dataTree is enabled", () => {
        // Enable dataTree
        mockTable.options.dataTree = true;
        
        // Create a mock row with children
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John",
                children: [
                    { id: 2, name: "Jane" }
                ]
            }),
            updateData: jest.fn()
        };
        
        // Spy on watchTreeChildren
        jest.spyOn(reactiveData, 'watchTreeChildren');
        
        // Watch row
        reactiveData.watchRow(mockRow);
        
        // Verify watchTreeChildren was called
        expect(reactiveData.watchTreeChildren).toHaveBeenCalledWith(mockRow);
    });
    
    it("should watch a data property and trigger updates when it changes", () => {
        // Create a mock row
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John"
            }),
            updateData: jest.fn()
        };
        
        // Watch the name property
        reactiveData.watchKey(mockRow, mockRow.getData(), "name");
        
        // Change the property value
        mockRow.getData().name = "Jane";
        
        // Verify updateData was called with the new value
        expect(mockRow.updateData).toHaveBeenCalledWith({ name: "Jane" });
    });
    
    it("should not trigger updates when property changes if reactivity is blocked", () => {
        // Create a mock row
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John"
            }),
            updateData: jest.fn()
        };
        
        // Watch the name property
        reactiveData.watchKey(mockRow, mockRow.getData(), "name");
        
        // Block reactivity
        reactiveData.block("test");
        
        // Change the property value
        mockRow.getData().name = "Jane";
        
        // Verify updateData was not called
        expect(mockRow.updateData).not.toHaveBeenCalled();
    });
    
    it("should watch and react to tree children array manipulations", () => {
        // Create a mock row with children array
        const children = [
            { id: 2, name: "Jane" },
            { id: 3, name: "Bob" }
        ];
        
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John",
                children: children
            })
        };
        
        // Spy on rebuildTree
        jest.spyOn(reactiveData, 'rebuildTree');
        
        // Watch children array
        reactiveData.watchTreeChildren(mockRow);
        
        // Test push
        children.push({ id: 4, name: "Alice" });
        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(mockRow);
        
        // Reset spy
        reactiveData.rebuildTree.mockClear();
        
        // Test unshift
        children.unshift({ id: 5, name: "Tom" });
        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(mockRow);
        
        // Reset spy
        reactiveData.rebuildTree.mockClear();
        
        // Test pop
        children.pop();
        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(mockRow);
        
        // Reset spy
        reactiveData.rebuildTree.mockClear();
        
        // Test shift
        children.shift();
        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(mockRow);
        
        // Reset spy
        reactiveData.rebuildTree.mockClear();
        
        // Test splice
        children.splice(0, 1, { id: 6, name: "Sam" });
        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(mockRow);
    });
    
    it("should not trigger tree rebuilds when array manipulations happen while blocked", () => {
        // Create a mock row with children array
        const children = [
            { id: 2, name: "Jane" },
            { id: 3, name: "Bob" }
        ];
        
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John",
                children: children
            })
        };
        
        // Spy on rebuildTree
        jest.spyOn(reactiveData, 'rebuildTree');
        
        // Watch children array
        reactiveData.watchTreeChildren(mockRow);
        
        // Block reactivity
        reactiveData.block("test");
        
        // Test various operations
        children.push({ id: 4, name: "Alice" });
        children.unshift({ id: 5, name: "Tom" });
        children.pop();
        children.shift();
        children.splice(0, 1, { id: 6, name: "Sam" });
        
        // Verify rebuildTree was not called
        expect(reactiveData.rebuildTree).not.toHaveBeenCalled();
    });
    
    it("should invoke required methods when rebuilding a tree", () => {
        // Create a mock row
        const mockRow = {
            id: 1,
            name: "John"
        };
        
        // Call rebuildTree
        reactiveData.rebuildTree(mockRow);
        
        // Verify dataTree methods were called
        expect(mockTable.modules.dataTree.initializeRow).toHaveBeenCalledWith(mockRow);
        expect(mockTable.modules.dataTree.layoutRow).toHaveBeenCalledWith(mockRow);
        expect(mockTable.rowManager.refreshActiveData).toHaveBeenCalledWith("tree", false, true);
    });
    
    it("should watch data array and override array methods", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Store original array methods
        const origPush = testData.push;
        const origUnshift = testData.unshift;
        const origShift = testData.shift;
        const origPop = testData.pop;
        const origSplice = testData.splice;
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Verify methods were overridden
        expect(testData.push).not.toBe(origPush);
        expect(testData.unshift).not.toBe(origUnshift);
        expect(testData.shift).not.toBe(origShift);
        expect(testData.pop).not.toBe(origPop);
        expect(testData.splice).not.toBe(origSplice);
        
        // Verify data was stored
        expect(reactiveData.data).toBe(testData);
        expect(reactiveData.origFuncs.push).toBe(origPush);
        expect(reactiveData.origFuncs.unshift).toBe(origUnshift);
        expect(reactiveData.origFuncs.shift).toBe(origShift);
        expect(reactiveData.origFuncs.pop).toBe(origPop);
        expect(reactiveData.origFuncs.splice).toBe(origSplice);
    });
    
    it("should handle push operations on the data array", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Create a new row object
        const newRow = { id: 3, name: "Bob" };
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Call push
        testData.push(newRow);
        
        // Verify row was added
        expect(mockTable.rowManager.addRowActual).toHaveBeenCalledWith(newRow, false);
    });
    
    it("should handle unshift operations on the data array", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Create a new row object
        const newRow = { id: 3, name: "Bob" };
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Call unshift
        testData.unshift(newRow);
        
        // Verify row was added
        expect(mockTable.rowManager.addRowActual).toHaveBeenCalledWith(newRow, true);
    });
    
    it("should handle shift operations on the data array", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Create a mock row with a delete method
        const mockRow = {
            deleteActual: jest.fn()
        };
        
        // Store reference to first item before shift
        const firstItem = testData[0];
        
        // Configure rowManager to return the mock row
        mockTable.rowManager.getRowFromDataObject.mockReturnValue(mockRow);
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Call shift
        testData.shift();
        
        // Verify the row was retrieved and deleted
        expect(mockTable.rowManager.getRowFromDataObject).toHaveBeenCalledWith(firstItem);
        expect(mockRow.deleteActual).toHaveBeenCalled();
    });
    
    it("should handle pop operations on the data array", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Create a mock row with a delete method
        const mockRow = {
            deleteActual: jest.fn()
        };
        
        // Store reference to last item before pop
        const lastItem = testData[testData.length - 1];
        
        // Configure rowManager to return the mock row
        mockTable.rowManager.getRowFromDataObject.mockReturnValue(mockRow);
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Call pop
        testData.pop();
        
        // Verify the row was retrieved and deleted
        expect(mockTable.rowManager.getRowFromDataObject).toHaveBeenCalledWith(lastItem);
        expect(mockRow.deleteActual).toHaveBeenCalled();
    });
    
    it("should handle splice operations on the data array", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
            { id: 3, name: "Bob" }
        ];
        
        // Create a new row and a mock row
        const newRow = { id: 4, name: "Alice" };
        const mockRow = {
            deleteActual: jest.fn()
        };
        
        // Configure rowManager to return the mock row for the removed row
        mockTable.rowManager.getRowFromDataObject.mockReturnValue(mockRow);
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Call splice to remove one row and add a new one
        testData.splice(1, 1, newRow);
        
        // Verify rows were added and removed appropriately
        expect(mockTable.rowManager.addRowActual).toHaveBeenCalled();
        expect(mockTable.rowManager.getRowFromDataObject).toHaveBeenCalled();
        expect(mockRow.deleteActual).toHaveBeenCalled();
        expect(mockTable.rowManager.reRenderInPosition).toHaveBeenCalled();
    });
    
    it("should not trigger data operations when reactivity is blocked", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Block reactivity
        reactiveData.block("test");
        
        // Call various operations
        testData.push({ id: 3, name: "Bob" });
        testData.unshift({ id: 4, name: "Alice" });
        testData.pop();
        testData.shift();
        testData.splice(0, 1, { id: 5, name: "Sam" });
        
        // Verify no changes were processed
        expect(mockTable.rowManager.addRowActual).not.toHaveBeenCalled();
        expect(mockTable.rowManager.getRowFromDataObject).not.toHaveBeenCalled();
        expect(mockTable.rowManager.reRenderInPosition).not.toHaveBeenCalled();
    });
    
    it("should unwatchData and restore original array methods", () => {
        // Create a test data array
        const testData = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" }
        ];
        
        // Store original methods
        const origPush = testData.push;
        
        // Watch data
        reactiveData.watchData(testData);
        
        // Verify methods were changed
        expect(testData.push).not.toBe(origPush);
        
        // Spy on Object.defineProperty
        jest.spyOn(Object, 'defineProperty');
        
        // Unwatch data
        reactiveData.unwatchData();
        
        // Verify Object.defineProperty was called to restore methods
        expect(Object.defineProperty).toHaveBeenCalledWith(testData, "push", expect.any(Object));
        expect(Object.defineProperty).toHaveBeenCalledWith(testData, "unshift", expect.any(Object));
        expect(Object.defineProperty).toHaveBeenCalledWith(testData, "shift", expect.any(Object));
        expect(Object.defineProperty).toHaveBeenCalledWith(testData, "pop", expect.any(Object));
        expect(Object.defineProperty).toHaveBeenCalledWith(testData, "splice", expect.any(Object));
    });
    
    it("should unwatchRow and restore original property definitions", () => {
        // Create a mock row
        const mockRow = {
            getData: jest.fn().mockReturnValue({
                id: 1,
                name: "John"
            })
        };
        
        // Spy on Object.defineProperty
        jest.spyOn(Object, 'defineProperty');
        
        // Unwatch row
        reactiveData.unwatchRow(mockRow);
        
        // Verify Object.defineProperty was called for each property
        expect(Object.defineProperty).toHaveBeenCalledWith(mockRow.getData(), "id", expect.any(Object));
        expect(Object.defineProperty).toHaveBeenCalledWith(mockRow.getData(), "name", expect.any(Object));
    });
    
    it("should update currentVersion when watching new data", () => {
        // Initial version should be 0
        expect(reactiveData.currentVersion).toBe(0);
        
        // Watch data
        reactiveData.watchData([]);
        
        // Version should be incremented
        expect(reactiveData.currentVersion).toBe(1);
        
        // Watch another data array
        reactiveData.watchData([]);
        
        // Version should be incremented again
        expect(reactiveData.currentVersion).toBe(2);
    });
});
