import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

describe('Clipboard', function(){
	let table, clipboard;
	let tableData = [
		{id:1, name:"John", age:20},
		{id:2, name:"Jane", age:25},
		{id:3, name:"Steve", age:30}
	];
	let tableColumns = [
		{title:"ID", field:"id"},
		{title:"Name", field:"name"},
		{title:"Age", field:"age"}
	];

	beforeEach(function(){
		let element = document.createElement("div");

		table = new TabulatorFull(element, {
			data:tableData,
			columns:tableColumns,
			clipboard:true
		});

		clipboard = table.module("clipboard");
	});

	afterEach(function(){
		table.destroy();
	});

	test('module is initialized', function(){
		expect(clipboard).toBeDefined();
		expect(clipboard.mode).toBe(true);
	});

	test('setPasteParser accepts string parameter', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		clipboard.setPasteParser('table');
		
		expect(typeof clipboard.pasteParser).toBe('function');
		expect(consoleSpy).not.toHaveBeenCalled();
		
		consoleSpy.mockRestore();
	});

	test('setPasteParser warns on invalid parser name', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		clipboard.setPasteParser('invalid');
		
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	test('setPasteParser accepts function parameter', function(){
		const customParser = function(clipboard){
			return [{id:99, name:"Test", age:99}];
		};
		
		clipboard.setPasteParser(customParser);
		expect(clipboard.pasteParser).toBe(customParser);
	});

	test('setPasteAction accepts string parameter', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		clipboard.setPasteAction('insert');
		
		expect(typeof clipboard.pasteAction).toBe('function');
		expect(consoleSpy).not.toHaveBeenCalled();
		
		consoleSpy.mockRestore();
	});

	test('setPasteAction warns on invalid action name', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		clipboard.setPasteAction('invalid');
		
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	test('setPasteAction accepts function parameter', function(){
		const customAction = function(rows){
			return rows;
		};
		
		clipboard.setPasteAction(customAction);
		expect(clipboard.pasteAction).toBe(customAction);
	});

	test('generatePlainContent creates tab-delimited text', function(){
		const testData = [
			{columns: [{value: "A1"}, {value: "B1"}, {value: "C1"}]},
			{columns: [{value: "A2"}, {value: "B2"}, {value: "C2"}]}
		];
		
		const result = clipboard.generatePlainContent(testData);
		expect(result).toBe("A1\tB1\tC1\nA2\tB2\tC2");
	});

	test('generatePlainContent handles different value types', function(){
		const testData = [
			{columns: [
				{value: "text"}, 
				{value: 123}, 
				{value: null}, 
				{value: undefined}, 
				{value: {test: "object"}}
			]}
		];
		
		const result = clipboard.generatePlainContent(testData);
		expect(result).toBe("text\t123\t\t\t{\"test\":\"object\"}");
	});

	test('reset clears custom selection and blocks copying', function(){
		clipboard.blocked = false;
		clipboard.customSelection = "test";
		
		clipboard.reset();
		
		expect(clipboard.blocked).toBe(true);
		expect(clipboard.customSelection).toBe(false);
	});

	test('mutateData transforms row data', function(){
		// Mock mutator module
		table.modules.mutator = {
			transformRow: jest.fn(row => ({ ...row, transformed: true }))
		};
		
		const testData = [
			{id: 1, name: "Test"}
		];
		
		const result = clipboard.mutateData(testData);
		
		expect(table.modules.mutator.transformRow).toHaveBeenCalledWith(
			{id: 1, name: "Test"}, 
			"clipboard"
		);
		expect(result[0].transformed).toBe(true);
	});

	test('checkPasteOrigin validates paste targets', function(){
		const divTarget = {target: {tagName: "DIV"}};
		const spanTarget = {target: {tagName: "SPAN"}};
		const invalidTarget = {target: {tagName: "INPUT"}};
		
		// Mock confirm method
		clipboard.confirm = jest.fn(() => false);
		
		expect(clipboard.checkPasteOrigin(divTarget)).toBe(true);
		expect(clipboard.checkPasteOrigin(spanTarget)).toBe(true);
		expect(clipboard.checkPasteOrigin(invalidTarget)).toBe(false);
		
		// Test when blocked by confirm
		clipboard.confirm = jest.fn(() => true);
		expect(clipboard.checkPasteOrigin(divTarget)).toBe(false);
	});

	test('getPasteData extracts clipboard text', function(){
		// Test with clipboardData
		const event1 = {
			clipboardData: {
				getData: jest.fn().mockReturnValue("test data")
			}
		};
		
		expect(clipboard.getPasteData(event1)).toBe("test data");
		expect(event1.clipboardData.getData).toHaveBeenCalledWith("text/plain");
		
		// Test with originalEvent
		const event2 = {
			originalEvent: {
				clipboardData: {
					getData: jest.fn().mockReturnValue("original data")
				}
			}
		};
		
		expect(clipboard.getPasteData(event2)).toBe("original data");
	});
});
