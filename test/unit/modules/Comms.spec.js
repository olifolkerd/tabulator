import Module from '../../../src/js/core/Module.js';
import Comms from '../../../src/js/modules/Comms/Comms.js';

// Override the Module.prototype.registerTableFunction to avoid dependency on the full module system
const originalRegisterTableFunction = Module.prototype.registerTableFunction;
Module.prototype.registerTableFunction = function(name, func) {
    this.table[name] = func.bind(this);
};

// This test file focuses only on the essential functionality of the Comms module
describe('Comms', function(){
	let comms;
	let mockTable;

	beforeEach(function(){
		// Create mock element
		const element = document.createElement("div");
		element.id = "table1";
		document.body.appendChild(element);

		// Create mock table with only what we need for Comms
		mockTable = {
			element: element,
			modExists: jest.fn(),
			modules: {
				testModule: {
					commsReceived: jest.fn()
				}
			},
			initGuard: jest.fn() // Add mock initGuard
		};

		// Create the module to test
		comms = new Comms(mockTable);
		
		// Manually assign receive function without initialization
		mockTable.tableComms = function(sourceTable, module, action, data) {
			return comms.receive(sourceTable, module, action, data);
		};
	});

	afterEach(function(){
		document.body.removeChild(document.getElementById("table1"));
	});

	test('module can be created', function(){
		expect(comms).toBeDefined();
		expect(comms.table).toBe(mockTable);
	});

	test('receive calls module commsReceived method', function(){
		// Mock the modExists method to return true
		mockTable.modExists.mockReturnValue(true);

		// Mock sourceTable 
		const mockSourceTable = document.createElement("div");
		
		// Call receive
		comms.receive(mockSourceTable, "testModule", "testAction", {test: "data"});
		
		// Verify the module's commsReceived was called correctly
		expect(mockTable.modExists).toHaveBeenCalledWith("testModule");
		expect(mockTable.modules.testModule.commsReceived).toHaveBeenCalledWith(
			mockSourceTable, 
			"testAction", 
			{test: "data"}
		);
	});

	test('receive warns if module does not exist', function(){
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		
		// Mock the modExists method to return false
		mockTable.modExists.mockReturnValue(false);
		
		// Mock sourceTable 
		const mockSourceTable = document.createElement("div");
		
		comms.receive(mockSourceTable, "nonexistentModule", "testAction", {test: "data"});
		
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});

// Restore the original method after tests
afterAll(() => {
    Module.prototype.registerTableFunction = originalRegisterTableFunction;
});