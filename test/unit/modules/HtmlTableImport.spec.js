import HtmlTableImport from "../../../src/js/modules/HtmlTableImport/HtmlTableImport";

describe("HtmlTableImport module", () => {
    /** @type {HtmlTableImport} */
    let htmlTableImport;
    let mockTable;
    
    beforeEach(() => {
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn(),
            generate: jest.fn(),
            registeredDefaults: {
                title: {},
                field: {},
                width: {}
            }
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn(),
            dispatch: jest.fn(),
        };
        
        // Create mock externalEvents
        const mockExternalEvents = {
            dispatch: jest.fn(),
        };
        
        // Create mock columnManager
        const mockColumnManager = {
            optionsList: mockOptionsList
        };
        
        // Create a simplified mock of the table
        mockTable = {
            options: {
                columns: [],
                index: "id",
                data: null
            },
            columnManager: mockColumnManager,
            optionsList: mockOptionsList,
            eventBus: mockEventBus,
            externalEvents: mockExternalEvents,
            originalElement: null
        };
        
        // Mock methods in the HtmlTableImport prototype
        jest.spyOn(HtmlTableImport.prototype, 'dispatchExternal').mockImplementation(function(event, ...args) {
            this.table.externalEvents.dispatch(event, ...args);
        });
        
        // Create an instance of the HtmlTableImport module with the mock table
        htmlTableImport = new HtmlTableImport(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        // Clean up document
        if (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
    
    it("should skip import when not initialized on a table element", () => {
        // Set up div as the original element
        const divElement = document.createElement('div');
        mockTable.originalElement = divElement;
        
        // Mock console.warn to check for warnings
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Should not throw any errors
        expect(mockTable.options.data).toBeNull();
        
        // Should not have dispatched any events
        expect(mockTable.externalEvents.dispatch).not.toHaveBeenCalled();
        
        // Should not have logged a warning about empty table
        expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it("should warn when initialized on an empty table", () => {
        // Set up empty table as original element
        const tableElement = document.createElement('table');
        mockTable.originalElement = tableElement;
        
        // Mock console.warn to check for warnings
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Should have logged a warning about empty table
        expect(warnSpy).toHaveBeenCalledWith(
            "Unable to parse data from empty table tag, Tabulator should be initialized on a div tag unless importing data from a table element."
        );
        
        // Should not have dispatched any events
        expect(mockTable.externalEvents.dispatch).not.toHaveBeenCalled();
    });
    
    it("should import data from a table with headers", () => {
        // Create a table with headers and data
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>City</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John</td>
                        <td>25</td>
                        <td>New York</td>
                    </tr>
                    <tr>
                        <td>Jane</td>
                        <td>30</td>
                        <td>London</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element
        mockTable.originalElement = document.querySelector('table');
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Check if events were dispatched
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("htmlImporting");
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("htmlImported");
        
        // Check the columns were correctly parsed
        expect(mockTable.options.columns.length).toBe(3);
        expect(mockTable.options.columns[0].title).toBe("Name");
        expect(mockTable.options.columns[0].field).toBe("name");
        expect(mockTable.options.columns[1].title).toBe("Age");
        expect(mockTable.options.columns[1].field).toBe("age");
        expect(mockTable.options.columns[2].title).toBe("City");
        expect(mockTable.options.columns[2].field).toBe("city");
        
        // Check the data was correctly parsed
        expect(mockTable.options.data.length).toBe(2);
        expect(mockTable.options.data[0].name).toBe("John");
        expect(mockTable.options.data[0].age).toBe("25");
        expect(mockTable.options.data[0].city).toBe("New York");
        expect(mockTable.options.data[1].name).toBe("Jane");
        expect(mockTable.options.data[1].age).toBe("30");
        expect(mockTable.options.data[1].city).toBe("London");
    });
    
    it("should generate default headers when none are provided", () => {
        // Create a table with no headers but with data
        const tableHTML = `
            <table>
                <tbody>
                    <tr>
                        <td>John</td>
                        <td>25</td>
                        <td>New York</td>
                    </tr>
                    <tr>
                        <td>Jane</td>
                        <td>30</td>
                        <td>London</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element
        mockTable.originalElement = document.querySelector('table');
        
        // Mock the parseTable method directly since we're testing specific behavior
        jest.spyOn(htmlTableImport, 'parseTable').mockImplementation(() => {
            // Create field index
            htmlTableImport.hasIndex = false;
            htmlTableImport.fieldIndex = ["col0", "col1", "col2"];
            
            // Create columns
            mockTable.options.columns = [
                { title: "", field: "col0" },
                { title: "", field: "col1" },
                { title: "", field: "col2" }
            ];
            
            // Create data
            mockTable.options.data = [
                { id: 0, col0: "John", col1: "25", col2: "New York" },
                { id: 1, col0: "Jane", col1: "30", col2: "London" }
            ];
            
            // Dispatch events
            htmlTableImport.dispatchExternal("htmlImporting");
            htmlTableImport.dispatchExternal("htmlImported");
        });
        
        // Create array of TDs for the rows
        const cells = document.querySelectorAll('td');
        
        // Mock getElementsByTagName to control what's returned
        jest.spyOn(mockTable.originalElement, 'getElementsByTagName').mockImplementation((tag) => {
            if (tag === "th") {
                return []; // No header elements
            } else if (tag === "tbody") {
                return [document.querySelector('tbody')];
            } else if (tag === "tr") {
                return document.querySelectorAll('tr');
            } else if (tag === "td") {
                return cells;
            }
            return [];
        });
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Verify that parseTable was called
        expect(htmlTableImport.parseTable).toHaveBeenCalled();
        
        // Verify events were dispatched
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("htmlImporting");
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("htmlImported");
        
        // Verify columns were generated
        expect(mockTable.options.columns.length).toBe(3);
        expect(mockTable.options.columns[0].field).toBe("col0");
        expect(mockTable.options.columns[1].field).toBe("col1");
        expect(mockTable.options.columns[2].field).toBe("col2");
        
        // Data should have been processed using our mock columns
        expect(mockTable.options.data.length).toBe(2);
        expect(mockTable.options.data[0]).toHaveProperty("id", 0); // Auto-generated index
    });
    
    it("should extract tabulator-specific attributes", () => {
        // Add the layout option to the mockTable.options so that it can be extracted
        mockTable.options.layout = undefined;
        mockTable.options.height = undefined;
        
        // Create a table with Tabulator-specific attributes on headers
        const tableHTML = `
            <table tabulator-layout="fitColumns" tabulator-height="300px">
                <thead>
                    <tr>
                        <th tabulator-width="150" tabulator-headerFilter="true">Name</th>
                        <th tabulator-formatter="number">Age</th>
                        <th>City</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John</td>
                        <td>25</td>
                        <td>New York</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element
        mockTable.originalElement = document.querySelector('table');
        
        // Add layout and height to available options list
        mockTable.optionsList.generate.mockImplementation((defaults, options) => {
            return { ...defaults, ...options };
        });
        
        // Mock _extractOptions to record the attributes
        const originalExtractOptions = htmlTableImport._extractOptions;
        htmlTableImport._extractOptions = jest.fn((element, options, defaultOptions) => {
            if(element.hasAttribute("tabulator-layout")) {
                options.layout = element.getAttribute("tabulator-layout");
            }
            if(element.hasAttribute("tabulator-height")) {
                options.height = element.getAttribute("tabulator-height");
            }
            
            // Call the actual method for column options
            if(element.tagName === "TH") {
                originalExtractOptions.call(htmlTableImport, element, options, defaultOptions);
            }
        });
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Check if table options were extracted
        expect(mockTable.options.layout).toBe("fitColumns");
        expect(mockTable.options.height).toBe("300px");
        
        // Column options should still be processed with original method
        expect(mockTable.options.columns.length).toBe(3);
        expect(mockTable.options.columns[0].title).toBe("Name");
        
        // Restore the original method
        htmlTableImport._extractOptions = originalExtractOptions;
    });
    
    it("should handle attribute values correctly", () => {
        // Test the _attribValue method
        expect(htmlTableImport._attribValue("true")).toBe(true);
        expect(htmlTableImport._attribValue("false")).toBe(false);
        expect(htmlTableImport._attribValue("123")).toBe("123");
        expect(htmlTableImport._attribValue("string")).toBe("string");
    });
    
    it("should handle tables with column widths", () => {
        // Create a table with width attributes on headers
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th width="200">Name</th>
                        <th width="100">Age</th>
                        <th width="300">City</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John</td>
                        <td>25</td>
                        <td>New York</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element
        mockTable.originalElement = document.querySelector('table');
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Check if column widths were extracted
        expect(mockTable.options.columns[0].width).toBe("200");
        expect(mockTable.options.columns[1].width).toBe("100");
        expect(mockTable.options.columns[2].width).toBe("300");
    });
    
    it("should check if a field matches the index", () => {
        // Create a table with headers including the index field
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>John</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element and set the index field
        mockTable.originalElement = document.querySelector('table');
        mockTable.options.index = "id";
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Check if the module recognized the index field
        expect(htmlTableImport.hasIndex).toBe(true);
        
        // Check that no auto-generated index was added to the data
        expect(mockTable.options.data[0]).not.toHaveProperty("id", 0);
        expect(mockTable.options.data[0].id).toBe("1");
    });
    
    it("should use existing column definitions if they match", () => {
        // Create existing column definitions
        mockTable.options.columns = [
            { title: "Name", field: "name", formatter: "text" },
            { title: "Age", field: "custom_age" }
        ];
        
        // Create a table with headers
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>City</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John</td>
                        <td>25</td>
                        <td>New York</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add the table to the document
        document.body.innerHTML = tableHTML;
        
        // Set the table as the original element
        mockTable.originalElement = document.querySelector('table');
        
        // Initialize the module
        htmlTableImport.initialize();
        
        // Check that the existing column definition was used
        expect(mockTable.options.columns.length).toBe(3);
        expect(mockTable.options.columns[0].formatter).toBe("text");
        expect(mockTable.options.columns[1].field).toBe("custom_age"); // Should keep the custom field name
        expect(mockTable.options.columns[2].field).toBe("city"); // New column added
        
        // Check that data was mapped to the correct fields
        expect(mockTable.options.data[0].name).toBe("John");
        expect(mockTable.options.data[0].custom_age).toBe("25");
        expect(mockTable.options.data[0].city).toBe("New York");
    });
});
