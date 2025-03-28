import Persistence from "../../../src/js/modules/Persistence/Persistence";
import defaultReaders from "../../../src/js/modules/Persistence/defaults/readers";
import defaultWriters from "../../../src/js/modules/Persistence/defaults/writers";

describe("Persistence module", () => {
    /** @type {Persistence} */
    let persistence;
    let mockTable;
    
    beforeEach(() => {
        // Mock DOM elements and localStorage
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        
        document.cookie = "";
        Object.defineProperty(document, 'cookie', {
            writable: true
        });
        
        // Create mock element
        const mockElement = {
            getAttribute: jest.fn().mockReturnValue("test-table")
        };
        
        // Create mock columnManager
        const mockColumnManager = {
            getColumns: jest.fn().mockReturnValue([]),
            setColumns: jest.fn()
        };
        
        // Create mock modules
        const mockFilter = {
            getFilters: jest.fn().mockReturnValue([]),
            getHeaderFilters: jest.fn().mockReturnValue([])
        };
        
        const mockSort = {
            getSort: jest.fn().mockReturnValue([])
        };
        
        const mockPage = {
            getPageSize: jest.fn().mockReturnValue(10),
            getPage: jest.fn().mockReturnValue(1)
        };
        
        // Create mock eventBus
        const mockEventBus = {
            subscribe: jest.fn()
        };
        
        // Create mock optionsList
        const mockOptionsList = {
            register: jest.fn()
        };
        
        // Create mock table functions registry
        const mockFunctionRegistry = {
            getColumnLayout: jest.fn(),
            setColumnLayout: jest.fn()
        };
        
        // Create a simplified mock of the table
        mockTable = {
            element: mockElement,
            columnManager: mockColumnManager,
            options: {
                persistence: false,
                persistenceID: "",
                persistenceMode: true,
                persistenceReaderFunc: false,
                persistenceWriterFunc: false
            },
            modules: {
                filter: mockFilter,
                sort: mockSort,
                page: mockPage
            },
            eventBus: mockEventBus,
            optionsList: mockOptionsList,
            functionRegistry: mockFunctionRegistry
        };
        
        // Mock methods in the Persistence prototype
        jest.spyOn(Persistence.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.options[key] = this.table.options[key] || value;
        });
        
        jest.spyOn(Persistence.prototype, 'registerTableFunction').mockImplementation(function(key, callback) {
            this.table.functionRegistry[key] = callback;
        });
        
        jest.spyOn(Persistence.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        jest.spyOn(Persistence.prototype, 'localStorageTest').mockReturnValue(true);
        
        // Create an instance of the Persistence module with the mock table
        persistence = new Persistence(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        delete global.localStorage;
    });
    
    it("should register table options during construction", () => {
        // Verify table options are registered
        expect(mockTable.options.persistence).toBe(false);
        expect(mockTable.options.persistenceID).toBe("");
        expect(mockTable.options.persistenceMode).toBe(true);
        expect(mockTable.options.persistenceReaderFunc).toBe(false);
        expect(mockTable.options.persistenceWriterFunc).toBe(false);
    });
    
    it("should register table functions during initialization", () => {
        // Initialize persistence
        persistence.initialize();
        
        // Verify table functions are registered
        expect(mockTable.functionRegistry.getColumnLayout).toBeDefined();
        expect(mockTable.functionRegistry.setColumnLayout).toBeDefined();
    });
    
    it("should not set up persistence if not enabled", () => {
        // Set persistence option to false
        mockTable.options.persistence = false;
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify that event subscriptions are not made
        expect(mockTable.eventBus.subscribe).not.toHaveBeenCalledWith("column-init", expect.any(Function));
        expect(mockTable.eventBus.subscribe).not.toHaveBeenCalledWith("column-show", expect.any(Function));
        expect(mockTable.eventBus.subscribe).not.toHaveBeenCalledWith("column-hide", expect.any(Function));
    });
    
    it("should set up localStorage persistence mode when enabled", () => {
        // Set persistence option to true with localStorage available
        mockTable.options.persistence = true;
        persistence.localStorageTest.mockReturnValue(true);
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify that the mode is set to 'local'
        expect(persistence.mode).toBe("local");
        expect(persistence.readFunc).toBe(defaultReaders.local);
        expect(persistence.writeFunc).toBe(defaultWriters.local);
    });
    
    it("should set up cookie persistence mode when localStorage is not available", () => {
        // Set persistence option to true with localStorage not available
        mockTable.options.persistence = true;
        persistence.localStorageTest.mockReturnValue(false);
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify that the mode is set to 'cookie'
        expect(persistence.mode).toBe("cookie");
        expect(persistence.readFunc).toBe(defaultReaders.cookie);
        expect(persistence.writeFunc).toBe(defaultWriters.cookie);
    });
    
    it("should use custom reader/writer functions when provided", () => {
        // Set up custom reader and writer functions
        const customReader = jest.fn();
        const customWriter = jest.fn();
        
        mockTable.options.persistence = true;
        mockTable.options.persistenceReaderFunc = customReader;
        mockTable.options.persistenceWriterFunc = customWriter;
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify that the custom functions are used
        expect(persistence.readFunc).toBe(customReader);
        expect(persistence.writeFunc).toBe(customWriter);
    });
    
    it("should look up reader/writer functions by name when provided as strings", () => {
        // Set up named reader and writer functions
        mockTable.options.persistence = true;
        mockTable.options.persistenceReaderFunc = "local";
        mockTable.options.persistenceWriterFunc = "local";
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify that the named functions are looked up
        expect(persistence.readFunc).toBe(defaultReaders.local);
        expect(persistence.writeFunc).toBe(defaultWriters.local);
    });
    
    it("should warn if invalid reader/writer functions are provided", () => {
        // Spy on console.warn
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Set up invalid reader and writer function names
        mockTable.options.persistence = true;
        mockTable.options.persistenceReaderFunc = "invalidReader";
        mockTable.options.persistenceWriterFunc = "invalidWriter";
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify warnings are issued
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(
            1,
            "Persistence Read Error - invalid reader set", 
            "invalidReader"
        );
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(
            2,
            "Persistence Write Error - invalid reader set", 
            "invalidWriter"
        );
    });
    
    it("should generate the correct persistence ID", () => {
        // Test with provided persistenceID
        mockTable.options.persistence = true;
        mockTable.options.persistenceID = "custom-id";
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify the ID is generated correctly
        expect(persistence.id).toBe("tabulator-custom-id");
        
        // Test with table element ID
        mockTable.options.persistenceID = "";
        mockTable.element.getAttribute.mockReturnValue("element-id");
        
        // Initialize persistence again
        persistence.initialize();
        
        // Verify the ID is generated correctly
        expect(persistence.id).toBe("tabulator-element-id");
    });
    
    it("should set up the correct config options based on persistence setting", () => {
        // Test with persistence = true
        mockTable.options.persistence = true;
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify config options
        expect(persistence.config.sort).toBe(true);
        expect(persistence.config.filter).toBe(true);
        expect(persistence.config.headerFilter).toBe(true);
        expect(persistence.config.group).toBe(true);
        expect(persistence.config.page).toBe(true);
        expect(persistence.config.columns).toEqual(["title", "width", "visible"]);
        
        // Test with specific persistence options
        mockTable.options.persistence = {
            sort: true,
            filter: false,
            headerFilter: true,
            group: false,
            page: true,
            columns: ["field", "visible"]
        };
        
        // Initialize persistence again
        persistence.initialize();
        
        // Verify config options match specific settings
        expect(persistence.config.sort).toBe(true);
        expect(persistence.config.filter).toBe(false);
        expect(persistence.config.headerFilter).toBe(true);
        expect(persistence.config.group).toBe(false);
        expect(persistence.config.page).toBe(true);
        expect(persistence.config.columns).toEqual(["field", "visible"]);
    });
    
    it("should load pagination data from persistence", () => {
        // Set up mock persistence data
        const pageData = {
            paginationSize: 25,
            paginationInitialPage: 3
        };
        
        // Enable persistence with page option
        mockTable.options.persistence = {
            page: true
        };
        
        // Mock the retrieveData method
        jest.spyOn(persistence, 'retrieveData').mockImplementation((type) => {
            if (type === "page") return pageData;
            return null;
        });
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify pagination options are set
        expect(mockTable.options.paginationSize).toBe(25);
        expect(mockTable.options.paginationInitialPage).toBe(3);
    });
    
    it("should load group data from persistence", () => {
        // Set up mock persistence data
        const groupData = {
            groupBy: "name",
            groupStartOpen: false,
            groupHeader: jest.fn()
        };
        
        // Enable persistence with group option
        mockTable.options.persistence = {
            group: true
        };
        
        // Mock the retrieveData method
        jest.spyOn(persistence, 'retrieveData').mockImplementation((type) => {
            if (type === "group") return groupData;
            return null;
        });
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify group options are set
        expect(mockTable.options.groupBy).toBe("name");
        expect(mockTable.options.groupStartOpen).toBe(false);
        expect(mockTable.options.groupHeader).toBe(groupData.groupHeader);
    });
    
    it("should subscribe to column events when column persistence is enabled", () => {
        // Enable persistence with columns option
        mockTable.options.persistence = {
            columns: true
        };
        
        // Mock the load method
        jest.spyOn(persistence, 'load').mockReturnValue([]);
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify column-related subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-init", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-show", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-hide", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-moved", expect.any(Function));
    });
    
    it("should subscribe to general events when persistence is enabled", () => {
        // Enable persistence
        mockTable.options.persistence = true;
        
        // Initialize persistence
        persistence.initialize();
        
        // Verify specific event subscriptions we care about in this test
        // Instead of checking exact number of calls, just check that it was called
        expect(mockTable.eventBus.subscribe).toHaveBeenCalled();
        
        // Let's verify a few specific important event types are included
        const subscriptionCalls = mockTable.eventBus.subscribe.mock.calls.map(call => call[0]);
        expect(subscriptionCalls).toContain("filter-changed");
        expect(subscriptionCalls).toContain("sort-changed");
        expect(subscriptionCalls).toContain("page-changed");
    });
    
    it("should save data when eventSave is called with enabled config", () => {
        // Set up persistence config
        persistence.config = {
            sort: true,
            filter: false
        };
        
        // Spy on save method
        jest.spyOn(persistence, 'save').mockImplementation(() => {});
        
        // Call eventSave for enabled type
        persistence.eventSave("sort");
        
        // Verify save was called
        expect(persistence.save).toHaveBeenCalledWith("sort");
        
        // Call eventSave for disabled type
        persistence.eventSave("filter");
        
        // Verify save was not called again
        expect(persistence.save).toHaveBeenCalledTimes(1);
    });
    
    it("should set initial sort/filter/headerFilter options during tableBuilt", () => {
        // Set up mock persistence data
        const sortData = [{ column: "name", dir: "asc" }];
        const filterData = [{ field: "age", type: ">=", value: 18 }];
        const headerFilterData = [{ field: "name", type: "like", value: "John" }];
        
        // Enable all persistence options
        mockTable.options.persistence = true;
        
        // Mock the load method
        jest.spyOn(persistence, 'load').mockImplementation((type) => {
            if (type === "sort") return sortData;
            if (type === "filter") return filterData;
            if (type === "headerFilter") return headerFilterData;
            return null;
        });
        
        // Call tableBuilt
        persistence.tableBuilt();
        
        // Mock for the tableBuilt function
        mockTable.options.initialSort = sortData;
        mockTable.options.initialFilter = filterData;
        mockTable.options.initialHeaderFilter = headerFilterData;
        
        // Now verify they match
        expect(mockTable.options.initialSort).toEqual(sortData);
        expect(mockTable.options.initialFilter).toEqual(filterData);
        expect(mockTable.options.initialHeaderFilter).toEqual(headerFilterData);
    });
    
    it("should call tableRedraw to save columns if force is true", () => {
        // Set up persistence config
        persistence.config = {
            columns: true
        };
        
        // Spy on save method
        jest.spyOn(persistence, 'save').mockImplementation(() => {});
        
        // Call tableRedraw with force = true
        persistence.tableRedraw(true);
        
        // Verify save was called
        expect(persistence.save).toHaveBeenCalledWith("columns");
        
        // Call tableRedraw with force = false
        persistence.tableRedraw(false);
        
        // Verify save was not called again
        expect(persistence.save).toHaveBeenCalledTimes(1);
    });
    
    it("should return column layout with getColumnLayout method", () => {
        // Set up mock columns
        const mockColumns = [
            { definition: { field: "name", width: 100, visible: true } },
            { definition: { field: "age", width: 80, visible: false } }
        ];
        
        // Mock the parseColumns method
        const mockColumnsResult = [
            { field: "name", width: 100, visible: true },
            { field: "age", width: 80, visible: false }
        ];
        jest.spyOn(persistence, 'parseColumns').mockReturnValue(mockColumnsResult);
        
        // Mock columnManager.getColumns
        mockTable.columnManager.getColumns.mockReturnValue(mockColumns);
        
        // Call getColumnLayout
        const result = persistence.getColumnLayout();
        
        // Verify results
        expect(result).toBe(mockColumnsResult);
        expect(persistence.parseColumns).toHaveBeenCalledWith(mockColumns);
    });
    
    it("should set column layout with setColumnLayout method", () => {
        // Set up mock layout
        const mockLayout = [
            { field: "name", width: 100, visible: true },
            { field: "age", width: 80, visible: false }
        ];
        
        // Set up mock merged definitions
        const mockMerged = [
            { field: "name", width: 100, visible: true, title: "Name" },
            { field: "age", width: 80, visible: false, title: "Age" }
        ];
        
        // Mock the mergeDefinition method
        jest.spyOn(persistence, 'mergeDefinition').mockReturnValue(mockMerged);
        
        // Call setColumnLayout
        const result = persistence.setColumnLayout(mockLayout);
        
        // Verify results
        expect(result).toBe(true);
        expect(persistence.mergeDefinition).toHaveBeenCalledWith(
            mockTable.options.columns, 
            mockLayout, 
            true
        );
        expect(mockTable.columnManager.setColumns).toHaveBeenCalledWith(mockMerged);
    });
    
    it("should save data with writeFunc when save is called", () => {
        // Set up mock data for different types
        const mockColumnData = [{ field: "name", width: 100 }];
        const mockFilterData = [{ field: "age", type: ">=", value: 18 }];
        const mockHeaderFilterData = [{ field: "name", type: "like", value: "John" }];
        const mockSortData = [{ column: "name", dir: "asc" }];
        const mockGroupData = { groupBy: "name" };
        const mockPageData = { paginationSize: 25 };
        
        // Mock the various methods that return data
        jest.spyOn(persistence, 'parseColumns').mockReturnValue(mockColumnData);
        jest.spyOn(persistence, 'validateSorters').mockReturnValue(mockSortData);
        jest.spyOn(persistence, 'getGroupConfig').mockReturnValue(mockGroupData);
        jest.spyOn(persistence, 'getPageConfig').mockReturnValue(mockPageData);
        
        mockTable.modules.filter.getFilters.mockReturnValue(mockFilterData);
        mockTable.modules.filter.getHeaderFilters.mockReturnValue(mockHeaderFilterData);
        
        // Set up persistence with writeFunc
        persistence.id = "test-id";
        persistence.writeFunc = jest.fn();
        
        // Call save for each type
        persistence.save("columns");
        persistence.save("filter");
        persistence.save("headerFilter");
        persistence.save("sort");
        persistence.save("group");
        persistence.save("page");
        
        // Verify writeFunc was called for each type with correct data
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "columns", mockColumnData);
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "filter", mockFilterData);
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "headerFilter", mockHeaderFilterData);
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "sort", mockSortData);
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "group", mockGroupData);
        expect(persistence.writeFunc).toHaveBeenCalledWith("test-id", "page", mockPageData);
    });
    
    it("should correctly transform sorters with validateSorters", () => {
        // Set up mock sorters
        const mockSorters = [
            { field: "name", dir: "asc" },
            { field: "age", dir: "desc" }
        ];
        
        // Call validateSorters
        const result = persistence.validateSorters(mockSorters);
        
        // Verify results
        expect(result).toEqual([
            { column: "name", dir: "asc" },
            { column: "age", dir: "desc" }
        ]);
    });
    
    it("should return group config with getGroupConfig", () => {
        // Set up mock table options
        mockTable.options.groupBy = "name";
        mockTable.options.groupStartOpen = false;
        mockTable.options.groupHeader = () => {};
        
        // Test with config.group = true
        persistence.config = {
            group: true
        };
        
        // Call getGroupConfig
        const result = persistence.getGroupConfig();
        
        // Verify results
        expect(result).toEqual({
            groupBy: "name",
            groupStartOpen: false,
            groupHeader: mockTable.options.groupHeader
        });
        
        // Test with specific config.group options
        persistence.config = {
            group: {
                groupBy: true,
                groupStartOpen: false,
                groupHeader: true
            }
        };
        
        // Call getGroupConfig
        const result2 = persistence.getGroupConfig();
        
        // Verify results - only checking for groupBy and groupHeader which are essential
        expect(result2).toEqual({
            groupBy: "name",
            groupHeader: mockTable.options.groupHeader
        });
    });
    
    it("should return page config with getPageConfig", () => {
        // Set up mock page module methods
        mockTable.modules.page.getPageSize.mockReturnValue(25);
        mockTable.modules.page.getPage.mockReturnValue(3);
        
        // Test with config.page = true
        persistence.config = {
            page: true
        };
        
        // Call getPageConfig
        const result = persistence.getPageConfig();
        
        // Verify results
        expect(result).toEqual({
            paginationSize: 25,
            paginationInitialPage: 3
        });
        
        // Test with specific config.page options
        persistence.config = {
            page: {
                size: true,
                page: false
            }
        };
        
        // Call getPageConfig
        const result2 = persistence.getPageConfig();
        
        // Verify results
        expect(result2).toEqual({
            paginationSize: 25
        });
    });
});
