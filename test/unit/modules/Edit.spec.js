import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import Edit from '../../../src/js/modules/Edit/Edit.js';

describe("Edit module", () => {
	let table;
	
	// Helper function to create a table and wait for it to be built
	const setupTable = async (tableOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';
		
		const defaultOptions = {
			data: [
				{ id: 1, name: "John", age: 25 },
				{ id: 2, name: "Jane", age: 30 },
				{ id: 3, name: "Bob", age: 35 }
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name", editor: "input" },
				{ title: "Age", field: "age", editor: "number" }
			]
		};
		
		// Create table with merged options
		const options = { ...defaultOptions, ...tableOptions };
		const newTable = new TabulatorFull("#test-table", options);
		
		// Wait for table to be built
		await new Promise(resolve => {
			newTable.on("tableBuilt", resolve);
		});
		
		return newTable;
	};
	
	beforeEach(async () => {
		table = await setupTable();
	});
	
	afterEach(() => {
		if(table) {
			table.destroy();
		}
	});
	
	it("should have edit module", () => {
		const edit = table.module("edit");
		expect(edit).toBeInstanceOf(Edit);
	});
	
	it("should have predefined editors", () => {
		// Check that various editors are defined
		const edit = table.module("edit");
		
		expect(edit.editors).toBeDefined();
		expect(typeof edit.editors.input).toBe("function");
		expect(typeof edit.editors.textarea).toBe("function");
		expect(typeof edit.editors.number).toBe("function");
	});
	
	it("should update cell values", async () => {
		// Get a cell
		const row = table.getRows()[0];
		const cell = row.getCell("name");
		
		// Initial value
		const initialValue = cell.getValue();
		expect(initialValue).toBe("John");
		
		// Update value and check it was changed
		const newValue = "Updated Name";
		cell.setValue(newValue);
		
		expect(cell.getValue()).toBe(newValue);
		expect(row.getData().name).toBe(newValue);
	});
	
	it("should emit cellEdited event when value changes", async () => {
		// Listen for the cellEdited event
		const editPromise = new Promise(resolve => {
			table.on("cellEdited", function(cell) {
				// Verify the changed cell
				expect(cell.getValue()).toBe("Updated via Event");
				expect(cell.getField()).toBe("name");
				resolve();
			});
		});
		
		// Change a cell value to trigger the event
		const cell = table.getRows()[0].getCell("name");
		cell.setValue("Updated via Event");
		
		// Wait for the event
		await editPromise;
	});
	
	it("should add editors to editor types object", () => {
		const edit = table.module("edit");
		const initialEditorCount = Object.keys(edit.editors).length;
		
		// Add a new editor
		const customEditor = function(cell, onRendered, success, cancel) {
			return document.createElement("input");
		};
		
		edit.editors.custom = customEditor;
		
		// Check the editor was added
		expect(Object.keys(edit.editors).length).toBe(initialEditorCount + 1);
		expect(edit.editors.custom).toBe(customEditor);
	});
	
	it("should track edited events", async () => {
		// Create a spy for the cellEdited event
		const cellEditedSpy = jest.fn();
		table.on("cellEdited", cellEditedSpy);
		
		// Change a cell value
		const cell = table.getRows()[0].getCell("name");
		cell.setValue("New Value");
		
		// Wait a bit for event processing
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Should have received the cellEdited event
		expect(cellEditedSpy).toHaveBeenCalled();
	});
});