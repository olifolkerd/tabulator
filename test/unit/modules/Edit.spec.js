import TabulatorFull from '../../../src/js/core/TabulatorFull.js';
import Edit from '../../../src/js/modules/Edit/Edit.js';
import List from '../../../src/js/modules/Edit/List.js';
import { DateTime } from "luxon";

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
	
	const setupList = async ({
		cellType = "header",
		cellValue = "Female",
		editorParams = { values: ["Male", "Female"] },
		success = jest.fn(),
		cancel = jest.fn(),
	} = {}) => {
		const element = document.createElement("div");
		const list = new List(
			{
				table: {},
			},
			{
				getType: jest.fn().mockReturnValue(cellType),
				getValue: jest.fn().mockReturnValue(cellValue),
				getElement: jest.fn().mockReturnValue(element),
			},
			jest.fn(),
			success,
			cancel,
			editorParams
		);

		list.input.dispatchEvent(new Event("focus"));
		await new Promise(resolve => setTimeout(resolve, 0));

		return {list, success, cancel, element};
	};
	
	beforeEach(async () => {
		// jsdom does not implement scrollIntoView, which the list focus uses.
		Element.prototype.scrollIntoView = jest.fn();
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
	
	it("should apply a focused header list filter item when Enter is pressed", async () => {
		const {list, success} = await setupList({
			cellValue: "",
		});

		// Navigate down to "Female" (the second option) and apply it.
		list.listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		list.listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		list.listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

		expect(success).toHaveBeenCalledWith("Female");
		expect(list.input.value).toBe("Female");
	});

	it("should keep a header list filter selected when Enter is pressed repeatedly", async () => {
		const {list, success} = await setupList();

		list.listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		list.listEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

		expect(success).toHaveBeenCalledTimes(2);
		expect(success).toHaveBeenNthCalledWith(1, "Female");
		expect(success).toHaveBeenNthCalledWith(2, "Female");
	});

	it("should use currentItems instead of initialValues after the first multiselect parse", async () => {
		const {list} = await setupList({
			cellType: "cell",
			cellValue: ["red", "blue"],
			editorParams: {
				multiselect: true,
				values: ["red", "green", "blue"],
			},
		});

		expect(list.initialValues).toBeNull();
		expect(list.currentItems.map(item => item.value)).toEqual(["red", "blue"]);

		// Deselect "red" by clicking its rendered list item.
		list.data.find(item => item.value === "red").element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(list.currentItems.map(item => item.value)).toEqual(["blue"]);

		list.input.dispatchEvent(new Event("focus"));
		await new Promise(resolve => setTimeout(resolve, 0));

		const redItem = list.data.find(item => item.value === "red");
		const blueItem = list.data.find(item => item.value === "blue");

		expect(list.initialValues).toBeNull();
		expect(redItem.selected).toBe(false);
		expect(blueItem.selected).toBe(true);
		expect(list.currentItems).toEqual([blueItem]);
	});

	// Regression test for https://github.com/tabulator-tables/tabulator/issues/4421
	//
	// Tabulator dispatches the `cellClick` callback from a single click listener
	// bound to the table element; clicks on cells bubble up to it. Since 5.6 the
	// edit click handler calls `e.stopPropagation()` *before* checking whether
	// the cell is actually editable. When a column defines an editor but the
	// cell is not editable, the click is swallowed and never reaches the
	// table-level listener, so the `cellClick` callback never fires.
	it("should fire cellClick when an editor is defined but the cell is not editable (#4421)", async () => {
		const cellClick = jest.fn();

		// A fixed height + basic vertical rendering forces the rows to be laid
		// out into the live DOM under jsdom, so a real click bubbles up to the
		// table-level listener that powers the cellClick callback.
		table = await setupTable({
			height: 300,
			renderVertical: "basic",
			columns: [
				{ title: "ID", field: "id" },
				// Editor defined, but the cell cannot be edited.
				{ title: "Name", field: "name", editor: "input", editable: false, cellClick },
				{ title: "Age", field: "age", editor: "number" },
			],
		});

		const externalCellClick = jest.fn();
		table.on("cellClick", externalCellClick);

		table.redraw(true);
		await new Promise(resolve => setTimeout(resolve, 20));

		const cellElement = table.getRows()[0].getCell("name").getElement();
		cellElement.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

		await new Promise(resolve => setTimeout(resolve, 50));

		// Before the fix neither fired because the edit handler stopped click
		// propagation even though the cell was not editable.
		expect(cellClick).toHaveBeenCalledTimes(1);
		expect(externalCellClick).toHaveBeenCalledTimes(1);
	});
});

