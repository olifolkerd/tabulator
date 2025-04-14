import Mutator from "../../../src/js/modules/Mutator/Mutator";
import defaultMutators from "../../../src/js/modules/Mutator/defaults/mutators";

describe("Mutator module", () => {
    /** @type {Mutator} */
    let mutator;
    let mockTable;
    
    // Store original mutators
    let originalMutators;
    
    beforeEach(() => {
        // Save original mutators
        originalMutators = { ...Mutator.mutators };
        
        // Create mock columnManager
        const mockColumnManager = {
            traverse: jest.fn((callback) => {
                mockColumns.forEach(callback);
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
        
        // Create mock table
        mockTable = {
            columnManager: mockColumnManager,
            options: {},
            eventBus: mockEventBus,
            optionsList: mockOptionsList
        };
        
        // Mock columns for testing
        const mockColumns = [
            createMockColumn("col1", undefined),
            createMockColumn("col2", undefined),
            createMockColumn("col3", undefined)
        ];
        
        function createMockColumn(field, mutator) {
            return {
                definition: {
                    field: field,
                    mutator: mutator,
                    mutatorParams: { param1: "test" }
                },
                getFieldValue: jest.fn((data) => data[field]),
                setFieldValue: jest.fn((data, value) => {
                    data[field] = value;
                    return data;
                }),
                getComponent: jest.fn(() => ({ column: true }))
            };
        }
        
        // Mock methods in the Mutator prototype
        jest.spyOn(Mutator.prototype, 'registerColumnOption').mockImplementation(function(key) {
            this.table.optionsList.register(key);
        });
        
        jest.spyOn(Mutator.prototype, 'subscribe').mockImplementation(function(key, callback) {
            return this.table.eventBus.subscribe(key, callback);
        });
        
        // Create test mutator functions
        Mutator.mutators = {
            ...defaultMutators,
            uppercase: (value) => typeof value === 'string' ? value.toUpperCase() : value,
            addPrefix: (value, data, type, params) => `${params.prefix || 'prefix_'}${value}`
        };
        
        // Create an instance of the Mutator module with the mock table
        mutator = new Mutator(mockTable);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        // Restore original mutators
        Mutator.mutators = originalMutators;
    });
    
    it("should register all column options during construction", () => {
        // Verify column options are registered
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutator");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorParams");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorData");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorDataParams");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorEdit");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorEditParams");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorClipboard");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorClipboardParams");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorImport");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutatorImportParams");
        expect(mockTable.optionsList.register).toHaveBeenCalledWith("mutateLink");
    });
    
    it("should subscribe to required events during initialization", () => {
        // Initialize the mutator
        mutator.initialize();
        
        // Verify event subscriptions
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-value-changing", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("cell-value-changed", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("column-layout", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-data-init-before", expect.any(Function));
        expect(mockTable.eventBus.subscribe).toHaveBeenCalledWith("row-data-changing", expect.any(Function));
    });
    
    it("should initialize a column with string mutator correctly", () => {
        // Create a mock column with string mutator
        const mockColumn = {
            definition: {
                field: "name",
                mutator: "uppercase",
                mutatorParams: { test: true }
            },
            modules: {}
        };
        
        // Initialize column
        mutator.initializeColumn(mockColumn);
        
        // Verify mutator is set correctly
        expect(mockColumn.modules.mutate).toBeDefined();
        expect(mockColumn.modules.mutate.mutator.mutator).toBe(Mutator.mutators.uppercase);
        expect(mockColumn.modules.mutate.mutator.params).toEqual({ test: true });
    });
    
    it("should initialize a column with function mutator correctly", () => {
        // Create a mock column with function mutator
        const mutatorFunction = jest.fn();
        const mockColumn = {
            definition: {
                field: "name",
                mutator: mutatorFunction,
                mutatorParams: { test: true }
            },
            modules: {}
        };
        
        // Initialize column
        mutator.initializeColumn(mockColumn);
        
        // Verify mutator is set correctly
        expect(mockColumn.modules.mutate).toBeDefined();
        expect(mockColumn.modules.mutate.mutator.mutator).toBe(mutatorFunction);
        expect(mockColumn.modules.mutate.mutator.params).toEqual({ test: true });
    });
    
    it("should initialize a column with data mutator correctly", () => {
        // Create a mock column with data mutator
        const mockColumn = {
            definition: {
                field: "name",
                mutatorData: "uppercase",
                mutatorDataParams: { test: true }
            },
            modules: {}
        };
        
        // Initialize column
        mutator.initializeColumn(mockColumn);
        
        // Verify mutator is set correctly
        expect(mockColumn.modules.mutate).toBeDefined();
        expect(mockColumn.modules.mutate.mutatorData.mutator).toBe(Mutator.mutators.uppercase);
        expect(mockColumn.modules.mutate.mutatorData.params).toEqual({ test: true });
    });
    
    it("should warn if mutator is not found", () => {
        // Spy on console.warn
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Create a mock column with invalid mutator
        const mockColumn = {
            definition: {
                field: "name",
                mutator: "nonExistentMutator"
            },
            modules: {}
        };
        
        // Initialize column
        mutator.initializeColumn(mockColumn);
        
        // Verify warning is issued
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Mutator Error - No such mutator found, ignoring: ", 
            "nonExistentMutator"
        );
    });
    
    it("should transform row data correctly with mutator", () => {
        // Create mock columns with mutators
        const mockColumn1 = {
            definition: {
                field: "name"
            },
            modules: {
                mutate: {
                    mutatorData: {
                        mutator: Mutator.mutators.uppercase,
                        params: {}
                    }
                }
            },
            getFieldValue: jest.fn(data => data.name),
            setFieldValue: jest.fn((data, value) => {
                data.name = value;
                return data;
            }),
            getComponent: jest.fn(() => ({ column: true }))
        };
        
        const mockColumn2 = {
            definition: {
                field: "id"
            },
            modules: {
                mutate: {
                    mutatorData: {
                        mutator: Mutator.mutators.addPrefix,
                        params: { prefix: "ID_" }
                    }
                }
            },
            getFieldValue: jest.fn(data => data.id),
            setFieldValue: jest.fn((data, value) => {
                data.id = value;
                return data;
            }),
            getComponent: jest.fn(() => ({ column: true }))
        };
        
        // Mock the column traversal
        mockTable.columnManager.traverse.mockImplementation(callback => {
            [mockColumn1, mockColumn2].forEach(callback);
        });
        
        // Setup test data
        const testData = {
            name: "john doe",
            id: "123"
        };
        
        // Transform the data
        const result = mutator.transformRow(testData, "data");
        
        // Verify the data was transformed
        expect(result.name).toBe("JOHN DOE");
        expect(result.id).toBe("ID_123");
        
        // Verify the column methods were called
        expect(mockColumn1.getFieldValue).toHaveBeenCalledWith(testData);
        expect(mockColumn1.setFieldValue).toHaveBeenCalledWith(testData, "JOHN DOE");
        expect(mockColumn2.getFieldValue).toHaveBeenCalledWith(testData);
        expect(mockColumn2.setFieldValue).toHaveBeenCalledWith(testData, "ID_123");
    });
    
    it("should transform cell value correctly with mutator", () => {
        // Create mock column with edit mutator
        const mockColumn = {
            modules: {
                mutate: {
                    mutatorEdit: {
                        mutator: Mutator.mutators.uppercase,
                        params: {}
                    }
                }
            },
            setFieldValue: jest.fn((data, value) => {
                data.name = value;
                return data;
            })
        };
        
        // Create mock cell
        const mockCell = {
            column: mockColumn,
            row: {
                getData: jest.fn(() => ({ name: "john doe", id: "123" }))
            },
            getComponent: jest.fn(() => ({ cell: true }))
        };
        
        // Transform the cell value
        const result = mutator.transformCell(mockCell, "john doe");
        
        // Verify the value was transformed
        expect(result).toBe("JOHN DOE");
    });
    
    it("should handle mutateLink property", () => {
        // Create mock linked cell
        const mockLinkedCell = {
            setValue: jest.fn(),
            getValue: jest.fn().mockReturnValue("test value")
        };
        
        // Create mock cell
        const mockCell = {
            column: {
                definition: {
                    mutateLink: "linkedColumn"
                }
            },
            row: {
                getCell: jest.fn().mockReturnValue(mockLinkedCell)
            }
        };
        
        // Call mutateLink
        mutator.mutateLink(mockCell);
        
        // Verify linked cell was updated
        expect(mockCell.row.getCell).toHaveBeenCalledWith("linkedColumn");
        expect(mockLinkedCell.getValue).toHaveBeenCalled();
        expect(mockLinkedCell.setValue).toHaveBeenCalledWith("test value", true, true);
    });
    
    it("should handle array of mutateLink properties", () => {
        // Create mock linked cells
        const mockLinkedCell1 = {
            setValue: jest.fn(),
            getValue: jest.fn().mockReturnValue("value1")
        };
        const mockLinkedCell2 = {
            setValue: jest.fn(),
            getValue: jest.fn().mockReturnValue("value2")
        };
        
        // Create mock cell
        const mockCell = {
            column: {
                definition: {
                    mutateLink: ["linkedColumn1", "linkedColumn2"]
                }
            },
            row: {
                getCell: jest.fn((link) => {
                    if (link === "linkedColumn1") return mockLinkedCell1;
                    if (link === "linkedColumn2") return mockLinkedCell2;
                    return null;
                })
            }
        };
        
        // Call mutateLink
        mutator.mutateLink(mockCell);
        
        // Verify linked cells were updated
        expect(mockCell.row.getCell).toHaveBeenCalledWith("linkedColumn1");
        expect(mockCell.row.getCell).toHaveBeenCalledWith("linkedColumn2");
        expect(mockLinkedCell1.getValue).toHaveBeenCalled();
        expect(mockLinkedCell2.getValue).toHaveBeenCalled();
        expect(mockLinkedCell1.setValue).toHaveBeenCalledWith("value1", true, true);
        expect(mockLinkedCell2.setValue).toHaveBeenCalledWith("value2", true, true);
    });
    
    it("should handle enable and disable methods", () => {
        // Initially enabled
        expect(mutator.enabled).toBe(true);
        
        // Disable
        mutator.disable();
        expect(mutator.enabled).toBe(false);
        
        // Enable
        mutator.enable();
        expect(mutator.enabled).toBe(true);
    });
    
    it("should not apply mutations when disabled", () => {
        // Create mock column with mutator
        const mockColumn = {
            definition: {
                field: "name"
            },
            modules: {
                mutate: {
                    mutatorData: {
                        mutator: Mutator.mutators.uppercase,
                        params: {}
                    }
                }
            },
            getFieldValue: jest.fn(data => data.name),
            setFieldValue: jest.fn(),
            getComponent: jest.fn(() => ({ column: true }))
        };
        
        // Mock the column traversal
        mockTable.columnManager.traverse.mockImplementation(callback => {
            callback(mockColumn);
        });
        
        // Setup test data
        const testData = {
            name: "john doe"
        };
        
        // Disable the mutator
        mutator.disable();
        
        // Transform the data
        const result = mutator.transformRow(testData, "data");
        
        // Verify the data was not transformed
        expect(result).toEqual(testData);
        expect(mockColumn.setFieldValue).not.toHaveBeenCalled();
    });
});
