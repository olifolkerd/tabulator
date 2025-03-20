import Module from '../../../src/js/core/Module.js';
import FrozenRows from '../../../src/js/modules/FrozenRows/FrozenRows.js';

// Override the Module methods that interact with the table to avoid dependency issues
const originalRegisterTableOption = Module.prototype.registerTableOption;
Module.prototype.registerTableOption = function() {};

const originalRegisterColumnOption = Module.prototype.registerColumnOption;
Module.prototype.registerColumnOption = function() {};

const originalRegisterComponentFunction = Module.prototype.registerComponentFunction;
Module.prototype.registerComponentFunction = function() {};

describe('FrozenRows', function(){
	// Restore original Module methods after all tests
	afterAll(() => {
		Module.prototype.registerTableOption = originalRegisterTableOption;
		Module.prototype.registerColumnOption = originalRegisterColumnOption;
		Module.prototype.registerComponentFunction = originalRegisterComponentFunction;
	});

	// Test direct functionality without a complete table instance
	describe('Functionality tests', function() {
		test('freezeRow adds row to frozen rows', function(){
			// Create mock elements
			document.createDocumentFragment = jest.fn().mockReturnValue({
				appendChild: jest.fn()
			});
			
			// Create a mock table
			const mockTable = {
				rowManager: {
					adjustTableSize: jest.fn(),
					styleRow: jest.fn()
				},
				columnManager: {
					getContentsElement: jest.fn().mockReturnValue({
						insertBefore: jest.fn()
					}),
					headersElement: {
						nextSibling: null,
						offsetWidth: 500
					}
				},
				options: {}
			};
			
			// Create a FrozenRows instance
			const frozenRows = new FrozenRows(mockTable);
			
			// Mock the refreshData method
			frozenRows.refreshData = jest.fn();
			frozenRows.styleRows = jest.fn();
			
			// Create a mock row element
			const mockElement = document.createElement('div');
			
			// Create a spy for appendChild
			const appendChildSpy = jest.spyOn(frozenRows.topElement, 'appendChild');
			
			// Create a mock row
			const mockRow = {
				modules: {},
				getElement: jest.fn().mockReturnValue(mockElement),
				initialize: jest.fn(),
				normalizeHeight: jest.fn()
			};
			
			// Mock console.warn
			const originalWarn = console.warn;
			console.warn = jest.fn();
			
			// Freeze the row
			frozenRows.freezeRow(mockRow);
			
			// Check that the row was properly frozen
			expect(mockRow.modules.frozen).toBe(true);
			expect(frozenRows.rows).toContain(mockRow);
			expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
			expect(mockRow.initialize).toHaveBeenCalled();
			expect(mockRow.normalizeHeight).toHaveBeenCalled();
			expect(frozenRows.refreshData).toHaveBeenCalledWith(false, "display");
			expect(mockTable.rowManager.adjustTableSize).toHaveBeenCalled();
			expect(frozenRows.styleRows).toHaveBeenCalled();
			
			// Clean up spy
			appendChildSpy.mockRestore();
			
			// Try to freeze already frozen row
			frozenRows.freezeRow(mockRow);
			
			// Should show warning
			expect(console.warn).toHaveBeenCalledWith("Freeze Error - Row is already frozen");
			
			// Restore console.warn
			console.warn = originalWarn;
		});

		test('unfreezeRow removes row from frozen rows', function(){
			// Create mock elements
			document.createDocumentFragment = jest.fn().mockReturnValue({
				appendChild: jest.fn()
			});
			
			// Create a mock table
			const mockTable = {
				rowManager: {
					adjustTableSize: jest.fn(),
					styleRow: jest.fn()
				},
				columnManager: {
					getContentsElement: jest.fn().mockReturnValue({
						insertBefore: jest.fn()
					}),
					headersElement: {
						nextSibling: null,
						offsetWidth: 500
					}
				},
				options: {}
			};
			
			// Create a FrozenRows instance
			const frozenRows = new FrozenRows(mockTable);
			
			// Mock the refreshData method
			frozenRows.refreshData = jest.fn();
			
			// Create a mock row element with parent node
			const mockRowElement = document.createElement('div');
			const parentNode = document.createElement('div');
			parentNode.appendChild(mockRowElement);
			
			// Create a mock row that is already frozen
			const mockRow = {
				modules: { frozen: true },
				getElement: jest.fn().mockReturnValue(mockRowElement)
			};
			
			// Clear the rows array so we don't have any frozen rows after detaching
			frozenRows.rows = [];
			
			// Mock console.warn
			const originalWarn = console.warn;
			console.warn = jest.fn();
			
			// Mock the detachRow method to empty the rows array
			frozenRows.detachRow = jest.fn().mockImplementation(() => {
				frozenRows.rows = []; // Simulate row removal
			});
			frozenRows.styleRows = jest.fn();
			
			// Add the row to be unfrozen
			frozenRows.rows = [mockRow];
			
			// Unfreeze the row
			frozenRows.unfreezeRow(mockRow);
			
			// Check that the row was properly unfrozen
			expect(mockRow.modules.frozen).toBe(false);
			expect(frozenRows.detachRow).toHaveBeenCalledWith(mockRow);
			expect(frozenRows.refreshData).toHaveBeenCalledWith(false, "display");
			expect(mockTable.rowManager.adjustTableSize).toHaveBeenCalled();
			
			// Since rows array is empty after detaching, styleRows should not be called
			expect(frozenRows.styleRows).not.toHaveBeenCalled();
			
			// Try to unfreeze a row that's not frozen
			const notFrozenRow = {
				modules: { frozen: false }
			};
			
			frozenRows.unfreezeRow(notFrozenRow);
			
			// Should show warning
			expect(console.warn).toHaveBeenCalledWith("Freeze Error - Row is already unfrozen");
			
			// Add back a frozen row and test styleRows is called
			const anotherRow = {
				modules: { frozen: true },
				getElement: jest.fn().mockReturnValue(document.createElement('div'))
			};
			
			// Mock the rows array to be non-empty after detaching
			frozenRows.detachRow.mockImplementationOnce(() => {
				frozenRows.rows = [{ id: "dummy" }]; // Leave a row in the array
			});
			
			frozenRows.rows.push(anotherRow);
			frozenRows.styleRows.mockClear();
			
			frozenRows.unfreezeRow(anotherRow);
			
			// With remaining frozen rows, styleRows should have been called
			expect(frozenRows.styleRows).toHaveBeenCalled();
			
			// Restore console.warn
			console.warn = originalWarn;
		});

		test('detachRow removes row from frozen rows array', function(){
			// Create a FrozenRows instance with minimal mock
			const frozenRows = new FrozenRows({});
			
			// Create a mock row element with parent
			const mockRowElement = document.createElement('div');
			const parentNode = document.createElement('div');
			parentNode.appendChild(mockRowElement);
			
			// Create a mock row
			const mockRow = {
				getElement: jest.fn().mockReturnValue(mockRowElement)
			};
			
			// Add the row to the frozen rows
			frozenRows.rows = [mockRow];
			
			// Call detachRow
			frozenRows.detachRow(mockRow);
			
			// Row should be removed from rows array
			expect(frozenRows.rows).not.toContain(mockRow);
			expect(frozenRows.rows.length).toBe(0);
			
			// Element should be removed from DOM
			expect(mockRowElement.parentNode).toBeNull();
			
			// Test with row not in array
			const notIncludedRow = {
				getElement: jest.fn().mockReturnValue(document.createElement('div'))
			};
			
			frozenRows.detachRow(notIncludedRow);
			
			// Should not throw error, no change to rows array
			expect(frozenRows.rows.length).toBe(0);
		});

		test('isRowFrozen checks if row is in frozen rows array', function(){
			// Create a FrozenRows instance with minimal mock
			const frozenRows = new FrozenRows({});
			
			// Create mock rows
			const frozenRow = { id: 1 };
			const notFrozenRow = { id: 2 };
			
			// Add one row to the frozen rows
			frozenRows.rows = [frozenRow];
			
			// Check frozen row
			expect(frozenRows.isRowFrozen(frozenRow)).toBe(true);
			
			// Check non-frozen row
			expect(frozenRows.isRowFrozen(notFrozenRow)).toBe(false);
		});

		test('isFrozen checks if there are any frozen rows', function(){
			// Create a FrozenRows instance with minimal mock
			const frozenRows = new FrozenRows({});
			
			// No frozen rows
			frozenRows.rows = [];
			expect(frozenRows.isFrozen()).toBe(false);
			
			// With frozen rows
			frozenRows.rows = [{ id: 1 }];
			expect(frozenRows.isFrozen()).toBe(true);
		});

		test('getRows filters frozen rows from input array', function(){
			// Create a FrozenRows instance with minimal mock
			const frozenRows = new FrozenRows({});
			
			// Create mock rows
			const row1 = { id: 1 };
			const row2 = { id: 2 };
			const row3 = { id: 3 };
			const row4 = { id: 4 };
			
			// Set frozen rows
			frozenRows.rows = [row2, row4];
			
			// Test filtering
			const inputRows = [row1, row2, row3, row4];
			const result = frozenRows.getRows(inputRows);
			
			// Should contain only non-frozen rows
			expect(result).toEqual([row1, row3]);
			
			// Original array should not be modified
			expect(inputRows).toEqual([row1, row2, row3, row4]);
		});

		test('visibleRows adds frozen rows to visible rows array', function(){
			// Create a FrozenRows instance with minimal mock
			const frozenRows = new FrozenRows({});
			
			// Create mock rows
			const frozenRow1 = { id: 1 };
			const frozenRow2 = { id: 2 };
			const normalRow = { id: 3 };
			
			// Set frozen rows
			frozenRows.rows = [frozenRow1, frozenRow2];
			
			// Test adding to visible rows
			const visibleRows = [normalRow];
			const result = frozenRows.visibleRows(true, visibleRows);
			
			// Should contain both frozen and normal rows
			expect(result).toEqual([normalRow, frozenRow1, frozenRow2]);
			
			// Original array should be modified (this is expected behavior of the method)
			expect(visibleRows).toEqual([normalRow, frozenRow1, frozenRow2]);
		});

		test('initializeRow correctly handles different frozenRows options', function(){
			// Create a mock table
			const mockTable = {
				options: {
					frozenRows: 2 // Number option
				}
			};
			
			// Create a FrozenRows instance
			const frozenRows = new FrozenRows(mockTable);
			frozenRows.freezeRow = jest.fn();
			frozenRows.options = jest.fn().mockReturnValue("id");
			
			// Test with numeric frozenRows option
			// Row position <= frozenRows value
			const row1 = {
				getPosition: jest.fn().mockReturnValue(1),
				getComponent: jest.fn()
			};
			
			frozenRows.initializeRow(row1);
			expect(frozenRows.freezeRow).toHaveBeenCalledWith(row1);
			
			frozenRows.freezeRow.mockClear();
			
			// Row position > frozenRows value
			const row3 = {
				getPosition: jest.fn().mockReturnValue(3),
				getComponent: jest.fn()
			};
			
			frozenRows.initializeRow(row3);
			expect(frozenRows.freezeRow).not.toHaveBeenCalled();
			
			// Test with function frozenRows option
			mockTable.options.frozenRows = jest.fn().mockImplementation(row => row.id === 2);
			
			const row2 = {
				id: 2,
				getComponent: jest.fn().mockReturnValue({ id: 2 })
			};
			
			frozenRows.initializeRow(row2);
			expect(mockTable.options.frozenRows).toHaveBeenCalledWith(row2.getComponent());
			expect(frozenRows.freezeRow).toHaveBeenCalledWith(row2);
			
			frozenRows.freezeRow.mockClear();
			mockTable.options.frozenRows.mockClear();
			
			// Row that doesn't match function condition
			const row4 = {
				id: 4,
				getComponent: jest.fn().mockReturnValue({ id: 4 })
			};
			
			frozenRows.initializeRow(row4);
			expect(mockTable.options.frozenRows).toHaveBeenCalledWith(row4.getComponent());
			expect(frozenRows.freezeRow).not.toHaveBeenCalled();
			
			// Test with array frozenRows option
			mockTable.options.frozenRows = [1, 5, 7];
			
			// Row with matching ID
			const rowMatch = {
				data: { id: 5 }
			};
			
			frozenRows.initializeRow(rowMatch);
			expect(frozenRows.freezeRow).toHaveBeenCalledWith(rowMatch);
			
			frozenRows.freezeRow.mockClear();
			
			// Row with non-matching ID
			const rowNoMatch = {
				data: { id: 2 }
			};
			
			frozenRows.initializeRow(rowNoMatch);
			expect(frozenRows.freezeRow).not.toHaveBeenCalled();
		});
	});
});