describe("Edit module - date editors with 'x' (epoch milliseconds) format", () => {
	// 2021-05-10T00:00:00.000Z
	const EPOCH_MS = 1620604800000;

	let table;

	const buildTable = async (column) => {
		document.body.innerHTML = '<div id="test-table"></div>';
		table = new TabulatorFull("#test-table", {
			data: [{ id: 1, ts: EPOCH_MS }],
			columns: [{ title: "ID", field: "id" }, column],
		});
		await new Promise((resolve) => table.on("tableBuilt", resolve));
		return table;
	};

	// Opens the cell editor and returns its <input> element.
	const openEditor = () => {
		const cell = table.getRows()[0].getCell("ts");
		cell.edit();
		return { cell, input: cell.getElement().querySelector("input") };
	};

	// Sets the input value and submits the edit via the Enter key.
	const submit = (input, value) => {
		input.value = value;
		input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
	};

	beforeEach(() => {
		// The date/time editors resolve luxon from window.DateTime, while the
		// datetime editor resolves it via the dependency registry (window.luxon).
		window.DateTime = DateTime;
		window.luxon = { DateTime };
	});

	afterEach(() => {
		if (table) {
			table.destroy();
		}
		delete window.DateTime;
		delete window.luxon;
	});

	it("datetime editor parses an epoch-ms value into the input on open", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "datetime", editorParams: { format: "x" } });

		const { input } = openEditor();
		const expected = DateTime.fromMillis(EPOCH_MS).toFormat("yyyy-MM-dd'T'HH:mm");
		expect(input.value).toBe(expected);
	});

	it("datetime editor saves the edited value back as epoch milliseconds", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "datetime", editorParams: { format: "x" } });

		const { cell, input } = openEditor();
		submit(input, "2021-05-11T06:30");

		const expected = DateTime.fromISO("2021-05-11T06:30").toMillis();
		expect(cell.getValue()).toBe(expected);
		expect(typeof cell.getValue()).toBe("number");
	});

	it("date editor parses an epoch-ms value into the input on open", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "date", editorParams: { format: "x" } });

		const { input } = openEditor();
		const expected = DateTime.fromMillis(EPOCH_MS).toFormat("yyyy-MM-dd");
		expect(input.value).toBe(expected);
	});

	it("date editor saves the edited value back as epoch milliseconds", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "date", editorParams: { format: "x" } });

		const { cell, input } = openEditor();
		submit(input, "2021-05-11");

		const expected = DateTime.fromFormat("2021-05-11", "yyyy-MM-dd").toMillis();
		expect(cell.getValue()).toBe(expected);
		expect(typeof cell.getValue()).toBe("number");
	});

	it("time editor parses an epoch-ms value into the input on open", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "time", editorParams: { format: "x" } });

		const { input } = openEditor();
		const expected = DateTime.fromMillis(EPOCH_MS).toFormat("HH:mm");
		expect(input.value).toBe(expected);
	});

	it("time editor saves the edited value back as epoch milliseconds", async () => {
		await buildTable({ title: "TS", field: "ts", editor: "time", editorParams: { format: "x" } });

		const { cell, input } = openEditor();
		submit(input, "10:30");

		expect(typeof cell.getValue()).toBe("number");
	});
});
