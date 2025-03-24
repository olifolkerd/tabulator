import Layout from "../../../src/js/modules/Layout/Layout";
import defaultModes from "../../../src/js/modules/Layout/defaults/modes";

describe("Layout module", () => {
    /** @type {Layout} */
    let layout;
    let mockTable;
    let mockColumnManager;
    
    beforeEach(() => {
        // Mock renderer for columnManager
        const mockRenderer = {
            reinitializeColumnWidths: jest.fn()
        };
        
        // Create mock columnManager
        mockColumnManager = {
            renderer: mockRenderer,
            columnsByIndex: []
        };
        
        // Create mock element
        const mockElement = {
            setAttribute: jest.fn()
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            dispatch: jest.fn()
        };
        
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            modExists: jest.fn(() => false),
            modules: {},
            element: mockElement,
            columnManager: mockColumnManager,
            options: {
                layout: "fitData"
            },
            rowManager: {
                element: {
                    getBoundingClientRect: jest.fn(() => ({ width: 800 })),
                    scrollHeight: 500,
                    clientHeight: 400,
                    offsetWidth: 820,
                    clientWidth: 800
                },
                normalizeHeight: jest.fn()
            },
            eventBus: mockEventBus,
            optionsList: mockOptionsList
        };
        
        // Mock methods in the Layout prototype
        jest.spyOn(Layout.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(Layout.prototype, 'registerColumnOption').mockImplementation(function(key) {
            this.table.optionsList.register(key);
        });
        
        jest.spyOn(Layout.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(Layout.prototype, 'dispatch').mockImplementation(function(event, ...args) {
            return this.table.eventBus.dispatch(event, ...args);
        });
        
        // Create an instance of the Layout module with the mock table
        layout = new Layout(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should register layout options during construction", () => {
        // Verify table options are registered
        expect(mockTable.options.layout).toBe("fitData");
        expect(mockTable.options.layoutColumnsOnNewData).toBe(false);
        
        // Verify column options are registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("widthGrow");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("widthShrink");
    });
    
    it("should initialize with valid mode from options", () => {
        // Simulate having modes loaded
        Layout.modes = defaultModes;
        
        // Run initialize
        layout.initialize();
        
        // Verify mode is set correctly
        expect(layout.mode).toBe("fitData");
        expect(mockTable.element.setAttribute).toHaveBeenCalledWith("tabulator-layout", "fitData");
        expect(layout.table.eventBus.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
    });
    
    it("should warn and default to fitData when an invalid mode is provided", () => {
        // Mock console.warn
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Simulate having modes loaded
        Layout.modes = defaultModes;
        
        // Set invalid layout mode
        mockTable.options.layout = "invalidMode";
        
        // Run initialize
        layout.initialize();
        
        // Verify default mode is set and warning is issued
        expect(layout.mode).toBe("fitData");
        expect(consoleWarnSpy).toHaveBeenCalledWith("Layout Error - invalid mode set, defaulting to 'fitData' : invalidMode");
        expect(mockTable.element.setAttribute).toHaveBeenCalledWith("tabulator-layout", "fitData");
    });
    
    it("should properly initialize a column with number values", () => {
        // Create mock column
        const mockColumn = {
            definition: {
                widthGrow: "2",
                widthShrink: "1.5"
            }
        };
        
        // Initialize column
        layout.initializeColumn(mockColumn);
        
        // Verify values are converted to numbers
        expect(mockColumn.definition.widthGrow).toBe(2);
        expect(mockColumn.definition.widthShrink).toBe(1.5);
    });
    
    it("should return the current layout mode", () => {
        // Set a mode
        layout.mode = "fitColumns";
        
        // Get the mode
        const result = layout.getMode();
        
        // Verify result
        expect(result).toBe("fitColumns");
    });
    
    it("should trigger layout refresh with the selected mode", () => {
        // Prepare a column with variable height
        const mockColumn = { definition: { variableHeight: true } };
        mockColumnManager.columnsByIndex = [mockColumn];
        
        // Set up the layout mode
        layout.mode = "fitData";
        
        // Mock the mode function
        Layout.modes = {
            fitData: jest.fn()
        };
        
        // Call layout method
        layout.layout(true);
        
        // Verify dispatch events
        expect(mockTable.eventBus.dispatch).toHaveBeenCalledWith("layout-refreshing");
        expect(mockTable.eventBus.dispatch).toHaveBeenCalledWith("layout-refreshed");
        
        // Verify the layout mode function was called
        expect(Layout.modes.fitData).toHaveBeenCalledWith(mockColumnManager.columnsByIndex, true);
        
        // Verify row height normalization was called (due to variable height column)
        expect(mockTable.rowManager.normalizeHeight).toHaveBeenCalledWith(true);
    });
    
    it("should not normalize row heights if no variable height columns exist", () => {
        // Prepare columns without variable height
        const mockColumn = { definition: { variableHeight: false, formatter: "text" } };
        mockColumnManager.columnsByIndex = [mockColumn];
        
        // Set up the layout mode
        layout.mode = "fitData";
        
        // Mock the mode function
        Layout.modes = {
            fitData: jest.fn()
        };
        
        // Call layout method
        layout.layout(false);
        
        // Verify dispatch events
        expect(mockTable.eventBus.dispatch).toHaveBeenCalledWith("layout-refreshing");
        expect(mockTable.eventBus.dispatch).toHaveBeenCalledWith("layout-refreshed");
        
        // Verify the layout mode function was called
        expect(Layout.modes.fitData).toHaveBeenCalledWith(mockColumnManager.columnsByIndex, false);
        
        // Verify row height normalization was not called (no variable height columns)
        expect(mockTable.rowManager.normalizeHeight).not.toHaveBeenCalled();
    });
    
    it("should recognize textarea formatter as variable height column", () => {
        // Prepare a column with textarea formatter
        const mockColumn = { definition: { formatter: "textarea" } };
        mockColumnManager.columnsByIndex = [mockColumn];
        
        // Set up the layout mode
        layout.mode = "fitData";
        
        // Mock the mode function
        Layout.modes = {
            fitData: jest.fn()
        };
        
        // Call layout method
        layout.layout(false);
        
        // Verify row height normalization was called (due to textarea formatter)
        expect(mockTable.rowManager.normalizeHeight).toHaveBeenCalledWith(true);
    });
});
