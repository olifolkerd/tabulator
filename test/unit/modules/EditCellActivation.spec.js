import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

/**
 * Coverage for https://github.com/tabulator-tables/tabulator/issues/4716
 *
 * When a cell is already being edited, Edit.edit() bailed out before opening the
 * editor on the cell being moved into, so tabbing along a row of editable cells
 * only activated every other editor.
 *
 * The second describe block pins the three behaviours the bail-out was there to
 * provide in the first place, so a fix for the above cannot quietly drop them.
 */

// jsdom reports every element as 0x0, so Helpers.elVisible() returns false and
// Edit.findNextEditableCell() never finds a cell to move into. Give elements a
// size for the duration of this file so keyboard navigation can be exercised.
const sizedElement = {configurable: true, get(){ return 20; }};
let originalWidth, originalHeight;

// The built in editors commit or cancel on blur, which clears the editing cell
// before the next one is opened and hides the bug. Issue #4716 was reported
// against a custom editor that leaves that to the table, so use one here.
function passiveEditor(cell, onRendered, success){
	const input = document.createElement("input");

	input.value = cell.getValue();

	onRendered(() => input.focus());
	input.addEventListener("change", () => success(input.value));

	return input;
}

const isEditing = (cell) => cell.getElement().classList.contains("tabulator-editing");

// the field of the cell the edit module currently holds open, or false for none
const editingField = (table) => {
	const current = table.module("edit").currentCell;

	return current ? current.column.field : false;
};

const buildTable = async (options) => {
	document.body.innerHTML = '<div id="test-table"></div>';

	const table = new TabulatorFull("#test-table", options);

	await new Promise(resolve => table.on("tableBuilt", resolve));

	return table;
};

const buildRowTable = (columnOptions = {}) => buildTable({
	data: [{ id: 1, name: "John", age: 25, city: "New York" }],
	columns: [
		{ title: "ID", field: "id" },
		{ title: "Name", field: "name", editor: passiveEditor, ...columnOptions },
		{ title: "Age", field: "age", editor: passiveEditor, ...columnOptions },
		{ title: "City", field: "city", editor: passiveEditor, ...columnOptions },
	],
});

const pressTab = (table) => table.element.dispatchEvent(new window.KeyboardEvent("keydown", {
	key: "Tab",
	keyCode: 9,
	which: 9,
	bubbles: true,
	cancelable: true,
}));

