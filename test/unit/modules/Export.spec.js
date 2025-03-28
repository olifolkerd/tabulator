import Module from '../../../src/js/core/Module.js';
import Export from '../../../src/js/modules/Export/Export.js';
import ExportRow from '../../../src/js/modules/Export/ExportRow.js';
import ExportColumn from '../../../src/js/modules/Export/ExportColumn.js';

// Override the Module methods that interact with the table to avoid dependency issues
const originalRegisterTableOption = Module.prototype.registerTableOption;
Module.prototype.registerTableOption = function() {};

const originalRegisterColumnOption = Module.prototype.registerColumnOption;
Module.prototype.registerColumnOption = function() {};

const originalRegisterTableFunction = Module.prototype.registerTableFunction;
Module.prototype.registerTableFunction = function() {};

describe('Export', function(){
	// Restore original Module methods after all tests
	afterAll(() => {
		Module.prototype.registerTableOption = originalRegisterTableOption;
		Module.prototype.registerColumnOption = originalRegisterColumnOption;
		Module.prototype.registerTableFunction = originalRegisterTableFunction;
	});

	// Test direct functionality without a complete table instance
	describe('Functionality tests', function() {
		test('initialize registers table functions', function(){
			// Create mock table
			const mockTable = {
				options: {}
			};
			
			// Create an Export instance
			const exportModule = new Export(mockTable);
			
			// Mock the register function
			exportModule.registerTableFunction = jest.fn();
			
			// Initialize the module
			exportModule.initialize();
			
			// Check that the table functions were registered
			expect(exportModule.registerTableFunction).toHaveBeenCalledWith("getHtml", expect.any(Function));
		});

		test('columnVisCheck properly evaluates column visibility', function(){
			// Create a mock Export instance
			const exportModule = new Export({});
			exportModule.colVisProp = "htmlOutput";
			exportModule.config = {};
			
			// Test with explicit visible setting
			const visibleColumn = {
				definition: {
					htmlOutput: true
				},
				visible: true,
				field: "name"
			};
			
			expect(exportModule.columnVisCheck(visibleColumn)).toBe(true);
			
			// Test with explicit hidden setting
			const hiddenColumn = {
				definition: {
					htmlOutput: false
				},
				visible: true,
				field: "name"
			};
			
			expect(exportModule.columnVisCheck(hiddenColumn)).toBe(false);
			
			// Test with function
			const mockFn = jest.fn().mockReturnValue(true);
			const funcColumn = {
				definition: {
					htmlOutput: mockFn
				},
				visible: true,
				field: "name",
				getComponent: jest.fn().mockReturnValue({})
			};
			
			expect(exportModule.columnVisCheck(funcColumn)).toBe(true);
			expect(mockFn).toHaveBeenCalled();
			
			// Fix this test case for default column visibility
			const defaultColumn = {
				definition: {},
				visible: true,
				field: "name"
			};
			
			// This should return column.visible && column.field according to the function
			expect(exportModule.columnVisCheck(defaultColumn)).toBe(defaultColumn.visible && defaultColumn.field);
			
			// Test with row header when config.rowHeaders is false
			exportModule.config.rowHeaders = false;
			const rowHeaderColumn = {
				definition: {},
				visible: true,
				field: "name",
				isRowHeader: true
			};
			
			expect(exportModule.columnVisCheck(rowHeaderColumn)).toBe(false);
		});

		test('rowLookup returns correct rows based on range', function(){
			// Define mock rows and mock table
			const mockRows = [
				{id: 1, name: "Row 1"},
				{id: 2, name: "Row 2"},
				{id: 3, name: "Row 3"}
			];
			
			// Create mock table with rowManager
			const mockTable = {
				rowManager: {
					findRow: jest.fn(row => {
						// Mock findRow to return the row if it exists in mockRows
						const foundRow = mockRows.find(r => r.id === row);
						return foundRow || false;
					})
				}
			};
			
			// Create a mock Export instance
			const exportModule = new Export(mockTable);
			exportModule.table = mockTable;
			
			// Mock Export.rowLookups
			Export.rowLookups = {
				"active": jest.fn().mockReturnValue(mockRows),
				"visible": jest.fn().mockReturnValue([mockRows[0], mockRows[1]])
			};
			
			// Test with string range
			const activeRows = exportModule.rowLookup("active");
			expect(activeRows).toEqual(mockRows);
			expect(Export.rowLookups.active).toHaveBeenCalled();
			
			const visibleRows = exportModule.rowLookup("visible");
			expect(visibleRows).toEqual([mockRows[0], mockRows[1]]);
			expect(Export.rowLookups.visible).toHaveBeenCalled();
			
			// Test with function range
			const customRange = jest.fn().mockReturnValue([1, 3]);
			const customRows = exportModule.rowLookup(customRange);
			expect(customRange).toHaveBeenCalled();
			expect(mockTable.rowManager.findRow).toHaveBeenCalledWith(1);
			expect(mockTable.rowManager.findRow).toHaveBeenCalledWith(3);
			expect(customRows).toEqual([mockRows[0], mockRows[2]]);
		});

		test('generateExportList correctly assembles the list', function(){
			// Create mock columns and table
			const mockColumns = [
				{
					definition: { title: "Name" },
					field: "name",
					visible: true,
					getComponent: jest.fn().mockReturnValue({_column: {getFieldValue: jest.fn()}})
				},
				{
					definition: { title: "Age" },
					field: "age",
					visible: true,
					getComponent: jest.fn().mockReturnValue({_column: {getFieldValue: jest.fn()}})
				}
			];
			
			const mockTable = {
				columnManager: {
					columns: mockColumns,
					columnsByIndex: mockColumns
				},
				options: {}
			};
			
			// Create mock Export instance with custom processColumnGroup
			const exportModule = new Export(mockTable);
			exportModule.table = mockTable;
			
			// Mock required methods to avoid deep dependencies
			exportModule.columnVisCheck = jest.fn().mockReturnValue(true);
			exportModule.headersToExportRows = jest.fn().mockReturnValue(["header1", "header2"]);
			exportModule.bodyToExportRows = jest.fn().mockReturnValue(["row1", "row2"]);
			exportModule.rowLookup = jest.fn().mockReturnValue(["rowData1", "rowData2"]);
			exportModule.generateColumnGroupHeaders = jest.fn().mockReturnValue(["group1", "group2"]);
			
			// Mock Export.columnLookups
			Export.columnLookups = {
				"active": jest.fn().mockReturnValue(mockColumns)
			};
			
			// Call generateExportList
			const result = exportModule.generateExportList({}, true, "active", "htmlOutput");
			
			// Check that the result is correct
			expect(result).toEqual(["header1", "header2", "row1", "row2"]);
			expect(exportModule.cloneTableStyle).toBe(true);
			expect(exportModule.config).toEqual({});
			expect(exportModule.colVisProp).toBe("htmlOutput");
			expect(exportModule.colVisPropAttach).toBe("HtmlOutput");
			expect(Export.columnLookups.active).toHaveBeenCalled();
			expect(exportModule.columnVisCheck).toHaveBeenCalled();
			expect(exportModule.headersToExportRows).toHaveBeenCalled();
			expect(exportModule.bodyToExportRows).toHaveBeenCalled();
		});

		test('generateHTMLTable creates a HTML table', function(){
			// Create a mock DOM structure
			const mockTable = document.createElement('table');
			mockTable.innerHTML = '<tr><td>Test</td></tr>';
			
			// Create mock Export instance
			const exportModule = new Export({});
			
			// Mock required methods
			exportModule.generateTableElement = jest.fn().mockReturnValue(mockTable);
			
			// Call generateHTMLTable
			const result = exportModule.generateHTMLTable(["list item"]);
			
			// Check that generateTableElement was called with the list
			expect(exportModule.generateTableElement).toHaveBeenCalledWith(["list item"]);
			
			// Check that the result is the HTML string representation of the table
			expect(result).toContain("<table");
			expect(result).toContain("<tr><td>Test</td></tr>");
		});

		test('getHtml generates HTML with correct parameters', function(){
			// Create mock table
			const mockTable = {
				options: {
					htmlOutputConfig: { custom: true }
				}
			};
			
			// Create mock Export instance
			const exportModule = new Export(mockTable);
			exportModule.table = mockTable;
			
			// Mock required methods
			exportModule.generateExportList = jest.fn().mockReturnValue(["mock list"]);
			exportModule.generateHTMLTable = jest.fn().mockReturnValue("<table>Mock HTML</table>");
			
			// Call getHtml with default parameters
			const result = exportModule.getHtml(true);
			
			// Check that the methods were called with correct parameters
			expect(exportModule.generateExportList).toHaveBeenCalledWith(
				{ custom: true }, // config from table.options.htmlOutputConfig
				undefined, // style
				true, // visible
				"htmlOutput" // colVisProp default
			);
			expect(exportModule.generateHTMLTable).toHaveBeenCalledWith(["mock list"]);
			expect(result).toBe("<table>Mock HTML</table>");
			
			// Call getHtml with custom parameters
			exportModule.generateExportList.mockClear();
			exportModule.generateHTMLTable.mockClear();
			
			const customResult = exportModule.getHtml("active", true, { custom: false }, "downloadOutput");
			
			// Check that the methods were called with custom parameters
			expect(exportModule.generateExportList).toHaveBeenCalledWith(
				{ custom: false }, // custom config
				true, // custom style
				"active", // custom visible
				"downloadOutput" // custom colVisProp
			);
			expect(exportModule.generateHTMLTable).toHaveBeenCalledWith(["mock list"]);
			expect(customResult).toBe("<table>Mock HTML</table>");
		});

		test('mapElementStyles maps styles from one element to another', function(){
			// Create mock elements
			const fromEl = document.createElement('div');
			const toEl = document.createElement('div');
			
			// Set inline styles on fromEl
			fromEl.style.backgroundColor = 'red';
			fromEl.style.color = 'blue';
			fromEl.style.fontSize = '16px';
			
			// Create a mock window.getComputedStyle
			const originalGetComputedStyle = window.getComputedStyle;
			window.getComputedStyle = jest.fn().mockReturnValue({
				getPropertyValue: (prop) => {
					switch(prop) {
						case 'background-color': return 'red';
						case 'color': return 'blue';
						case 'font-size': return '16px';
						default: return '';
					}
				}
			});
			
			// Create mock Export instance
			const exportModule = new Export({});
			exportModule.cloneTableStyle = true;
			
			// Call mapElementStyles
			exportModule.mapElementStyles(
				fromEl, 
				toEl, 
				['background-color', 'color', 'font-size']
			);
			
			// Check that styles were copied
			expect(toEl.style.backgroundColor).toBe('red');
			expect(toEl.style.fontColor).toBe('blue');
			expect(toEl.style.fontSize).toBe('16px');
			
			// Restore original getComputedStyle
			window.getComputedStyle = originalGetComputedStyle;
		});

		test('processColumnGroup correctly processes column groups', function(){
			// Create mock Export instance
			const exportModule = new Export({});
			exportModule.colVisProp = "htmlOutput";
			exportModule.colVisPropAttach = "HtmlOutput";
			
			// Mock columnVisCheck to make testing more predictable
			exportModule.columnVisCheck = jest.fn();
			
			// Leaf column with no subgroups
			const leafColumn = {
				definition: { title: "Name", titleHtmlOutput: "Custom Name" },
				columns: [], // Important: This needs to be defined for the test
				visible: true,
				field: "name"
			};
			
			// For simple leaf column that should be visible
			exportModule.columnVisCheck.mockReturnValueOnce(true);
			
			const leafResult = exportModule.processColumnGroup(leafColumn);
			
			expect(leafResult).toEqual({
				title: "Custom Name", // Should use titleHtmlOutput
				column: leafColumn,
				depth: 1,
				width: 1
			});
			
			// For a column group with a visible child
			const childLeafColumn = {
				definition: { title: "Child" },
				columns: [],
				visible: true,
				field: "child"
			};
			
			const columnGroupWithChild = {
				definition: { title: "Group" },
				columns: [childLeafColumn], // Important: needs to be defined
				visible: true
			};
			
			// Mock to make the child visible
			exportModule.columnVisCheck.mockReturnValueOnce(true);
			
			// Create a custom processColumnGroup that handles recursion for the test
			const originalProcessColumnGroup = exportModule.processColumnGroup;
			exportModule.processColumnGroup = jest.fn(column => {
				if (column === childLeafColumn) {
					return {
						title: "Child",
						column: childLeafColumn,
						depth: 1,
						width: 1
					};
				}
				return originalProcessColumnGroup.call(exportModule, column);
			});
			
			const groupResult = exportModule.processColumnGroup(columnGroupWithChild);
			
			expect(groupResult).toEqual({
				title: "Group",
				column: columnGroupWithChild,
				depth: 2,
				width: 1,
				subGroups: [{
					title: "Child",
					column: childLeafColumn,
					depth: 1,
					width: 1
				}]
			});
			
			// For a column group with no visible children
			const hiddenChildColumn = {
				definition: { title: "Hidden" },
				columns: [],
				visible: false,
				field: "hidden"
			};
			
			const emptyColumnGroup = {
				definition: { title: "Empty Group" },
				columns: [hiddenChildColumn],
				visible: true
			};
			
			// Reset our mocks for this test case
			exportModule.processColumnGroup = originalProcessColumnGroup; // Reset to original
			
			// We need special handling for this test
			// We'll mock processColumnGroup to return false for hiddenChildColumn
			exportModule.processColumnGroup = jest.fn((column) => {
				if (column === hiddenChildColumn) {
					return false; // This simulates columnVisCheck returning false and resulting in no width
				}
				if (column === emptyColumnGroup) {
					return originalProcessColumnGroup.call(exportModule, column);
				}
			});
			
			const emptyGroupResult = exportModule.processColumnGroup(emptyColumnGroup);
			expect(emptyGroupResult).toBe(false);
		});
	});
	
	// Test ExportRow and ExportColumn
	describe('ExportRow and ExportColumn', function() {
		test('ExportRow initializes correctly', function() {
			const columns = ["col1", "col2"];
			const component = { getComponent: jest.fn() };
			const indent = 2;
			
			const row = new ExportRow("group", columns, component, indent);
			
			expect(row.type).toBe("group");
			expect(row.columns).toBe(columns);
			expect(row.component).toBe(component);
			expect(row.indent).toBe(indent);
		});
		
		test('ExportColumn initializes correctly', function() {
			const value = "Cell Value";
			const component = { getComponent: jest.fn() };
			const width = 2;
			const height = 3;
			const depth = 1;
			
			const column = new ExportColumn(value, component, width, height, depth);
			
			expect(column.value).toBe(value);
			expect(column.component).toBe(component);
			expect(column.width).toBe(width);
			expect(column.height).toBe(height);
			expect(column.depth).toBe(depth);
		});
	});
});