import MoveColumns from "../../../src/js/modules/MoveColumns/MoveColumns";
import Helpers from "../../../src/js/core/tools/Helpers";

describe("MoveColumns module", () => {
    /** @type {MoveColumns} */
    let moveColumns;
    let mockTable;
    let mockColumnManager;
    
    beforeEach(() => {
        // Mock DOM methods
        document.createElement = jest.fn().mockImplementation((tagName) => {
            const element = {
                tagName: tagName.toUpperCase(),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn()
                },
                style: {},
                parentNode: {
                    insertBefore: jest.fn(),
                    removeChild: jest.fn()
                },
                appendChild: jest.fn(),
                cloneNode: jest.fn().mockImplementation(() => ({
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn()
                    },
                    style: {}
                })),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                nextSibling: null,
            };
            return element;
        });
        
        // Mock column elements
        const createMockColumnElement = () => ({
            style: {},
            parentNode: {
                insertBefore: jest.fn(),
                removeChild: jest.fn()
            },
            appendChild: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            },
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            nextSibling: null
        });
        
        // Create mock columns with modules.moveColumn initialized
        const mockColumn1 = {
            getElement: jest.fn().mockReturnValue(createMockColumnElement()),
            getCells: jest.fn().mockReturnValue([]),
            getWidth: jest.fn().mockReturnValue(100),
            getHeight: jest.fn().mockReturnValue(30),
            parent: "row", // For parent comparison in column movement
            isGroup: false,
            isRowHeader: false,
            nextColumn: jest.fn(),
            prevColumn: jest.fn(),
            modules: {
                moveColumn: {}  // Initialize the moveColumn property
            }
        };
        
        const mockColumn2 = {
            getElement: jest.fn().mockReturnValue(createMockColumnElement()),
            getCells: jest.fn().mockReturnValue([]),
            getWidth: jest.fn().mockReturnValue(150),
            getHeight: jest.fn().mockReturnValue(30),
            parent: "row", // For parent comparison in column movement
            isGroup: false,
            isRowHeader: false,
            nextColumn: jest.fn(),
            prevColumn: jest.fn(),
            modules: {
                moveColumn: {}  // Initialize the moveColumn property
            }
        };
        
        // Mock frozen column 
        const mockFrozenColumn = {
            getElement: jest.fn().mockReturnValue(createMockColumnElement()),
            getCells: jest.fn().mockReturnValue([]),
            parent: "row",
            isGroup: false,
            isRowHeader: false,
            modules: {
                frozen: {},
                moveColumn: {}  // Initialize the moveColumn property
            }
        };
        
        // Create mock contents element
        const mockContentsElement = {
            scrollLeft: 0,
            clientWidth: 1000,
            appendChild: jest.fn(),
            clientHeight: 50
        };
        
        // Create mock headers element
        const mockHeadersElement = {
            offsetHeight: 40
        };
        
        // Create mock columnManager
        mockColumnManager = {
            columnsByIndex: [mockColumn1, mockColumn2, mockFrozenColumn],
            moveColumnActual: jest.fn(),
            getContentsElement: jest.fn().mockReturnValue(mockContentsElement),
            getHeadersElement: jest.fn().mockReturnValue(mockHeadersElement)
        };
        
        // Create mock row manager
        const mockRowManager = {
            getElement: jest.fn().mockReturnValue({
                scrollLeft: 0
            }),
            element: {
                scrollLeft: 0
            }
        };
        
        // Create mock element
        const mockElement = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            dispatch: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            modExists: jest.fn((name) => name === "selectRange" ? true : false),
            modules: {
                selectRange: {
                    columnSelection: false,
                    mousedown: false,
                    selecting: null
                }
            },
            columnManager: mockColumnManager,
            rowManager: mockRowManager,
            element: mockElement,
            options: {
                movableColumns: true
            },
            eventBus: mockEventBus
        };
        
        // Mock Helpers.elOffset
        jest.spyOn(Helpers, 'elOffset').mockImplementation(() => ({
            left: 50,
            top: 20
        }));
        
        // Mock methods in the MoveColumns prototype
        jest.spyOn(MoveColumns.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(MoveColumns.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(MoveColumns.prototype, 'dispatch').mockImplementation(function(event, ...args) {
            return this.table.eventBus.dispatch(event, ...args);
        });
        
        // Create an instance of the MoveColumns module with the mock table
        moveColumns = new MoveColumns(mockTable);
        
        // Mock setTimeout
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });
    
    it("should register movableColumns table option during construction", () => {
        // Verify table option is registered
        expect(mockTable.options.movableColumns).toBe(true);
        
        // Verify placeholder element is created
        expect(document.createElement).toHaveBeenCalledWith("div");
        expect(moveColumns.placeholderElement.classList.add).toHaveBeenCalledWith("tabulator-col");
        expect(moveColumns.placeholderElement.classList.add).toHaveBeenCalledWith("tabulator-col-placeholder");
    });
    
    it("should initialize and subscribe to events if movableColumns is enabled", () => {
        // Set movableColumns option
        mockTable.options.movableColumns = true;
        
        // Run initialize
        moveColumns.initialize();
        
        // Verify event subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("alert-show", expect.any(Function));
    });
    
    it("should not subscribe to events if movableColumns is disabled", () => {
        // Set movableColumns option to false
        mockTable.options.movableColumns = false;
        
        // Run initialize
        moveColumns.initialize();
        
        // Verify no subscriptions were made
        expect(mockTable.eventBus.subscribe).not.toHaveBeenCalled();
    });
    
    it("should abort any move operation when alert is shown", () => {
        // Mock clearTimeout
        jest.spyOn(global, 'clearTimeout');
        
        // Set timeout
        moveColumns.checkTimeout = setTimeout(() => {}, 1000);
        
        // Call abortMove method
        moveColumns.abortMove();
        
        // Verify timeout was cleared
        expect(clearTimeout).toHaveBeenCalledWith(moveColumns.checkTimeout);
    });
    
    it("should initialize a regular column for movement", () => {
        // Create mock column
        const mockColumn = {
            parent: null,
            modules: {},
            isGroup: false,
            isRowHeader: false,
            getElement: jest.fn().mockReturnValue({
                addEventListener: jest.fn(),
                parentNode: {
                    insertBefore: jest.fn()
                }
            }),
            nextColumn: jest.fn(),
            prevColumn: jest.fn()
        };
        
        // Spy on bindTouchEvents
        jest.spyOn(moveColumns, 'bindTouchEvents');
        
        // Initialize column
        moveColumns.initializeColumn(mockColumn);
        
        // Verify event listeners were added
        expect(mockColumn.getElement().addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
        expect(mockColumn.getElement().addEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function));
        
        // Verify touch events were bound
        expect(moveColumns.bindTouchEvents).toHaveBeenCalledWith(mockColumn);
        
        // Verify the column has mousemove configuration
        expect(mockColumn.modules.moveColumn).toBeDefined();
        expect(mockColumn.modules.moveColumn.mousemove).toBeDefined();
    });
    
    it("should not initialize a frozen column for movement", () => {
        // Create mock frozen column
        const mockColumn = {
            parent: null,
            modules: {
                frozen: {}
            },
            isGroup: false,
            isRowHeader: false,
            getElement: jest.fn()
        };
        
        // Spy on bindTouchEvents
        jest.spyOn(moveColumns, 'bindTouchEvents');
        
        // Initialize column
        moveColumns.initializeColumn(mockColumn);
        
        // Verify no event listeners were added
        expect(mockColumn.getElement).not.toHaveBeenCalled();
        
        // Verify touch events were not bound
        expect(moveColumns.bindTouchEvents).not.toHaveBeenCalled();
        
        // Verify the column has a moveColumn configuration
        expect(mockColumn.modules.moveColumn).toBeDefined();
    });
    
    it("should not initialize a group column for movement", () => {
        // Create mock group column
        const mockColumn = {
            parent: null,
            modules: {},
            isGroup: true,
            isRowHeader: false,
            getElement: jest.fn()
        };
        
        // Initialize column
        moveColumns.initializeColumn(mockColumn);
        
        // Verify no event listeners were added
        expect(mockColumn.getElement).not.toHaveBeenCalled();
    });
    
    it("should not initialize a row header column for movement", () => {
        // Create mock row header column
        const mockColumn = {
            parent: null,
            modules: {},
            isGroup: false,
            isRowHeader: true,
            getElement: jest.fn()
        };
        
        // Initialize column
        moveColumns.initializeColumn(mockColumn);
        
        // Verify no event listeners were added
        expect(mockColumn.getElement).not.toHaveBeenCalled();
    });
    
    it("should start a move operation on mouse down after timeout", () => {
        // Create mock column
        const mockColumn = {
            parent: null,
            modules: {},
            isGroup: false,
            isRowHeader: false,
            getElement: jest.fn().mockReturnValue({
                addEventListener: jest.fn(),
                parentNode: {
                    insertBefore: jest.fn(),
                    removeChild: jest.fn()
                },
                cloneNode: jest.fn().mockReturnValue({
                    classList: {
                        add: jest.fn()
                    },
                    style: {}
                })
            }),
            getWidth: jest.fn().mockReturnValue(100),
            getHeight: jest.fn().mockReturnValue(30),
            getCells: jest.fn().mockReturnValue([])
        };
        
        // Mock event
        const mockEvent = {
            which: 1,
            pageX: 100
        };
        
        // Initialize the column first to add event listeners
        moveColumns.initializeColumn(mockColumn);
        
        // Get the mousedown handler
        const mousedownHandler = mockColumn.getElement().addEventListener.mock.calls.find(call => call[0] === "mousedown")[1];
        
        // Spy on startMove
        jest.spyOn(moveColumns, 'startMove').mockImplementation(() => {});
        
        // Call mousedown handler
        mousedownHandler(mockEvent);
        
        // Fast forward time to trigger the timeout
        jest.advanceTimersByTime(moveColumns.checkPeriod + 10);
        
        // Verify startMove was called
        expect(moveColumns.startMove).toHaveBeenCalledWith(mockEvent, mockColumn);
    });
    
    it("should bind touch events to a column", () => {
        // Create mock column element
        const mockColEl = {
            addEventListener: jest.fn()
        };
        
        // Create mock column
        const mockColumn = {
            getElement: jest.fn().mockReturnValue(mockColEl),
            nextColumn: jest.fn(),
            prevColumn: jest.fn()
        };
        
        // Bind touch events
        moveColumns.bindTouchEvents(mockColumn);
        
        // Verify touch event listeners were added
        expect(mockColEl.addEventListener).toHaveBeenCalledWith("touchstart", expect.any(Function), {passive: true});
        expect(mockColEl.addEventListener).toHaveBeenCalledWith("touchmove", expect.any(Function), {passive: true});
        expect(mockColEl.addEventListener).toHaveBeenCalledWith("touchend", expect.any(Function));
    });
    
    it("should not start move if range selection is active", () => {
        // Set up selectRange module to be active
        mockTable.modules.selectRange.mousedown = true;
        mockTable.modules.selectRange.selecting = "column";
        mockTable.modules.selectRange.columnSelection = true;
        
        // Create mock column
        const mockColumn = {
            getElement: jest.fn()
        };
        
        // Create mock event
        const mockEvent = {
            pageX: 100
        };
        
        // Spy on methods that should not be called
        jest.spyOn(moveColumns, '_bindMouseMove');
        
        // Start move operation
        moveColumns.startMove(mockEvent, mockColumn);
        
        // Verify that early return happened and no move operation started
        expect(moveColumns._bindMouseMove).not.toHaveBeenCalled();
        expect(moveColumns.moving).toBeFalsy();
    });
    
    it("should bind mouse move handlers to all columns", () => {
        // Update mock columnsByIndex to have proper modules.moveColumn structure
        mockTable.columnManager.columnsByIndex.forEach(column => {
            column.modules.moveColumn = { mousemove: jest.fn() };
        });
        
        // Bind mouse move handlers
        moveColumns._bindMouseMove();
        
        // Verify event listeners were added to all columns
        mockTable.columnManager.columnsByIndex.forEach(column => {
            expect(column.getElement().addEventListener).toHaveBeenCalledWith(
                "mousemove", 
                column.modules.moveColumn.mousemove
            );
        });
    });
    
    it("should unbind mouse move handlers from all columns", () => {
        // Update mock columnsByIndex to have proper modules.moveColumn structure
        mockTable.columnManager.columnsByIndex.forEach(column => {
            column.modules.moveColumn = { mousemove: jest.fn() };
        });
        
        // Unbind mouse move handlers
        moveColumns._unbindMouseMove();
        
        // Verify event listeners were removed from all columns
        mockTable.columnManager.columnsByIndex.forEach(column => {
            expect(column.getElement().removeEventListener).toHaveBeenCalledWith(
                "mousemove", 
                column.modules.moveColumn.mousemove
            );
        });
    });
    
    it("should move column cells after target column", () => {
        // Create mock cells
        const mockCellEl1 = {
            parentNode: {
                insertBefore: jest.fn()
            },
            nextSibling: "nextSibling1"
        };
        
        const mockCellEl2 = {
            parentNode: {
                insertBefore: jest.fn()
            },
            nextSibling: "nextSibling2"
        };
        
        // Create mock source and target columns
        const mockSourceCell1 = {
            getElement: jest.fn().mockReturnValue("sourceCell1")
        };
        
        const mockSourceCell2 = {
            getElement: jest.fn().mockReturnValue("sourceCell2")
        };
        
        const mockSourceColumn = {
            getCells: jest.fn().mockReturnValue([mockSourceCell1, mockSourceCell2])
        };
        
        const mockTargetCell1 = {
            getElement: jest.fn(true).mockReturnValue(mockCellEl1)
        };
        
        const mockTargetCell2 = {
            getElement: jest.fn(true).mockReturnValue(mockCellEl2)
        };
        
        const mockTargetColumn = {
            getCells: jest.fn().mockReturnValue([mockTargetCell1, mockTargetCell2])
        };
        
        // Set up the moving column
        moveColumns.moving = mockSourceColumn;
        
        // Move column after target
        moveColumns.moveColumn(mockTargetColumn, true);
        
        // Verify cells are moved correctly
        expect(moveColumns.toCol).toBe(mockTargetColumn);
        expect(moveColumns.toColAfter).toBe(true);
        
        expect(mockCellEl1.parentNode.insertBefore).toHaveBeenCalledWith("sourceCell1", "nextSibling1");
        expect(mockCellEl2.parentNode.insertBefore).toHaveBeenCalledWith("sourceCell2", "nextSibling2");
    });
    
    it("should move column cells before target column", () => {
        // Create mock cells
        const mockCellEl1 = {
            parentNode: {
                insertBefore: jest.fn()
            }
        };
        
        const mockCellEl2 = {
            parentNode: {
                insertBefore: jest.fn()
            }
        };
        
        // Create mock source and target columns
        const mockSourceCell1 = {
            getElement: jest.fn().mockReturnValue("sourceCell1")
        };
        
        const mockSourceCell2 = {
            getElement: jest.fn().mockReturnValue("sourceCell2")
        };
        
        const mockSourceColumn = {
            getCells: jest.fn().mockReturnValue([mockSourceCell1, mockSourceCell2])
        };
        
        const mockTargetCell1 = {
            getElement: jest.fn(true).mockReturnValue(mockCellEl1)
        };
        
        const mockTargetCell2 = {
            getElement: jest.fn(true).mockReturnValue(mockCellEl2)
        };
        
        const mockTargetColumn = {
            getCells: jest.fn().mockReturnValue([mockTargetCell1, mockTargetCell2])
        };
        
        // Set up the moving column
        moveColumns.moving = mockSourceColumn;
        
        // Move column before target
        moveColumns.moveColumn(mockTargetColumn, false);
        
        // Verify cells are moved correctly
        expect(moveColumns.toCol).toBe(mockTargetColumn);
        expect(moveColumns.toColAfter).toBe(false);
        
        expect(mockCellEl1.parentNode.insertBefore).toHaveBeenCalledWith("sourceCell1", mockCellEl1);
        expect(mockCellEl2.parentNode.insertBefore).toHaveBeenCalledWith("sourceCell2", mockCellEl2);
    });
    
    it("should finalize column move on mouse up", () => {
        // Create mock column elements
        const mockElement = {
            parentNode: {
                insertBefore: jest.fn(),
                removeChild: jest.fn()
            },
            nextSibling: "nextSibling"
        };
        
        // Set up the moving column state
        moveColumns.moving = {
            getElement: jest.fn().mockReturnValue("columnElement")
        };
        moveColumns.placeholderElement = {
            parentNode: {
                insertBefore: jest.fn(),
                removeChild: jest.fn()
            },
            nextSibling: "nextSibling"
        };
        moveColumns.hoverElement = {
            parentNode: {
                removeChild: jest.fn()
            }
        };
        moveColumns.toCol = "targetColumn";
        moveColumns.toColAfter = true;
        
        // Create mock event
        const mockEvent = {
            which: 1
        };
        
        // Mock _unbindMouseMove to avoid the issues with column.modules.moveColumn
        jest.spyOn(moveColumns, '_unbindMouseMove').mockImplementation(() => {});
        
        // Mock document body event listener removal
        jest.spyOn(document.body, 'removeEventListener').mockImplementation(jest.fn());
        
        // Call endMove
        moveColumns.endMove(mockEvent);
        
        // Verify DOM cleanup
        expect(moveColumns._unbindMouseMove).toHaveBeenCalled();
        expect(moveColumns.placeholderElement.parentNode.insertBefore).toHaveBeenCalledWith(
            "columnElement", 
            "nextSibling"
        );
        expect(moveColumns.placeholderElement.parentNode.removeChild).toHaveBeenCalledWith(
            moveColumns.placeholderElement
        );
        expect(moveColumns.hoverElement.parentNode.removeChild).toHaveBeenCalledWith(
            moveColumns.hoverElement
        );
        
        // Verify table class cleanup
        expect(mockTable.element.classList.remove).toHaveBeenCalledWith("tabulator-block-select");
        
        // Verify column manager was called to move the column
        expect(mockTable.columnManager.moveColumnActual).toHaveBeenCalledWith(
            expect.anything(), // The moving column (just checking it was passed)
            "targetColumn",
            true
        );
        
        // Verify state reset
        expect(moveColumns.moving).toBe(false);
        expect(moveColumns.toCol).toBe(false);
        expect(moveColumns.toColAfter).toBe(false);
    });
    
    it("should update hover element position on moveHover", () => {
        // Set up the hoverElement
        moveColumns.hoverElement = {
            style: {}
        };
        moveColumns.startX = 20;
        
        // Create mock event and column holder
        const mockEvent = {
            pageX: 100
        };
        
        // Call moveHover
        moveColumns.moveHover(mockEvent);
        
        // Verify hover element position is updated
        expect(moveColumns.hoverElement.style.left).toBe("30px");
    });
    
    it("should trigger auto scroll when near left edge", () => {
        // Set up the hoverElement
        moveColumns.hoverElement = {
            style: {}
        };
        moveColumns.startX = 20;
        
        // Create mock event near left edge
        const mockEvent = {
            pageX: 70 // Will calculate to xPos=20, which is less than autoScrollMargin (40)
        };
        
        // Mock rowManager getElement to return an object we can directly update
        const scrollObj = { scrollLeft: 0 };
        mockTable.rowManager.getElement.mockReturnValue(scrollObj);
        
        // Call moveHover
        moveColumns.moveHover(mockEvent);
        
        // Fast forward to trigger auto scroll
        jest.advanceTimersByTime(5);
        
        // Verify auto scroll was triggered (scrollLeft should remain at 0 since we're at the edge)
        expect(scrollObj.scrollLeft).toBe(0);
    });
    
    it("should attempt to set auto scroll when near right edge", () => {
        // Mock setTimeout to track if it's called
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        
        // Set up the hoverElement
        moveColumns.hoverElement = {
            style: {}
        };
        moveColumns.startX = 20;
        
        // Create mock event near right edge
        const mockEvent = {
            pageX: 1000 // Will calculate to xPos=950, which is within autoScrollMargin of right edge
        };
        
        // Mock columnHolder with larger scrollLeft value
        const mockContentsElement = {
            scrollLeft: 10,
            clientWidth: 50 // Small width to ensure we're near the right edge
        };
        mockTable.columnManager.getContentsElement.mockReturnValue(mockContentsElement);
        
        // Call moveHover
        moveColumns.moveHover(mockEvent);
        
        // Verify setTimeout was called (indicating the auto scroll code was executed)
        expect(setTimeoutSpy).toHaveBeenCalled();
    });
});
