import Module from '../../../src/js/core/Module.js';
import ColumnCalcs from '../../../src/js/modules/ColumnCalcs/ColumnCalcs.js';

// Override the Module methods that interact with the table to avoid dependency issues
const originalRegisterTableOption = Module.prototype.registerTableOption;
Module.prototype.registerTableOption = function() {};

const originalRegisterColumnOption = Module.prototype.registerColumnOption;
Module.prototype.registerColumnOption = function() {};

// Define test calculation functions
const testCalcs = {
	'avg': function(values, data){
		var output = 0;
		var count = 0;

		if(!values.length){
			return 0;
		}
		
		values.forEach(function(value){
			output += Number(value);
			count++;
		});

		return output / count;
	},
	'max': function(values, data){
		var output = null;

		values.forEach(function(value){
			if(value > output || output === null){
				output = value;
			}
		});

		return output;
	},
	'min': function(values, data){
		var output = null;

		values.forEach(function(value){
			if(value < output || output === null){
				output = value;
			}
		});

		return output;
	},
	'sum': function(values, data){
		var output = 0;
		values.forEach(function(value){
			output += Number(value);
		});
		return output;
	}
};

describe('ColumnCalcs', function(){
	beforeAll(function() {
		// Ensure calculations are available for tests
		ColumnCalcs.calculations = testCalcs;
	});

	// Test direct functionality without a complete table instance
	describe('Functionality tests', function() {
		test('initializeColumn sets up calculations correctly', function(){
			// Create a mock column
			const mockColumn = {
				definition: {
					topCalc: "avg",
					topCalcParams: { test: true },
					bottomCalc: "max"
				},
				modules: {}
			};

			// Create a mock context with required properties
			const mockContext = {
				table: {options: {}},
				topCalcs: [],  // Initialize the required array
				botCalcs: [],  // Initialize the required array
				initializeTopRow: jest.fn(),  // Mock the initialization function
				initializeBottomRow: jest.fn()  // Mock the initialization function
			};

			// Call the function directly with the mock context
			ColumnCalcs.prototype.initializeColumn.call(mockContext, mockColumn);

			// Check the results
			expect(mockColumn.modules.columnCalcs).toBeDefined();
			expect(mockColumn.modules.columnCalcs.topCalc).toBeDefined();
			expect(mockColumn.modules.columnCalcs.botCalc).toBeDefined();
			expect(typeof mockColumn.modules.columnCalcs.topCalc).toBe('function');
			expect(typeof mockColumn.modules.columnCalcs.botCalc).toBe('function');
		});

		test('initializeColumn warns on invalid calculation', function(){
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			
			// Create a column with invalid calculation type
			const testColumn = {
				definition: {
					topCalc: "invalid"
				},
				modules: {}
			};

			// Create a mock context with required properties
			const mockContext = {
				table: {options: {}},
				topCalcs: [],  // Initialize the required array
				botCalcs: [],  // Initialize the required array
				initializeTopRow: jest.fn(),  // Mock the initialization function
				initializeBottomRow: jest.fn()  // Mock the initialization function
			};

			// Call the function directly
			ColumnCalcs.prototype.initializeColumn.call(mockContext, testColumn);
			
			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		test('rowsToData extracts data from rows', function(){
			// Create mock rows
			const rows = [
				{ getData: function() { return {id:1, name:"John", age:20}; } },
				{ getData: function() { return {id:2, name:"Jane", age:25}; } }
			];

			// Mock table options needed for the function
			const mockThis = {
				table: {
					options: {
						dataTree: false,
						dataTreeChildColumnCalcs: false
					},
					modules: {}
				}
			};

			const data = ColumnCalcs.prototype.rowsToData.call(mockThis, rows);
			
			expect(data.length).toBe(rows.length);
			expect(data[0].id).toBe(1);
			expect(data[1].name).toBe("Jane");
		});

		test('generateRowData creates calculation results', function(){
			// Create mock data
			const data = [
				{age: 20, total: 100},
				{age: 25, total: 200},
				{age: 30, total: 300},
				{age: 35, total: 400}
			];

			// Create mock columns
			const ageColumn = {
				modules: { 
					columnCalcs: {
						topCalc: testCalcs.avg,
						botCalc: testCalcs.max,
						topCalcParams: {},
						botCalcParams: {}
					}
				},
				getFieldValue: function(row) { return row.age; },
				setFieldValue: function(row, value) { row.age = value; }
			};

			const totalColumn = {
				modules: { 
					columnCalcs: {
						topCalc: testCalcs.sum,
						botCalc: testCalcs.sum,
						topCalcParams: {},
						botCalcParams: {}
					}
				},
				getFieldValue: function(row) { return row.total; },
				setFieldValue: function(row, value) { row.total = value; }
			};

			// Create a mock context object with the needed properties
			const mockThis = {
				topCalcs: [ageColumn, totalColumn],
				botCalcs: [ageColumn, totalColumn],
				table: {}
			};

			// Test top calculations
			const topData = ColumnCalcs.prototype.generateRowData.call(mockThis, "top", data);
			expect(topData.age).toBe(27.5); // avg of [20,25,30,35]
			expect(topData.total).toBe(1000); // sum of [100,200,300,400]
			
			// Test bottom calculations
			const botData = ColumnCalcs.prototype.generateRowData.call(mockThis, "bottom", data);
			expect(botData.age).toBe(35); // max of [20,25,30,35]
			expect(botData.total).toBe(1000); // sum of [100,200,300,400]
		});

		test('blockCheck manages blocking state', function(){
			// Create a mock object with the properties needed by blockCheck
			const mockObj = {
				blocked: false,
				recalcAfterBlock: false
			};

			// Initially not blocked
			expect(ColumnCalcs.prototype.blockCheck.call(mockObj)).toBe(false);
			expect(mockObj.recalcAfterBlock).toBe(false);
			
			// Set to blocked
			mockObj.blocked = true;
			expect(ColumnCalcs.prototype.blockCheck.call(mockObj)).toBe(true);
			expect(mockObj.recalcAfterBlock).toBe(true);
			
			// Restore from blocked
			mockObj.blocked = false;
			expect(ColumnCalcs.prototype.blockCheck.call(mockObj)).toBe(false);
		});

		test('cellValueChanged triggers recalc for relevant columns', function(){
			// Create mock object for 'this' context
			const mockThis = {
				recalcActiveRows: jest.fn(),
				recalcRowGroup: jest.fn(),
				table: { options: { groupBy: false } }
			};
			
			// Create a cell in a column with calcs
			const cell = {
				column: {
					definition: { 
						topCalc: "avg",
						bottomCalc: "max"
					}
				},
				row: { /* mock row */ }
			};

			// Test with calc column
			ColumnCalcs.prototype.cellValueChanged.call(mockThis, cell);
			expect(mockThis.recalcActiveRows).toHaveBeenCalled();
			
			// Reset mock
			mockThis.recalcActiveRows.mockReset();
			
			// Create a cell in a column without calcs
			const cell2 = {
				column: {
					definition: { /* no calcs */ }
				},
				row: { /* mock row */ }
			};
			
			ColumnCalcs.prototype.cellValueChanged.call(mockThis, cell2);
			expect(mockThis.recalcActiveRows).not.toHaveBeenCalled();
		});
	});
});

// Restore original Module methods after all tests
afterAll(() => {
	Module.prototype.registerTableOption = originalRegisterTableOption;
	Module.prototype.registerColumnOption = originalRegisterColumnOption;
});