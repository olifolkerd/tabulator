import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Popup from "../../../src/js/modules/Popup/Popup";

describe("Popup module", () => {
    /** @type {Popup} */
    let popup;
    let mockTable;
    
    beforeEach(() => {
        // Create mock element
        document.createElement = jest.fn().mockImplementation((tagName) => {
            const element = {
                tagName: tagName.toUpperCase(),
                classList: {
                    add: jest.fn()
                },
                addEventListener: jest.fn(),
                insertBefore: jest.fn(),
                innerHTML: "",
                appendChild: jest.fn(),
                firstChild: {}
            };
            return element;
        });
        
        // Create mock column
        const mockColumn = {
            definition: {},
            titleElement: {
                insertBefore: jest.fn()
            }
        };
        
        // Create mock popup function from core
        const mockPopupFunc = jest.fn().mockReturnValue({
            renderCallback: jest.fn(),
            show: jest.fn(),
            hideOnBlur: jest.fn()
        });
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn()
        };
        
        // Create mock externalEventBus
        const mockExternalEventBus = {
            dispatch: jest.fn()
        };
        
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn()
        };
        
        // Create mock componentFunctionBinder
        const mockComponentFunctionBinder = {
            bind: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            columnManager: {
                columns: [mockColumn]
            },
            options: {
                rowContextPopup: false,
                rowClickPopup: false,
                rowDblClickPopup: false,
                groupContextPopup: false,
                groupClickPopup: false,
                groupDblClickPopup: false
            },
            eventBus: mockEventBus,
            externalEvents: mockExternalEventBus,
            optionsList: mockOptionsList,
            componentFunctionBinder: mockComponentFunctionBinder,
            popup: mockPopupFunc,
            on: jest.fn()
        };
        
        // Mock methods in the Popup prototype
        jest.spyOn(Popup.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(Popup.prototype, 'registerColumnOption').mockImplementation(function(key) {
            this.table.optionsList.register(key);
        });
        
        jest.spyOn(Popup.prototype, 'registerComponentFunction').mockImplementation(function(component, name, callback) {
            this.table.componentFunctionBinder.bind(component, name, callback);
        });
        
        jest.spyOn(Popup.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(Popup.prototype, 'dispatchExternal').mockImplementation(function(event, component) {
            this.table.externalEvents.dispatch(event, component);
        });
        
        // Create an instance of the Popup module with the mock table
        popup = new Popup(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should register all table options during construction", () => {
        // Verify table options are registered
        expect(mockTable.options.rowContextPopup).toBe(false);
        expect(mockTable.options.rowClickPopup).toBe(false);
        expect(mockTable.options.rowDblClickPopup).toBe(false);
        expect(mockTable.options.groupContextPopup).toBe(false);
        expect(mockTable.options.groupClickPopup).toBe(false);
        expect(mockTable.options.groupDblClickPopup).toBe(false);
    });
    
    it("should register all column options during construction", () => {
        // Verify column options are registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("headerContextPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("headerClickPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("headerDblClickPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("headerPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("headerPopupIcon");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("contextPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("clickPopup");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("dblClickPopup");
    });
    
    it("should register component functions during construction", () => {
        // Verify component functions are registered
        expect(mockTable.componentFunctionBinder.bind).toHaveBeenCalledWith("cell", "popup", expect.any(Function));
        expect(mockTable.componentFunctionBinder.bind).toHaveBeenCalledWith("column", "popup", expect.any(Function));
        expect(mockTable.componentFunctionBinder.bind).toHaveBeenCalledWith("row", "popup", expect.any(Function));
        expect(mockTable.componentFunctionBinder.bind).toHaveBeenCalledWith("group", "popup", expect.any(Function));
    });
    
    it("should initialize and subscribe to events", () => {
        // Run initialize
        popup.initialize();
        
        // Verify subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
    });
    
    it("should set up row watchers when row popup options are enabled", () => {
        // Spy on subscribe and loadPopupEvent methods
        jest.spyOn(popup, 'loadPopupEvent');
        
        // Set row popup options
        mockTable.options.rowContextPopup = () => {};
        mockTable.options.rowClickPopup = () => {};
        mockTable.options.rowDblClickPopup = () => {};
        
        // Initialize row watchers
        popup.initializeRowWatchers();
        
        // Verify subscriptions for row events
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-contextmenu", expect.any(Function));
        expect(mockTable.on).toHaveBeenCalledWith("rowTapHold", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-click", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-dblclick", expect.any(Function));
    });
    
    it("should set up group watchers when group popup options are enabled", () => {
        // Spy on subscribe and loadPopupEvent methods
        jest.spyOn(popup, 'loadPopupEvent');
        
        // Set group popup options
        mockTable.options.groupContextPopup = () => {};
        mockTable.options.groupClickPopup = () => {};
        mockTable.options.groupDblClickPopup = () => {};
        
        // Initialize group watchers
        popup.initializeGroupWatchers();
        
        // Verify subscriptions for group events
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("group-contextmenu", expect.any(Function));
        expect(mockTable.on).toHaveBeenCalledWith("groupTapHold", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("group-click", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("group-dblclick", expect.any(Function));
    });
    
    it("should initialize column header popup features", () => {
        // Set up mock column with headerPopup
        const mockColumn = {
            definition: {
                headerPopup: () => {},
                headerPopupIcon: "<i>Icon</i>"
            },
            titleElement: {
                insertBefore: jest.fn(),
                firstChild: {}
            },
            getComponent: jest.fn().mockReturnValue({ column: true })
        };
        
        // Create a mock for document.createElement with span
        let headerPopupEl;
        const origCreateElement = document.createElement;
        document.createElement = jest.fn().mockImplementation((tagName) => {
            if (tagName === "span") {
                headerPopupEl = {
                    tagName: "SPAN",
                    classList: {
                        add: jest.fn()
                    },
                    addEventListener: jest.fn(),
                    insertBefore: jest.fn(),
                    appendChild: jest.fn(),
                    innerHTML: ""
                };
                return headerPopupEl;
            }
            return origCreateElement(tagName);
        });
        
        // Initialize column header popup
        popup.initializeColumnHeaderPopup(mockColumn);
        
        // Verify the popup button was created
        expect(headerPopupEl.classList.add).toHaveBeenCalledWith("tabulator-header-popup-button");
        expect(headerPopupEl.innerHTML).toBe("<i>Icon</i>");
        expect(headerPopupEl.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
        expect(mockColumn.titleElement.insertBefore).toHaveBeenCalledWith(headerPopupEl, mockColumn.titleElement.firstChild);
    });
    
    it("should use default popup icon if none provided", () => {
        // Set up mock column with headerPopup but no icon
        const mockColumn = {
            definition: {
                headerPopup: () => {}
            },
            titleElement: {
                insertBefore: jest.fn(),
                firstChild: {}
            }
        };
        
        // Create a mock for document.createElement with span
        let headerPopupEl;
        const origCreateElement = document.createElement;
        document.createElement = jest.fn().mockImplementation((tagName) => {
            if (tagName === "span") {
                headerPopupEl = {
                    tagName: "SPAN",
                    classList: {
                        add: jest.fn()
                    },
                    addEventListener: jest.fn(),
                    insertBefore: jest.fn(),
                    appendChild: jest.fn(),
                    innerHTML: ""
                };
                return headerPopupEl;
            }
            return origCreateElement(tagName);
        });
        
        // Initialize column header popup
        popup.initializeColumnHeaderPopup(mockColumn);
        
        // Verify default icon was used
        expect(headerPopupEl.innerHTML).toBe("&vellip;");
    });
    
    it.skip("should handle function that returns HTML element as icon", () => {
        // Create icon element
        const iconElement = document.createElement("i");
        
        // Set up mock column with headerPopup and function icon
        const mockColumn = {
            definition: {
                headerPopup: () => {},
                headerPopupIcon: jest.fn().mockReturnValue(iconElement)
            },
            titleElement: {
                insertBefore: jest.fn(),
                firstChild: {}
            },
            getComponent: jest.fn().mockReturnValue({ column: true })
        };
        
        // Create a mock for document.createElement with span
        let headerPopupEl;
        const origCreateElement = document.createElement;
        document.createElement = jest.fn().mockImplementation((tagName) => {
            if (tagName === "span") {
                headerPopupEl = {
                    tagName: "SPAN",
                    classList: {
                        add: jest.fn()
                    },
                    addEventListener: jest.fn(),
                    insertBefore: jest.fn(),
                    appendChild: jest.fn(),
                    innerHTML: ""
                };
                return headerPopupEl;
            }
            return origCreateElement(tagName);
        });
        
        // Initialize column header popup
        popup.initializeColumnHeaderPopup(mockColumn);
        
        // Verify icon function was called and element was appended
        expect(mockColumn.definition.headerPopupIcon).toHaveBeenCalledWith({ column: true });
        expect(headerPopupEl.appendChild).toHaveBeenCalledWith(iconElement);
    });
    
    it("should initialize column with event handlers", () => {
        // Set up mock column with popup options
        const mockColumn = {
            definition: {
                headerContextPopup: () => {},
                headerClickPopup: () => {},
                headerDblClickPopup: () => {},
                headerPopup: () => {},
                contextPopup: () => {},
                clickPopup: () => {},
                dblClickPopup: () => {}
            }
        };
        
        // Spy on initializeColumnHeaderPopup
        jest.spyOn(popup, 'initializeColumnHeaderPopup').mockImplementation(() => {});
        
        // Initialize column
        popup.initializeColumn(mockColumn);
        
        // Verify event subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-contextmenu", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-click", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-dblclick", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-contextmenu", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-click", expect.any(Function));
        expect(mockTable.on).toHaveBeenCalledWith("headerTapHold", expect.any(Function));
        expect(mockTable.on).toHaveBeenCalledWith("cellTapHold", expect.any(Function));
        
        // Verify header popup was initialized
        expect(popup.initializeColumnHeaderPopup).toHaveBeenCalledWith(mockColumn);
    });
    
    it("should load popup event for table cell", () => {
        // Spy on loadPopupEvent
        jest.spyOn(popup, 'loadPopupEvent').mockImplementation(() => {});
        
        // Create mock cell with column definition
        const mockCell = {
            _cell: {
                column: {
                    definition: {
                        contextPopup: () => {}
                    }
                }
            }
        };
        
        // Mock event
        const mockEvent = { type: "contextmenu" };
        
        // Load popup for cell
        popup.loadPopupTableCellEvent("contextPopup", mockEvent, mockCell);
        
        // Verify loadPopupEvent was called
        expect(popup.loadPopupEvent).toHaveBeenCalledWith(
            mockCell._cell.column.definition.contextPopup,
            mockEvent,
            mockCell._cell
        );
    });
    
    it("should load popup event for table column", () => {
        // Spy on loadPopupEvent
        jest.spyOn(popup, 'loadPopupEvent').mockImplementation(() => {});
        
        // Create mock column with definition
        const mockColumn = {
            _column: {
                definition: {
                    headerContextPopup: () => {}
                }
            }
        };
        
        // Mock event
        const mockEvent = { type: "contextmenu" };
        
        // Load popup for column
        popup.loadPopupTableColumnEvent("headerContextPopup", mockEvent, mockColumn);
        
        // Verify loadPopupEvent was called
        expect(popup.loadPopupEvent).toHaveBeenCalledWith(
            mockColumn._column.definition.headerContextPopup,
            mockEvent,
            mockColumn._column
        );
    });
    
    it("should load popup with function content", () => {
        // Spy on loadPopup
        jest.spyOn(popup, 'loadPopup').mockImplementation(() => {});
        
        // Create mock component
        const mockComponent = {
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Create mock content function
        const mockContentFunc = jest.fn().mockReturnValue("Popup Content");
        
        // Mock event
        const mockEvent = { type: "click" };
        
        // Load popup event
        popup.loadPopupEvent(mockContentFunc, mockEvent, mockComponent);
        
        // Verify content function was called and loadPopup was called
        expect(mockContentFunc).toHaveBeenCalledWith(mockEvent, { component: true }, expect.any(Function));
        expect(popup.loadPopup).toHaveBeenCalledWith(
            mockEvent,
            mockComponent,
            "Popup Content",
            undefined,
            undefined
        );
    });
    
    it("should load popup with string content", () => {
        // Spy on loadPopup
        jest.spyOn(popup, 'loadPopup').mockImplementation(() => {});
        
        // Create mock component
        const mockComponent = {
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Create mock content string
        const mockContent = "Static Popup Content";
        
        // Mock event
        const mockEvent = { type: "click" };
        
        // Load popup event
        popup.loadPopupEvent(mockContent, mockEvent, mockComponent);
        
        // Verify loadPopup was called with string content
        expect(popup.loadPopup).toHaveBeenCalledWith(
            mockEvent,
            mockComponent,
            mockContent,
            undefined,
            undefined
        );
    });
    
    it("should unwrap _group and _row components", () => {
        // Spy on loadPopup
        jest.spyOn(popup, 'loadPopup').mockImplementation(() => {});
        
        // Create mock group component
        const mockGroup = {
            _group: {
                getComponent: jest.fn().mockReturnValue({ group: true })
            }
        };
        
        // Create mock row component
        const mockRow = {
            _row: {
                getComponent: jest.fn().mockReturnValue({ row: true })
            }
        };
        
        // Create mock content
        const mockContent = "Popup Content";
        
        // Mock event
        const mockEvent = { type: "click" };
        
        // Load popup event for group
        popup.loadPopupEvent(mockContent, mockEvent, mockGroup);
        
        // Verify loadPopup was called with unwrapped group
        expect(popup.loadPopup).toHaveBeenCalledWith(
            mockEvent,
            mockGroup._group,
            mockContent,
            undefined,
            undefined
        );
        
        // Load popup event for row
        popup.loadPopupEvent(mockContent, mockEvent, mockRow);
        
        // Verify loadPopup was called with unwrapped row
        expect(popup.loadPopup).toHaveBeenCalledWith(
            mockEvent,
            mockRow._row,
            mockContent,
            undefined,
            undefined
        );
    });
    
    it.skip("should create popup with HTML content", () => {
        // Create mock HTML element
        const mockHtmlElement = document.createElement("div");
        
        // Create mock component
        const mockComponent = {
            getElement: jest.fn().mockReturnValue({})
        };
        
        // Mock event
        const mockEvent = { 
            type: "click",
            preventDefault: jest.fn(),
            pageX: 100,
            pageY: 100
        };
        
        // Spy on dispatchExternal
        jest.spyOn(popup, 'dispatchExternal');
        
        // Load popup with HTML element
        popup.loadPopup(mockEvent, mockComponent, mockHtmlElement);
        
        // Verify popup was created correctly
        expect(mockHtmlElement.classList.add).toHaveBeenCalledWith("tabulator-popup");
        expect(mockHtmlElement.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockTable.popup).toHaveBeenCalledWith(mockHtmlElement);
        expect(mockTable.popup().show).toHaveBeenCalledWith(mockEvent);
        expect(mockTable.popup().hideOnBlur).toHaveBeenCalledWith(expect.any(Function));
        expect(popup.dispatchExternal).toHaveBeenCalledWith("popupOpened", undefined);
    });
    
    it.skip("should create popup with string content", () => {
        // Create mock div element for the content
        const mockDivElement = document.createElement("div");
        
        // Create mock component
        const mockComponent = {
            getElement: jest.fn().mockReturnValue({}),
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Mock event with position data instead of null
        const mockEvent = {
            pageX: 200,
            pageY: 200
        };
        
        // Load popup with string content
        popup.loadPopup(mockEvent, mockComponent, "String Content");
        
        // Verify div was created with content
        expect(mockDivElement.innerHTML).toBe("String Content");
        expect(mockDivElement.classList.add).toHaveBeenCalledWith("tabulator-popup");
        expect(mockTable.popup).toHaveBeenCalledWith(mockDivElement);
        expect(mockTable.popup().show).toHaveBeenCalledWith({}, "center");
        expect(popup.dispatchExternal).toHaveBeenCalledWith("popupOpened", { component: true });
    });
    
    it.skip("should handle custom position when no event is provided", () => {
        // Create mock component
        const mockComponent = {
            getElement: jest.fn().mockReturnValue({}),
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Load popup with custom position and proper event data
        popup.loadPopup({pageX: 300, pageY: 300}, mockComponent, "Content", null, "bottom");
        
        // Verify popup was shown with custom position
        expect(mockTable.popup().show).toHaveBeenCalledWith({}, "bottom");
    });
    
    it.skip("should call rendered callback if provided", () => {
        // Create mock component
        const mockComponent = {
            getElement: jest.fn().mockReturnValue({}),
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Create mock rendered callback
        const mockRenderedCallback = jest.fn();
        
        // Load popup with rendered callback and proper event data
        popup.loadPopup({pageX: 400, pageY: 400}, mockComponent, "Content", mockRenderedCallback);
        
        // Verify rendered callback was set
        expect(mockTable.popup().renderCallback).toHaveBeenCalledWith(mockRenderedCallback);
    });
    
    it.skip("should dispatch popupClosed event when popup closes", () => {
        // Create mock component
        const mockComponent = {
            getElement: jest.fn().mockReturnValue({}),
            getComponent: jest.fn().mockReturnValue({ component: true })
        };
        
        // Spy on dispatchExternal
        jest.spyOn(popup, 'dispatchExternal');
        
        // Load popup with proper event data
        popup.loadPopup({pageX: 500, pageY: 500}, mockComponent, "Content");
        
        // Get the hideOnBlur callback
        const hideOnBlurCallback = mockTable.popup().hideOnBlur.mock.calls[0][0];
        
        // Call the callback
        hideOnBlurCallback();
        
        // Verify popupClosed event was dispatched
        expect(popup.dispatchExternal).toHaveBeenCalledWith("popupClosed", { component: true });
    });
});