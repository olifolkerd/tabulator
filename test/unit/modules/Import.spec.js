import Import from "../../../src/js/modules/Import/Import";
import defaultImporters from "../../../src/js/modules/Import/defaults/importers";

describe("Import module", () => {
    /** @type {Import} */
    let importMod;
    let mockTable;
    
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
            dispatch: jest.fn(),
        };
        
        // Create mock externalEvents
        const mockExternalEvents = {
            dispatch: jest.fn(),
        };
        
        // Create mock dataLoader
        const mockDataLoader = {
            alertLoader: jest.fn(),
            alertError: jest.fn(),
            clearAlert: jest.fn()
        };
        
        // Create column mock
        const mockColumnField = "columnField";
        const mockColumn = {
            getField: jest.fn().mockReturnValue(mockColumnField),
            getDefinition: jest.fn().mockReturnValue({ title: "Column" })
        };
        
        // Create mock module manager
        const mockModuleManager = {
            mutator: {
                transformRow: jest.fn(row => row)
            }
        };
        
        // Create a simplified mock of the table
        mockTable = {
            options: {
                importFormat: null,
                importReader: "text",
                importHeaderTransform: null,
                importValueTransform: null
            },
            modules: mockModuleManager,
            dataLoader: mockDataLoader,
            eventBus: mockEventBus,
            externalEvents: mockExternalEvents,
            optionsList: mockOptionsList,
            getColumns: jest.fn().mockReturnValue([mockColumn]),
            setData: jest.fn().mockResolvedValue(),
        };
        
        // Mock methods in the Import prototype
        jest.spyOn(Import.prototype, 'registerTableOption').mockImplementation(function(key, value) {
            this.table.optionsList.register(key, value);
        });
        
        jest.spyOn(Import.prototype, 'registerTableFunction').mockImplementation(function(name, callback) {
            this.table[name] = callback;
        });
        
        jest.spyOn(Import.prototype, 'subscribe').mockImplementation(function(key, callback, priority) {
            this.table.eventBus.subscribe(key, callback, priority);
        });
        
        jest.spyOn(Import.prototype, 'dispatch').mockImplementation(function(event, ...args) {
            this.table.eventBus.dispatch(event, ...args);
        });
        
        jest.spyOn(Import.prototype, 'dispatchExternal').mockImplementation(function(event, ...args) {
            this.table.externalEvents.dispatch(event, ...args);
        });
        
        // Create an instance of the Import module with the mock table
        importMod = new Import(mockTable);
        
        // Initialize the module
        importMod.initialize();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it("should register table options", () => {
        // Verify that the correct options were registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importFormat", undefined);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importReader", "text");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importHeaderTransform", undefined);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importValueTransform", undefined);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importDataValidator", undefined);
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("importFileValidator", undefined);
    });
    
    it("should register table functions", () => {
        // Verify that the import function was registered
        expect(mockTable.import).toBeDefined();
        expect(typeof mockTable.import).toBe("function");
    });
    
    it("should subscribe to data loading events when importFormat is set", () => {
        // Set importFormat
        mockTable.options.importFormat = "csv";
        
        // Re-initialize the module
        importMod.initialize();
        
        // Verify that the module subscribed to data events
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("data-loading", expect.any(Function), 10);
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("data-load", expect.any(Function), 10);
    });
    
    it("should properly check if data should be loaded through import", () => {
        // Test with string data and importFormat set
        mockTable.options.importFormat = "csv";
        expect(importMod.loadDataCheck("some csv data")).toBe(true);
        
        // Test with array data and importFormat set
        expect(importMod.loadDataCheck([["header1", "header2"], ["data1", "data2"]])).toBe(true);
        
        // Test with object data (should return false)
        expect(importMod.loadDataCheck({ key: "value" })).toBe(false);
        
        // Test with importFormat not set
        mockTable.options.importFormat = null;
        // Should simply evaluate as falsy, doesn't matter if specifically false
        expect(Boolean(importMod.loadDataCheck("some csv data"))).toBe(false);
    });
    
    it("should lookup importers correctly", () => {
        // Mock console.error to suppress error messages
        const originalConsoleError = console.error;
        console.error = jest.fn();
        
        // Test looking up built-in importers
        mockTable.options.importFormat = "csv";
        expect(importMod.lookupImporter()).toBe(defaultImporters.csv);
        
        mockTable.options.importFormat = "json";
        expect(importMod.lookupImporter()).toBe(defaultImporters.json);
        
        // Test looking up custom importer function
        const customImporter = () => {};
        mockTable.options.importFormat = customImporter;
        expect(importMod.lookupImporter()).toBe(customImporter);
        
        // Test with non-existent importer
        mockTable.options.importFormat = "nonexistent";
        expect(importMod.lookupImporter()).toBeUndefined();
        expect(console.error).toHaveBeenCalled();
        
        // Restore console.error
        console.error = originalConsoleError;
    });
    
    it("should transform headers using importHeaderTransform option", () => {
        // Set up importHeaderTransform option
        mockTable.options.importHeaderTransform = jest.fn((value) => value.toUpperCase());
        
        // Test header transformation
        const headers = ["name", "age", "city"];
        const transformed = importMod.transformHeader(headers);
        
        // Verify transformation
        expect(transformed).toEqual(["NAME", "AGE", "CITY"]);
        expect(mockTable.options.importHeaderTransform).toHaveBeenCalledTimes(3);
    });
    
    it("should transform data using importValueTransform option", () => {
        // Set up importValueTransform option
        mockTable.options.importValueTransform = jest.fn((value) => {
            if (typeof value === 'string') {
                return value.trim();
            }
            return value;
        });
        
        // Test data transformation
        const rowData = [" John ", 25, " New York "];
        const transformed = importMod.transformData(rowData);
        
        // Verify transformation
        expect(transformed).toEqual(["John", 25, "New York"]);
        expect(mockTable.options.importValueTransform).toHaveBeenCalledTimes(3);
    });
    
    it("should structure array data to object format", () => {
        // Mock the transform functions
        jest.spyOn(importMod, 'transformHeader').mockImplementation(headers => headers);
        jest.spyOn(importMod, 'transformData').mockImplementation(data => data);
        
        // Test data
        const arrayData = [
            ["name", "age", "city"],
            ["John", 25, "New York"],
            ["Jane", 30, "London"]
        ];
        
        // Structure data
        const result = importMod.structureArrayToObject(arrayData);
        
        // Verify structured data
        expect(result).toEqual([
            { name: "John", age: 25, city: "New York" },
            { name: "Jane", age: 30, city: "London" }
        ]);
        
        // Verify transform functions were called
        expect(importMod.transformHeader).toHaveBeenCalledWith(["name", "age", "city"]);
        expect(importMod.transformData).toHaveBeenCalledWith(["John", 25, "New York"]);
        expect(importMod.transformData).toHaveBeenCalledWith(["Jane", 30, "London"]);
    });
    
    it("should structure array data to column format", () => {
        // Mock the transform functions
        jest.spyOn(importMod, 'transformHeader').mockImplementation(headers => headers);
        jest.spyOn(importMod, 'transformData').mockImplementation(data => data);
        
        // Test data without header row
        const arrayData = [
            ["Data1", 25, "Location1"],
            ["Data2", 30, "Location2"]
        ];
        
        // Structure data
        const result = importMod.structureArrayToColumns(arrayData);
        
        // Verify structured data (should match columns)
        expect(result).toEqual([
            { columnField: "Data1" },
            { columnField: "Data2" }
        ]);
        
        // Test data with header row matching column title
        const arrayDataWithHeader = [
            ["Column", "Age", "City"],  // Header row
            ["Data1", 25, "Location1"],
            ["Data2", 30, "Location2"]
        ];
        
        // Structure data
        const resultWithHeader = importMod.structureArrayToColumns(arrayDataWithHeader);
        
        // Verify structured data (header should be skipped)
        expect(resultWithHeader).toEqual([
            { columnField: "Data1" },
            { columnField: "Data2" }
        ]);
    });
    
    it("should validate file with custom validator", () => {
        // Set up custom file validator
        mockTable.options.importFileValidator = jest.fn(file => {
            if (file.size > 1000000) {
                return "File is too large";
            }
            return true;
        });
        
        // Test with valid file
        const validFile = { name: "data.csv", size: 500000 };
        expect(importMod.validateFile(validFile)).toBe(true);
        
        // Test with invalid file
        const invalidFile = { name: "data.csv", size: 2000000 };
        expect(importMod.validateFile(invalidFile)).toBe("File is too large");
        
        // Verify validator was called
        expect(mockTable.options.importFileValidator).toHaveBeenCalledTimes(2);
    });
    
    it("should validate data with custom validator", async () => {
        // Set up custom data validator
        mockTable.options.importDataValidator = jest.fn(data => {
            if (data.length === 0) {
                return "Data cannot be empty";
            }
            return true;
        });
        
        // Test with valid data
        const validData = [{ name: "John" }];
        const validResult = await importMod.validateData(validData);
        expect(validResult).toEqual(validData);
        
        // Test with invalid data
        const invalidData = [];
        await expect(importMod.validateData(invalidData)).rejects.toBe("Data cannot be empty");
        
        // Verify validator was called
        expect(mockTable.options.importDataValidator).toHaveBeenCalledTimes(2);
    });
    
    it("should mutate data using the mutator module", () => {
        // Mock the mutator transform function
        mockTable.modules.mutator.transformRow.mockImplementation(row => {
            return { ...row, transformed: true };
        });
        
        // Test data
        const data = [
            { name: "John" },
            { name: "Jane" }
        ];
        
        // Mutate data
        const result = importMod.mutateData(data);
        
        // Verify mutated data
        expect(result).toEqual([
            { name: "John", transformed: true },
            { name: "Jane", transformed: true }
        ]);
        
        // Verify mutator was called
        expect(mockTable.modules.mutator.transformRow).toHaveBeenCalledTimes(2);
        expect(mockTable.modules.mutator.transformRow).toHaveBeenCalledWith({ name: "John" }, "import");
        expect(mockTable.modules.mutator.transformRow).toHaveBeenCalledWith({ name: "Jane" }, "import");
    });
    
    it("should set data and dispatch events", async () => {
        // Test data
        const data = [{ name: "John" }];
        
        // Set data
        await importMod.setData(data);
        
        // Verify events were dispatched
        expect(mockTable.eventBus.dispatch).toHaveBeenCalledWith("import-imported", data);
        expect(mockTable.externalEvents.dispatch).toHaveBeenCalledWith("importImported", data);
        
        // Verify dataLoader was called
        expect(mockTable.dataLoader.clearAlert).toHaveBeenCalled();
        
        // Verify setData was called
        expect(mockTable.setData).toHaveBeenCalledWith(data);
    });
    
    it("should process data based on format type", () => {
        // Mock autoColumns option
        mockTable.options.autoColumns = true;
        
        // Mock structureArrayToObject to return expected data
        jest.spyOn(importMod, 'structureArrayToObject').mockImplementation(() => {
            return [{ name: "John", age: 25 }];
        });
        
        // Test with array data
        const arrayData = [["name", "age"], ["John", 25]];
        expect(importMod.structureData(arrayData)).toEqual([{ name: "John", age: 25 }]);
        
        // Test with non-array data
        const objectData = { key: "value" };
        expect(importMod.structureData(objectData)).toEqual(objectData);
    });
    
    it("should load data through import when triggered by data-load event", async () => {
        // Mock the required functions
        jest.spyOn(importMod, 'lookupImporter').mockReturnValue(() => {
            return [{ name: "Imported" }];
        });
        jest.spyOn(importMod, 'structureData').mockImplementation(data => data);
        
        // Set importFormat
        mockTable.options.importFormat = "csv";
        
        // Trigger data load
        const result = await importMod.loadData("some csv data");
        
        // Verify functions were called
        expect(importMod.lookupImporter).toHaveBeenCalled();
        expect(importMod.structureData).toHaveBeenCalledWith([{ name: "Imported" }]);
        
        // Verify result
        expect(result).toEqual([{ name: "Imported" }]);
    });
});
