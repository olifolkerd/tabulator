import Print from "../../../src/js/modules/Print/Print";

describe("Print module", () => {
    /** @type {Print} */
    let print;
    let mockTable;
    let addEventListenerSpy;
    let removeEventListenerSpy;
    let originalWindowPrint;
    let originalScrollTo;
    
    beforeEach(() => {
        // Save original window methods
        originalWindowPrint = window.print;
        originalScrollTo = window.scrollTo;
        
        // Mock window methods
        window.print = jest.fn();
        window.scrollTo = jest.fn();
        window.scrollX = 100;
        window.scrollY = 100;
        
        // Spy on window event listeners
        addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        
        // Mock document methods and elements
        document.createElement = jest.fn().mockImplementation((tagName) => {
            const element = {
                tagName: tagName.toUpperCase(),
                classList: {
                    add: jest.fn()
                },
                style: {},
                appendChild: jest.fn(),
                parentNode: {
                    insertBefore: jest.fn(),
                    removeChild: jest.fn()
                },
                innerHTML: ""
            };
            return element;
        });
        
        // Instead of replacing document.body, just spy on its methods
        if (document.body) {
            jest.spyOn(document.body.classList, 'add').mockImplementation(() => {});
            jest.spyOn(document.body.classList, 'remove').mockImplementation(() => {});
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        }
        
        // Create mock element
        const mockElement = {
            style: {},
            parentNode: {
                insertBefore: jest.fn()
            }
        };
        
        // Create mock export module
        const mockExportModule = {
            generateTable: jest.fn().mockReturnValue({
                table: true
            })
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn()
        };
        
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn()
        };
        
        // Create mock functionRegistry
        const mockFunctionRegistry = {};
        
        // Create a simplified mock of the table
        mockTable = {
            element: mockElement,
            modules: {
                export: mockExportModule
            },
            options: {
                printAsHtml: false,
                printFormatter: false,
                printHeader: false,
                printFooter: false,
                printStyled: true,
                printRowRange: "visible",
                printConfig: {}
            },
            eventBus: mockEventBus,
            optionsList: mockOptionsList,
            functionRegistry: mockFunctionRegistry
        };
        
        // Mock methods in the Print prototype
        jest.spyOn(Print.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(Print.prototype, 'registerColumnOption').mockImplementation(function(key) {
            this.table.optionsList.register(key);
        });
        
        jest.spyOn(Print.prototype, 'registerTableFunction').mockImplementation(function(key, callback) {
            this.table.functionRegistry[key] = callback;
        });
        
        jest.spyOn(Print.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        // Create an instance of the Print module with the mock table
        print = new Print(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        // Restore original window methods
        window.print = originalWindowPrint;
        window.scrollTo = originalScrollTo;
    });
    
    it("should register all table options during construction", () => {
        // Verify table options are registered
        expect(mockTable.options.printAsHtml).toBe(false);
        expect(mockTable.options.printFormatter).toBe(false);
        expect(mockTable.options.printHeader).toBe(false);
        expect(mockTable.options.printFooter).toBe(false);
        expect(mockTable.options.printStyled).toBe(true);
        expect(mockTable.options.printRowRange).toBe("visible");
        expect(mockTable.options.printConfig).toEqual({});
    });
    
    it("should register column options during construction", () => {
        // Verify column options are registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("print");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("titlePrint");
    });
    
    it("should register table print function during initialization", () => {
        // Initialize print module
        print.initialize();
        
        // Verify print function is registered
        expect(mockTable.functionRegistry.print).toBeDefined();
    });
    
    it("should not set up event listeners when printAsHtml is false", () => {
        // Initialize print module with printAsHtml = false
        mockTable.options.printAsHtml = false;
        print.initialize();
        
        // Verify event listeners are not added
        expect(addEventListenerSpy).not.toHaveBeenCalledWith("beforeprint", expect.any(Function));
        expect(addEventListenerSpy).not.toHaveBeenCalledWith("afterprint", expect.any(Function));
    });
    
    it("should set up event listeners when printAsHtml is true", () => {
        // Initialize print module with printAsHtml = true
        mockTable.options.printAsHtml = true;
        print.initialize();
        
        // Verify event listeners are added
        expect(addEventListenerSpy).toHaveBeenCalledWith("beforeprint", expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith("afterprint", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("table-destroy", expect.any(Function));
    });
    
    it("should clean up event listeners on destroy", () => {
        // Initialize print module with printAsHtml = true
        mockTable.options.printAsHtml = true;
        print.initialize();
        
        // Destroy print module
        print.destroy();
        
        // Verify event listeners are removed
        expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeprint", expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith("afterprint", expect.any(Function));
    });
    
    it("should replace table with print version on beforeprint event", () => {
        // Initialize print module with printAsHtml = true
        mockTable.options.printAsHtml = true;
        print.initialize();
        
        // Call replaceTable (this would be triggered by beforeprint event)
        print.replaceTable();
        
        // Verify table is replaced
        expect(document.createElement).toHaveBeenCalledWith("div");
        expect(print.element.classList.add).toHaveBeenCalledWith("tabulator-print-table");
        expect(mockTable.modules.export.generateTable).toHaveBeenCalledWith(
            mockTable.options.printConfig,
            mockTable.options.printStyled,
            mockTable.options.printRowRange,
            "print"
        );
        expect(mockTable.element.style.display).toBe("none");
        expect(mockTable.element.parentNode.insertBefore).toHaveBeenCalledWith(print.element, mockTable.element);
    });
    
    it("should clean up after printing", () => {
        // Set up element and call cleanup
        print.element = document.createElement("div");
        mockTable.element.style.display = "none";
        
        // Call cleanup (this would be triggered by afterprint event)
        print.cleanup();
        
        // Verify cleanup
        expect(document.body.classList.remove).toHaveBeenCalledWith("tabulator-print-fullscreen-hide");
        expect(print.element.parentNode.removeChild).toHaveBeenCalledWith(print.element);
        expect(mockTable.element.style.display).toBe("");
    });
    
    it("should print table in fullscreen mode", () => {
        // Initialize print module
        print.initialize();
        
        // Call printFullscreen
        print.printFullscreen();
        
        // Verify fullscreen print setup
        expect(document.createElement).toHaveBeenCalledWith("div");
        expect(print.element.classList.add).toHaveBeenCalledWith("tabulator-print-fullscreen");
        expect(mockTable.modules.export.generateTable).toHaveBeenCalledWith(
            mockTable.options.printConfig,
            mockTable.options.printStyled,
            mockTable.options.printRowRange,
            "print"
        );
        expect(document.body.classList.add).toHaveBeenCalledWith("tabulator-print-fullscreen-hide");
        expect(document.body.appendChild).toHaveBeenCalledWith(print.element);
        expect(window.print).toHaveBeenCalled();
        expect(window.scrollTo).toHaveBeenCalledWith(100, 100);
    });
    
    it("should print table with custom visible, style, and config parameters", () => {
        // Initialize print module
        print.initialize();
        
        // Call printFullscreen with custom parameters
        print.printFullscreen(true, false, { custom: "config" });
        
        // Verify parameters are passed to generateTable
        expect(mockTable.modules.export.generateTable).toHaveBeenCalledWith(
            { custom: "config" },
            false,
            true,
            "print"
        );
    });
    
    it("should add header to print output if printHeader is provided as string", () => {
        // Set header option as string
        mockTable.options.printHeader = "Test Header";
        
        // Initialize and print
        print.initialize();
        print.printFullscreen();
        
        // Verify header is created and added
        expect(document.createElement).toHaveBeenCalledWith("div");
        expect(print.element.appendChild).toHaveBeenCalledTimes(2); // header and table
        
        // Get the header element (first created div)
        const headerEl = document.createElement.mock.results[0].value;
        
        // Verify header setup
        expect(headerEl.classList.add).toHaveBeenCalledWith("tabulator-print-header");
        expect(headerEl.innerHTML).toBe("Test Header");
    });
    
    it("should add header to print output if printHeader is provided as function", () => {
        // Create header element
        const headerContent = document.createElement("h1");
        
        // Spy on document.createElement to capture calls
        const createElementSpy = jest.spyOn(document, 'createElement');
        
        // Set header option as function
        mockTable.options.printHeader = jest.fn().mockReturnValue(headerContent);
        
        // Initialize and print
        print.initialize();
        print.printFullscreen();
        
        // Verify header function is called
        expect(mockTable.options.printHeader).toHaveBeenCalled();
        
        // Find the header element by looking at all created elements and finding the one
        // that had the tabulator-print-header class added to it
        let headerEl = null;
        createElementSpy.mock.results.forEach(result => {
            const el = result.value;
            if (el.classList.add.mock.calls.some(call => call[0] === "tabulator-print-header")) {
                headerEl = el;
            }
        });
        
        // Verify header setup
        expect(headerEl).not.toBeNull();
        expect(headerEl.classList.add).toHaveBeenCalledWith("tabulator-print-header");
        expect(headerEl.appendChild).toHaveBeenCalledWith(headerContent);
    });
    
    it("should add footer to print output if printFooter is provided as string", () => {
        // Set footer option as string
        mockTable.options.printFooter = "Test Footer";
        
        // Initialize and print
        print.initialize();
        print.printFullscreen();
        
        // Verify footer is created and added
        expect(document.createElement).toHaveBeenCalledWith("div");
        expect(print.element.appendChild).toHaveBeenCalledTimes(2); // table and footer
        
        // Get the footer element (second created div)
        const footerEl = document.createElement.mock.results[1].value;
        
        // Verify footer setup
        expect(footerEl.classList.add).toHaveBeenCalledWith("tabulator-print-footer");
        expect(footerEl.innerHTML).toBe("Test Footer");
    });
    
    it("should add footer to print output if printFooter is provided as function", () => {
        // Create footer element
        const footerContent = document.createElement("div");
        
        // Spy on document.createElement to capture calls
        const createElementSpy = jest.spyOn(document, 'createElement');
        
        // Set footer option as function
        mockTable.options.printFooter = jest.fn().mockReturnValue(footerContent);
        
        // Initialize and print
        print.initialize();
        print.printFullscreen();
        
        // Verify footer function is called
        expect(mockTable.options.printFooter).toHaveBeenCalled();
        
        // Find the footer element by looking at all created elements and finding the one
        // that had the tabulator-print-footer class added to it
        let footerEl = null;
        createElementSpy.mock.results.forEach(result => {
            const el = result.value;
            if (el.classList.add.mock.calls.some(call => call[0] === "tabulator-print-footer")) {
                footerEl = el;
            }
        });
        
        // Verify footer setup
        expect(footerEl).not.toBeNull();
        expect(footerEl.classList.add).toHaveBeenCalledWith("tabulator-print-footer");
        expect(footerEl.appendChild).toHaveBeenCalledWith(footerContent);
    });
    
    it("should call printFormatter if provided", () => {
        // Set formatter function
        mockTable.options.printFormatter = jest.fn();
        
        // Initialize and print
        print.initialize();
        print.printFullscreen();
        
        // Verify formatter is called
        expect(mockTable.options.printFormatter).toHaveBeenCalledWith(
            print.element,
            { table: true } // mock table element returned by generateTable
        );
    });
    
    it("should not replace table during window.print if manual block is active", () => {
        // Initialize print module with printAsHtml = true
        mockTable.options.printAsHtml = true;
        print.initialize();
        
        // Set manual block and call replaceTable
        print.manualBlock = true;
        print.replaceTable();
        
        // Verify table is not replaced
        expect(document.createElement).not.toHaveBeenCalled();
        expect(mockTable.modules.export.generateTable).not.toHaveBeenCalled();
    });
});