describe("Edit module - editor activation", () => {
	let table;

	beforeAll(() => {
		originalWidth = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetWidth");
		originalHeight = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetHeight");

		Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", sizedElement);
		Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", sizedElement);
	});

	afterAll(() => {
		if(originalWidth){
			Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", originalWidth);
		}

		if(originalHeight){
			Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", originalHeight);
		}
	});

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}
	});

	describe("adjacent editable cells (#4716)", () => {
		it("opens the editor on a cell while a neighbouring cell is being edited", async () => {
			table = await buildRowTable();

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");

			name.edit();
			expect(isEditing(name)).toBe(true);

			age.edit();

			expect(isEditing(age)).toBe(true);
			expect(age.getElement().querySelector("input")).not.toBeNull();
		});

		it("closes the editor on the cell being left behind", async () => {
			table = await buildRowTable();

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");

			name.edit();
			age.edit();

			expect(isEditing(name)).toBe(false);
			expect(name.getElement().querySelector("input")).toBeNull();
			expect(editingField(table)).toBe("age");
		});

		it("activates the editor on every cell of a navigation run, not every other one", async () => {
			table = await buildRowTable();

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");
			const city = row.getCell("city");

			name.edit();

			expect(table.navigateNext()).toBe(true);
			expect(isEditing(age)).toBe(true);

			expect(table.navigateNext()).toBe(true);
			expect(isEditing(city)).toBe(true);
		});

		it("activates the editor on every cell when tabbing with the keyboard", async () => {
			table = await buildRowTable();

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");
			const city = row.getCell("city");

			name.edit();
			expect(isEditing(name)).toBe(true);

			pressTab(table);
			expect(isEditing(age)).toBe(true);

			pressTab(table);
			expect(isEditing(city)).toBe(true);
		});

		it("fires cellEditing for each cell moved into", async () => {
			table = await buildRowTable();

			const editingSpy = jest.fn();
			const row = table.getRows()[0];

			table.on("cellEditing", cell => editingSpy(cell.getField()));

			row.getCell("name").edit();
			table.navigateNext();
			table.navigateNext();

			expect(editingSpy.mock.calls.map(call => call[0])).toEqual(["name", "age", "city"]);
		});

		it("still commits through a built in editor when navigating", async () => {
			table = await buildTable({
				data: [{ id: 1, name: "John", age: 25 }],
				columns: [
					{ title: "ID", field: "id" },
					{ title: "Name", field: "name", editor: "input" },
					{ title: "Age", field: "age", editor: "input" },
				],
			});

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");

			name.edit();
			name.getElement().querySelector("input").value = "Jonathan";

			expect(table.navigateNext()).toBe(true);

			expect(name.getValue()).toBe("Jonathan");
			expect(isEditing(age)).toBe(true);
		});
	});

	describe("editor hand off guarantees", () => {
		it("holds the editor open on a cell that failed validation", async () => {
			table = await buildTable({
				data: [{ id: 1, name: "John", age: 25 }],
				columns: [
					{ title: "ID", field: "id" },
					{ title: "Name", field: "name", editor: passiveEditor, validator: "required" },
					{ title: "Age", field: "age", editor: passiveEditor },
				],
			});

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");
			const input = (name.edit(), name.getElement().querySelector("input"));

			input.value = "";
			input.dispatchEvent(new window.Event("change", {bubbles: true}));

			await new Promise(resolve => setTimeout(resolve, 20));

			expect(table.module("edit").invalidEdit).toBe(true);
			expect(isEditing(name)).toBe(true);

			// the invalid cell refuses to give up focus, so the next cell must not open
			age.edit();

			expect(isEditing(age)).toBe(false);
			expect(isEditing(name)).toBe(true);
			expect(editingField(table)).toBe("name");
		});

		it("leaves the editor alone when edit() is called on the cell already editing", async () => {
			table = await buildRowTable();

			const cancelSpy = jest.fn();
			const name = table.getRows()[0].getCell("name");

			table.on("cellEditCancelled", cancelSpy);

			name.edit();

			const input = name.getElement().querySelector("input");
			input.value = "half typed";

			name.edit();

			expect(name.getElement().querySelector("input")).toBe(input);
			expect(input.value).toBe("half typed");
			expect(cancelSpy).not.toHaveBeenCalled();
		});

		it("leaves the editor alone when the editing cell receives another focus event", async () => {
			table = await buildRowTable();

			const cancelSpy = jest.fn();
			const name = table.getRows()[0].getCell("name");

			table.on("cellEditCancelled", cancelSpy);

			name.edit();

			const input = name.getElement().querySelector("input");
			input.value = "half typed";

			// editTriggerEvent defaults to "focus", so a focus landing back on the
			// cell element while its editor is open must not restart the editor
			name.getElement().dispatchEvent(new window.FocusEvent("focus"));

			expect(name.getElement().querySelector("input")).toBe(input);
			expect(input.value).toBe("half typed");
			expect(cancelSpy).not.toHaveBeenCalled();
		});

		it("closes the open editor when focus moves to a cell that cannot be edited", async () => {
			table = await buildTable({
				data: [{ id: 1, name: "John", age: 25 }],
				columns: [
					{ title: "ID", field: "id" },
					{ title: "Name", field: "name", editor: passiveEditor },
					{ title: "Age", field: "age", editor: passiveEditor, editable: false },
				],
			});

			const row = table.getRows()[0];
			const name = row.getCell("name");
			const age = row.getCell("age");

			name.edit();
			expect(isEditing(name)).toBe(true);

			age.getElement().dispatchEvent(new window.FocusEvent("focus"));

			expect(isEditing(age)).toBe(false);
			expect(isEditing(name)).toBe(false);
			expect(editingField(table)).toBe(false);
			expect(table.element.classList.contains("tabulator-editing")).toBe(false);
		});
	});
});
