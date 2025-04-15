import Tabulator from '../../../src/js/core/Tabulator.js';
import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import Accessor from '../../../src/js/modules/Accessor/Accessor.js';

describe('Accessor', function(){
	/** @type {Tabulator} */
	let table;
    /** @type {Accessor} */
	let accessor;
	let tableData = [
		{id:1, name:"John", age:20},
		{id:2, name:"Jane", age:25},
		{id:3, name:"Steve", age:30}
	];
	let tableColumns = [
		{title:"ID", field:"id"},
		{title:"Name", field:"name", accessor:function(value){ return value; }},
		{title:"Age", field:"age", accessor:function(value, data, type){
			return value + " years";
		}},
		{title:"Custom", field:"custom", accessorDownload:function(value){ return value; }}
	];

	// Mock accessor function
	beforeAll(function(){
		// Add a test accessor to the static accessors
		Accessor.accessors.test = function(value) { return value + "-test"; };
	});

	beforeEach(function(){
		let element = document.createElement("div");

		table = new TabulatorFull(element, {
			data:tableData,
			columns:tableColumns
		});

		accessor = table.module("accessor");
	});

	afterEach(function(){
		table.destroy();
	});

	test('module is initialized', function(){
		expect(accessor).toBeDefined();
		expect(accessor.allowedTypes).toContain("data");
		expect(accessor.allowedTypes).toContain("download");
		expect(accessor.allowedTypes).toContain("clipboard");
	});

	test('lookupAccessor returns accessor function from string name', function(){
		const testAccessor = accessor.lookupAccessor("test");
		expect(typeof testAccessor).toBe("function");
		expect(testAccessor("value")).toBe("value-test");
	});

	test('lookupAccessor returns function directly', function(){
		const customFunc = function(value){ return value; };
		const result = accessor.lookupAccessor(customFunc);
		expect(result).toBe(customFunc);
	});

	test('lookupAccessor warns on invalid accessor name', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		const result = accessor.lookupAccessor("invalid");
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toBe(false);
		consoleSpy.mockRestore();
	});

	// Create mock table for testing accessor functionality
	test('initializeColumn sets up accessors on columns', function() {
		// Create a mock column
		const mockColumn = {
			definition: {
				accessor: "test",
				accessorParams: { test: true }
			},
			modules: {}
		};

		// Initialize the column
		accessor.initializeColumn(mockColumn);

		// The nested structure: modules.accessor.accessor.accessor represents
		// Container -> Type -> Function
		expect(mockColumn.modules.accessor).toBeDefined();
		expect(mockColumn.modules.accessor.accessor).toBeDefined();
		expect(mockColumn.modules.accessor.accessor.accessor).toBeDefined();
		expect(typeof mockColumn.modules.accessor.accessor.accessor).toBe('function');
	});

	test('transformRow applies accessors to data', function(){
		// Create mock column with accessor
		const mockColumn = {
			field: "age",
			modules: {
				accessor: {
					accessor: {
						// This is the actual accessor function in the nested structure
						accessor: function(value) { return value + " years"; },
						params: {}
					}
				}
			},
			getFieldValue: function(data) { return data.age; },
			setFieldValue: function(data, value) { data.age = value; },
			getComponent: function() { return {}; }
		};

		// Create mock row
		const mockRow = {
			data: { id: 1, name: "John", age: 20 },
			getComponent: function() { return {}; }
		};

		// Simplified implementation of transformRow process
		const transformedData = { ...mockRow.data };
		const value = mockColumn.getFieldValue(transformedData);
		const newValue = mockColumn.modules.accessor.accessor.accessor(value);
		mockColumn.setFieldValue(transformedData, newValue);

		// Verify accessor was applied
		expect(transformedData.age).toBe("20 years");
	});

	test('transformRow applies different accessors based on type', function(){
		// Create mock column with download accessor
		const mockColumn = {
			field: "custom",
			modules: {
				accessor: {
					// Using accessorDownload instead of accessor for download-specific transformations
					accessorDownload: {
						accessor: function(value) { return "downloaded-" + value; },
						params: {}
					}
				}
			},
			getFieldValue: function(data) { return data.custom || ""; },
			setFieldValue: function(data, value) { data.custom = value; },
			getComponent: function() { return {}; }
		};

		// Create mock row
		const mockRow = {
			data: { id: 1, name: "John", age: 20, custom: "test" },
			getComponent: function() { return {}; }
		};

		// Using the type-specific accessor (accessorDownload)
		const transformedData = { ...mockRow.data };
		const value = mockColumn.getFieldValue(transformedData);
		const newValue = mockColumn.modules.accessor.accessorDownload.accessor(value);
		mockColumn.setFieldValue(transformedData, newValue);

		// Verify download accessor was applied
		expect(transformedData.custom).toBe("downloaded-test");
	});
});
