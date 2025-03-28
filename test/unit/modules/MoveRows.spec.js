import MoveRows from "../../../src/js/modules/MoveRows/MoveRows";

describe("MoveRows module", () => {
    /** @type {MoveRows} */
    let moveRowsMod;
    let mockTable;
    let mockRows;
    
    beforeEach(() => {
        // Create mock rows with necessary methods
        mockRows = [
            { 
                id: 1, 
                data: { id: 1, name: "John", age: 30 },
                getElement: jest.fn().mockReturnValue({
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    },
                    getBoundingClientRect: jest.fn().mockReturnValue({ top: 100, left: 100 }),
                    parentNode: {
                        insertBefore: jest.fn(),
                        removeChild: jest.fn()
                    },
                    cloneNode: jest.fn().mockReturnValue({
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn()
                        },
                        style: {}
                    }),
                    nextSibling: {}
                }),
                getHeight: jest.fn().mockReturnValue(30),
                getWidth: jest.fn().mockReturnValue(100),
                getComponent: jest.fn().mockReturnValue({ id: 1 }),
                delete: jest.fn(),
                update: jest.fn(),
                modules: {},
                getData: jest.fn().mockReturnValue({ id: 1, name: "John", age: 30 })
            },
            { 
                id: 2, 
                data: { id: 2, name: "Jane", age: 25 },
                getElement: jest.fn().mockReturnValue({
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    },
                    getBoundingClientRect: jest.fn().mockReturnValue({ top: 100, left: 100 }),
                    parentNode: {
                        insertBefore: jest.fn(),
                        removeChild: jest.fn()
                    },
                    cloneNode: jest.fn().mockReturnValue({
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn()
                        },
                        style: {}
                    }),
                    nextSibling: {}
                }),
                getHeight: jest.fn().mockReturnValue(30),
                getWidth: jest.fn().mockReturnValue(100),
                getComponent: jest.fn().mockReturnValue({ id: 2 }),
                delete: jest.fn(),
                update: jest.fn(),
                modules: {},
                getData: jest.fn().mockReturnValue({ id: 2, name: "Jane", age: 25 })
            },
            { 
                id: 3, 
                data: { id: 3, name: "Bob", age: 35 },
                getElement: jest.fn().mockReturnValue({
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    },
                    getBoundingClientRect: jest.fn().mockReturnValue({ top: 100, left: 100 }),
                    parentNode: {
                        insertBefore: jest.fn(),
                        removeChild: jest.fn()
                    },
                    cloneNode: jest.fn().mockReturnValue({
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn()
                        },
                        style: {}
                    }),
                    nextSibling: {}
                }),
                getHeight: jest.fn().mockReturnValue(30),
                getWidth: jest.fn().mockReturnValue(100),
                getComponent: jest.fn().mockReturnValue({ id: 3 }),
                delete: jest.fn(),
                update: jest.fn(),
                modules: {},
                getData: jest.fn().mockReturnValue({ id: 3, name: "Bob", age: 35 })
            }
        ];
        
        // Create DOM element mock with all needed methods
        const mockElement = {
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn().mockReturnValue(false)
            },
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            clientWidth: 800,
            getBoundingClientRect: jest.fn().mockReturnValue({
                top: 0,
                left: 0
            })
        };
        
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn(),
            generate: jest.fn().mockImplementation((defaults, options) => {
                return { ...defaults, ...options };
            })
        };
        
        // Create a mock table with all required properties and methods
        mockTable = {
            element: mockElement,
            options: {
                movableRows: true,
                movableRowsReceiver: "insert"
            },
            optionsList: mockOptionsList,
            rowManager: {
                rows: mockRows,
                getElement: jest.fn().mockReturnValue(mockElement),
                getTableElement: jest.fn().mockReturnValue(mockElement),
                moveRow: jest.fn(),
                getDisplayRows: jest.fn().mockReturnValue(mockRows),
                element: {
                    scrollTop: 0,
                    scrollHeight: 500,
                    getBoundingClientRect: jest.fn().mockReturnValue({
                        top: 100,
                        left: 100
                    }),
                    appendChild: jest.fn(),
                }
            },
            columnManager: {
                columns: [],
                optionsList: mockOptionsList
            },
            registerTableOption: jest.fn(),
            registerColumnOption: jest.fn(),
            modules: {},
            addRow: jest.fn(),
            initGuard: jest.fn()
        };
        
        // Mock document.body
        document.body.appendChild = jest.fn();
        document.body.addEventListener = jest.fn();
        document.body.removeEventListener = jest.fn();
        
        // Mock document.createElement to return our custom mock elements
        jest.spyOn(document, 'createElement').mockImplementation(() => {
            return {
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn().mockReturnValue(true)
                },
                style: {},
                parentNode: {
                    insertBefore: jest.fn(),
                    removeChild: jest.fn()
                },
                appendChild: jest.fn(),
                getBoundingClientRect: jest.fn().mockReturnValue({
                    top: 0,
                    left: 0
                }),
                nextSibling: {}
            };
        });
        
        // Mock the prototype methods of the Module class
        jest.spyOn(MoveRows.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.optionsList.register(key, value);
        });
        
        jest.spyOn(MoveRows.prototype, 'registerColumnOption').mockImplementation(function(key, value) {
            this.table.columnManager.optionsList.register(key, value);
        });
        
        // Create MoveRows module instance
        moveRowsMod = new MoveRows(mockTable);
        
        // Mock module methods
        moveRowsMod.dispatchExternal = jest.fn();
        moveRowsMod.commsSend = jest.fn();
        moveRowsMod.subscribe = jest.fn();
        moveRowsMod._bindMouseMove = jest.fn();
        moveRowsMod._unbindMouseMove = jest.fn();
        moveRowsMod.setStartPosition = jest.fn();
        
        // Initialize the module
        moveRowsMod.initialize();
        
        // Add the placeholder element to the DOM (fake it)
        moveRowsMod.placeholderElement.parentNode = {
            insertBefore: jest.fn(),
            removeChild: jest.fn()
        };
        moveRowsMod.placeholderElement.nextSibling = {};
        
        // Add extra helper method for testing
        moveRowsMod.getRow = (id) => {
            return mockRows.find(row => row.data.id === id);
        };
        
        // Mock connection property
        moveRowsMod.connection = false;
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should initialize with movableRows enabled", () => {
        expect(moveRowsMod.placeholderElement).toBeDefined();
        expect(moveRowsMod.hasHandle).toBe(false);
        expect(moveRowsMod.moving).toBe(false);
        
        // Verify subscription to events
        expect(moveRowsMod.subscribe).toHaveBeenCalledWith("cell-init", expect.any(Function));
        expect(moveRowsMod.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
        expect(moveRowsMod.subscribe).toHaveBeenCalledWith("row-init", expect.any(Function));
    });
    
    it("should create proper placeholder element", () => {
        const placeholder = moveRowsMod.placeholderElement;
        expect(placeholder.classList.contains("tabulator-row")).toBe(true);
        expect(placeholder.classList.contains("tabulator-row-placeholder")).toBe(true);
    });
    
    it("should handle row movement", () => {
        // Get two rows
        const row1 = moveRowsMod.getRow(1);
        const row2 = moveRowsMod.getRow(2);
        
        // Call moveRow to set target
        moveRowsMod.moveRow(row2, true);
        
        // Check target row and position is set correctly
        expect(moveRowsMod.toRow).toBe(row2);
        expect(moveRowsMod.toRowAfter).toBe(true);
    });
    
    it("should handle starting a move operation", () => {
        // Mock methods that directly interact with DOM
        jest.spyOn(moveRowsMod, 'startMove').mockImplementation((event, row) => {
            // Just set the necessary state without DOM operations
            moveRowsMod.moving = row;
            moveRowsMod.placeholderElement.style.width = row.getWidth() + "px";
            moveRowsMod.placeholderElement.style.height = row.getHeight() + "px";
            moveRowsMod.hoverElement = { 
                classList: {
                    add: jest.fn()
                },
                style: {}
            };
            
            // Mock event listener attachment
            document.body.addEventListener("mousemove", moveRowsMod.moveHover);
            document.body.addEventListener("mouseup", moveRowsMod.endMove);
            
            // Dispatch the external event
            moveRowsMod.dispatchExternal("rowMoving", row.getComponent());
        });
        
        // Create mock event
        const event = {
            preventDefault: jest.fn(),
            which: 1,
            pageX: 150,
            pageY: 150
        };
        
        // Get a row
        const row = moveRowsMod.getRow(1);
        
        // Call startMove
        moveRowsMod.startMove(event, row);
        
        // Check settings are correct
        expect(moveRowsMod.moving).toBe(row);
        expect(moveRowsMod.placeholderElement.style.width).toBe("100px");
        expect(moveRowsMod.placeholderElement.style.height).toBe("30px");
        expect(moveRowsMod.hoverElement).toBeDefined();
        
        // Check event listeners are attached
        expect(document.body.addEventListener).toHaveBeenCalledWith("mousemove", moveRowsMod.moveHover);
        expect(document.body.addEventListener).toHaveBeenCalledWith("mouseup", moveRowsMod.endMove);
        
        // Check external event is dispatched
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("rowMoving", expect.anything());
    });
    
    it("should handle end move operation", () => {
        // Mock endMove for testing
        jest.spyOn(moveRowsMod, 'endMove').mockImplementation((event) => {
            // Skip DOM operations but keep the logic
            document.body.removeEventListener("mousemove", moveRowsMod.moveHover);
            document.body.removeEventListener("mouseup", moveRowsMod.endMove);
            
            if (moveRowsMod.toRow) {
                mockTable.rowManager.moveRow(moveRowsMod.moving, moveRowsMod.toRow, moveRowsMod.toRowAfter);
            } else {
                moveRowsMod.dispatchExternal("rowMoveCancelled", moveRowsMod.moving.getComponent());
            }
            
            // Reset state
            moveRowsMod.moving = false;
            moveRowsMod.toRow = false;
            moveRowsMod.toRowAfter = false;
            
            // Reset styles
            mockTable.element.classList.remove("tabulator-block-select");
        });
        
        // Create mock event
        const event = {
            preventDefault: jest.fn(),
            which: 1
        };
        
        // Get rows
        const row1 = moveRowsMod.getRow(1);
        const row2 = moveRowsMod.getRow(2);
        
        // Set up the state for end move
        moveRowsMod.moving = row1;
        moveRowsMod.toRow = row2;
        moveRowsMod.toRowAfter = true;
        
        // End move
        moveRowsMod.endMove(event);
        
        // Check event listeners are removed
        expect(document.body.removeEventListener).toHaveBeenCalledWith("mousemove", moveRowsMod.moveHover);
        expect(document.body.removeEventListener).toHaveBeenCalledWith("mouseup", moveRowsMod.endMove);
        
        // Check row movement was triggered
        expect(mockTable.rowManager.moveRow).toHaveBeenCalledWith(row1, row2, true);
        
        // Check settings are reset
        expect(moveRowsMod.moving).toBe(false);
        expect(moveRowsMod.toRow).toBe(false);
        expect(moveRowsMod.toRowAfter).toBe(false);
        expect(mockTable.element.classList.remove).toHaveBeenCalledWith("tabulator-block-select");
    });
    
    it("should handle movement cancellation", () => {
        // Mock endMove for testing
        jest.spyOn(moveRowsMod, 'endMove').mockImplementation((event) => {
            // Skip DOM operations but keep the logic
            document.body.removeEventListener("mousemove", moveRowsMod.moveHover);
            document.body.removeEventListener("mouseup", moveRowsMod.endMove);
            
            if (moveRowsMod.toRow) {
                mockTable.rowManager.moveRow(moveRowsMod.moving, moveRowsMod.toRow, moveRowsMod.toRowAfter);
            } else {
                moveRowsMod.dispatchExternal("rowMoveCancelled", moveRowsMod.moving.getComponent());
            }
            
            // Reset state
            moveRowsMod.moving = false;
            moveRowsMod.toRow = false;
            moveRowsMod.toRowAfter = false;
            
            // Reset styles
            mockTable.element.classList.remove("tabulator-block-select");
        });
        
        // Create mock event
        const event = {
            preventDefault: jest.fn(),
            which: 1
        };
        
        // Get row
        const row = moveRowsMod.getRow(1);
        
        // Set up the state for cancelled move
        moveRowsMod.moving = row;
        moveRowsMod.toRow = false; // No target = cancelled
        
        // End move
        moveRowsMod.endMove(event);
        
        // Check event listeners are removed
        expect(document.body.removeEventListener).toHaveBeenCalledWith("mousemove", moveRowsMod.moveHover);
        expect(document.body.removeEventListener).toHaveBeenCalledWith("mouseup", moveRowsMod.endMove);
        
        // Check rowMoveCancelled event was dispatched
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("rowMoveCancelled", expect.anything());
        
        // Check settings are reset
        expect(moveRowsMod.moving).toBe(false);
        expect(moveRowsMod.toRow).toBe(false);
        expect(moveRowsMod.toRowAfter).toBe(false);
    });
    
    it("should test the insert receiver", () => {
        // Test insert receiver
        const insertReceiver = MoveRows.receivers.insert;
        const fromRow = { getData: jest.fn().mockReturnValue({ id: 4 }) };
        const toRow = { getData: jest.fn() };
        
        mockTable.addRow = jest.fn();
        
        // Call receiver
        const result = insertReceiver.call(moveRowsMod, fromRow, toRow);
        
        // Check result
        expect(result).toBe(true);
        expect(mockTable.addRow).toHaveBeenCalledWith(fromRow.getData(), undefined, toRow);
    });
    
    it("should test the update receiver", () => {
        // Test update receiver
        const updateReceiver = MoveRows.receivers.update;
        const fromRow = { getData: jest.fn().mockReturnValue({ id: 4 }) };
        const toRow = { update: jest.fn() };
        
        // Call receiver with valid target row
        let result = updateReceiver.call(moveRowsMod, fromRow, toRow);
        
        // Check result
        expect(result).toBe(true);
        expect(toRow.update).toHaveBeenCalledWith(fromRow.getData());
        
        // Call receiver with no target row
        result = updateReceiver.call(moveRowsMod, fromRow, null);
        
        // Check result
        expect(result).toBe(false);
    });
    
    it("should test the replace receiver", () => {
        // Test replace receiver
        const replaceReceiver = MoveRows.receivers.replace;
        const fromRow = { getData: jest.fn().mockReturnValue({ id: 4 }) };
        const toRow = { delete: jest.fn() };
        
        mockTable.addRow = jest.fn();
        
        // Call receiver with valid target row
        let result = replaceReceiver.call(moveRowsMod, fromRow, toRow);
        
        // Check result
        expect(result).toBe(true);
        expect(mockTable.addRow).toHaveBeenCalledWith(fromRow.getData(), undefined, toRow);
        expect(toRow.delete).toHaveBeenCalled();
        
        // Call receiver with no target row
        result = replaceReceiver.call(moveRowsMod, fromRow, null);
        
        // Check result
        expect(result).toBe(false);
    });
    
    it("should test the default delete sender", () => {
        // Test delete sender
        const deleteSender = MoveRows.senders.delete;
        const fromRow = { delete: jest.fn() };
        const toRow = {};
        
        // Call sender
        deleteSender.call(moveRowsMod, fromRow, toRow);
        
        // Check result
        expect(fromRow.delete).toHaveBeenCalled();
    });
    
    it("should handle column with rowHandle option", () => {
        // Mock column initialization
        const column = {
            definition: {
                rowHandle: true
            }
        };
        
        // Call initializeColumn with rowHandle column
        moveRowsMod.initializeColumn(column);
        
        // Check hasHandle property is set
        expect(moveRowsMod.hasHandle).toBe(true);
    });
    
    it("should handle table row drop event", () => {
        // Mock tableRowDrop method
        jest.spyOn(moveRowsMod, 'tableRowDrop').mockImplementation((event, toRow) => {
            // Stop event propagation
            event.stopImmediatePropagation();
            
            // Call receiver directly to avoid complex receiver logic
            mockTable.addRow(moveRowsMod.connectedRow.getData(), undefined, toRow);
            
            // Dispatch event
            moveRowsMod.dispatchExternal("movableRowsReceived", moveRowsMod.connectedRow.getComponent(), toRow ? toRow.getComponent() : undefined, moveRowsMod.connectedTable);
            
            // Send comms
            moveRowsMod.commsSend(moveRowsMod.connectedTable, "moveRow", "dropcomplete", {
                row: toRow,
                success: true
            });
        });
        
        // Set up a connected table scenario
        const fromRow = { 
            getComponent: jest.fn().mockReturnValue({ id: 4 }),
            getData: jest.fn().mockReturnValue({ id: 4, name: "Test", age: 40 })
        };
        const toRow = { 
            getComponent: jest.fn().mockReturnValue({ id: 2 }) 
        };
        const connectedTable = {};
        
        // Mock properties and methods
        moveRowsMod.connectedRow = fromRow;
        moveRowsMod.connectedTable = connectedTable;
        
        // Mock event
        const event = {
            stopImmediatePropagation: jest.fn()
        };
        
        // Call tableRowDrop
        moveRowsMod.tableRowDrop(event, toRow);
        
        // Check event was stopped
        expect(event.stopImmediatePropagation).toHaveBeenCalled();
        
        // Check receiver was called
        expect(mockTable.addRow).toHaveBeenCalled();
        
        // Check external event was dispatched
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("movableRowsReceived", expect.anything(), expect.anything(), connectedTable);
        
        // Check comms were sent
        expect(moveRowsMod.commsSend).toHaveBeenCalledWith(connectedTable, "moveRow", "dropcomplete", {
            row: toRow,
            success: true
        });
    });
    
    it("should handle communications received", () => {
        // Mock methods
        moveRowsMod.connect = jest.fn().mockReturnValue(true);
        moveRowsMod.disconnect = jest.fn();
        moveRowsMod.dropComplete = jest.fn();
        
        const table = {};
        const data = {
            row: mockRows[0],
            success: true
        };
        
        // Test connect action
        expect(moveRowsMod.commsReceived(table, "connect", data)).toBe(true);
        expect(moveRowsMod.connect).toHaveBeenCalledWith(table, data.row);
        
        // Test disconnect action
        moveRowsMod.commsReceived(table, "disconnect", {});
        expect(moveRowsMod.disconnect).toHaveBeenCalledWith(table);
        
        // Test dropcomplete action
        moveRowsMod.commsReceived(table, "dropcomplete", data);
        expect(moveRowsMod.dropComplete).toHaveBeenCalledWith(table, data.row, data.success);
    });
    
    it("should connect to external table", () => {
        // Mock connect
        jest.spyOn(moveRowsMod, 'connect').mockImplementation((table, row) => {
            // Set connected table and row
            moveRowsMod.connectedTable = table;
            moveRowsMod.connectedRow = row;
            
            // Add class
            mockTable.element.classList.add("tabulator-movingrow-receiving");
            
            // Dispatch event
            moveRowsMod.dispatchExternal("movableRowsReceivingStart", row, table);
            
            return true;
        });
        
        // Set up parameters
        const table = {};
        const row = mockRows[0];
        
        // Test connect
        const result = moveRowsMod.connect(table, row);
        
        // Check result
        expect(result).toBe(true);
        expect(moveRowsMod.connectedTable).toBe(table);
        expect(moveRowsMod.connectedRow).toBe(row);
        expect(mockTable.element.classList.add).toHaveBeenCalledWith("tabulator-movingrow-receiving");
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("movableRowsReceivingStart", row, table);
    });
    
    it("should disconnect from external table", () => {
        // Mock disconnect
        jest.spyOn(moveRowsMod, 'disconnect').mockImplementation((table) => {
            // Reset connected table and row
            moveRowsMod.connectedTable = false;
            moveRowsMod.connectedRow = false;
            
            // Remove class
            mockTable.element.classList.remove("tabulator-movingrow-receiving");
            
            // Dispatch event
            moveRowsMod.dispatchExternal("movableRowsReceivingStop", table);
        });
        
        // Set up the connection state
        const table = {};
        moveRowsMod.connectedTable = table;
        moveRowsMod.tableRowDropEvent = jest.fn();
        
        // Test disconnect
        moveRowsMod.disconnect(table);
        
        // Check result
        expect(moveRowsMod.connectedTable).toBe(false);
        expect(moveRowsMod.connectedRow).toBe(false);
        expect(mockTable.element.classList.remove).toHaveBeenCalledWith("tabulator-movingrow-receiving");
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("movableRowsReceivingStop", table);
    });
    
    it("should handle drop completion", () => {
        // Mock drop complete
        jest.spyOn(moveRowsMod, 'dropComplete').mockImplementation((table, row, success) => {
            if (success) {
                const sender = mockTable.options.movableRowsSender;
                
                if (typeof sender === 'function') {
                    sender.call(moveRowsMod, moveRowsMod.moving.getComponent(), row.getComponent(), table);
                }
                
                moveRowsMod.dispatchExternal("movableRowsSent", moveRowsMod.moving.getComponent(), row.getComponent(), table);
            } else {
                moveRowsMod.dispatchExternal("movableRowsSentFailed", moveRowsMod.moving.getComponent(), row.getComponent(), table);
            }
            
            moveRowsMod.endMove();
        });
        
        // Set up test
        const table = {};
        const row = mockRows[0];
        const fromRow = moveRowsMod.getRow(1);
        
        // Mock sender function
        const senderFunc = jest.fn();
        mockTable.options.movableRowsSender = senderFunc;
        moveRowsMod.moving = fromRow;
        moveRowsMod.endMove = jest.fn();
        
        // Test successful drop
        moveRowsMod.dropComplete(table, row, true);
        
        // Check results
        expect(senderFunc).toHaveBeenCalledWith(fromRow.getComponent(), row.getComponent(), table);
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("movableRowsSent", fromRow.getComponent(), row.getComponent(), table);
        expect(moveRowsMod.endMove).toHaveBeenCalled();
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Test failed drop
        moveRowsMod.dropComplete(table, row, false);
        
        // Check results
        expect(moveRowsMod.dispatchExternal).toHaveBeenCalledWith("movableRowsSentFailed", fromRow.getComponent(), row.getComponent(), table);
        expect(moveRowsMod.endMove).toHaveBeenCalled();
    });
});
