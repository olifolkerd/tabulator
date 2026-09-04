import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// jsdom reports every element as 0x0, so Helpers.elVisible() is false for
// everything, and Edit.findNextEditableCell() never finds a cell to move into.
// Give elements a size for the duration of this file.
const sizedElement = {configurable: true, get(){ return 20; }};
let originalWidth, originalHeight;

// jsdom also reports clientWidth 0, so ResponsiveLayout.update() sees a table
// with no room at all and folds every eligible column during the build. Give it
// room instead, so each test folds exactly what it means to fold.
const roomyElement = {configurable: true, get(){ return 1000; }};
const crampedElement = {configurable: true, get(){ return 0; }};
let originalClientWidth;

// The built in editors commit or cancel on blur, which settles the edit before a
// test can look at the open editor. Leave teardown to the table.
function passiveEditor(cell, onRendered, success){
	const input = document.createElement("input");

	input.value = cell.getValue();

	onRendered(() => input.focus());
	input.addEventListener("change", () => success(input.value));

	return input;
}

const buildTable = async (options) => {
	document.body.innerHTML = '<div id="test-table"></div>';

	const table = new TabulatorFull("#test-table", options);

	await new Promise(resolve => table.on("tableBuilt", resolve));

	return table;
};

const buildCollapseTable = (options = {}, editor = passiveEditor) => buildTable({
	data: [
		{ id: 1, name: "John", age: 25, city: "New York" },
		{ id: 2, name: "Jane", age: 30, city: "Boston" },
	],
	columns: [
		{ title: "", formatter: "responsiveCollapse", width: 30, headerSort: false, responsive: 0 },
		{ title: "ID", field: "id", responsive: 0 },
		{ title: "Name", field: "name", editor: editor, responsive: 0 },
		{ title: "Age", field: "age", editor: editor, responsive: 2 },
		{ title: "City", field: "city", editor: editor, responsive: 3 },
	],
	responsiveLayout: "collapseEditable",
	...options,
});

// the row's collapse container, reached the way the toggle formatter reaches it
const collapseEl = (row) => row._row.modules.responsiveLayout.element;

// fold a column away exactly as the resize loop would; jsdom computes no layout,
// so ResponsiveLayout.update() can never decide to do it on its own
const fold = (table, field) => table.module("responsiveLayout")
	.hideColumn(table.columnManager.findColumn(field));

const unfold = (table, field) => table.module("responsiveLayout")
	.showColumn(table.columnManager.findColumn(field));

// the tabulator-field of every cell element still sitting directly in the row,
// in DOM order
const rowFieldOrder = (row) => Array.from(row.getElement().children)
	.filter(el => el.classList.contains("tabulator-cell"))
	.map(el => el.getAttribute("tabulator-field"));

const isEditing = (cell) => cell.getElement().classList.contains("tabulator-editing");

const editingField = (table) => {
	const current = table.module("edit").currentCell;

	return current ? current.column.field : false;
};

const settle = () => new Promise(resolve => setTimeout(resolve, 20));

describe("ResponsiveLayout - collapseEditable", () => {
	let table;

	beforeAll(() => {
		originalWidth = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetWidth");
		originalHeight = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "offsetHeight");

		Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", sizedElement);
		Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", sizedElement);

		// clientWidth lives on Element.prototype in jsdom, not HTMLElement.prototype
		originalClientWidth = Object.getOwnPropertyDescriptor(window.Element.prototype, "clientWidth");

		Object.defineProperty(window.Element.prototype, "clientWidth", roomyElement);
	});

	afterAll(() => {
		if(originalWidth){
			Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", originalWidth);
		}

		if(originalHeight){
			Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", originalHeight);
		}

		if(originalClientWidth){
			Object.defineProperty(window.Element.prototype, "clientWidth", originalClientWidth);
		}
	});

	afterEach(() => {
		if(table){
			table.destroy();
			table = null;
		}
	});

	describe("mode recognition", () => {
		it("treats collapseEditable as a collapse mode", async () => {
			table = await buildCollapseTable();

			const mod = table.module("responsiveLayout");

			expect(mod.mode).toBe("collapseEditable");
			expect(mod.isCollapseMode()).toBe(true);
			expect(mod.isEditableMode()).toBe(true);
			expect(mod.isCollapseMode("collapse")).toBe(true);
			expect(mod.isEditableMode("collapse")).toBe(false);
			expect(mod.isCollapseMode("hide")).toBe(false);
		});

		it("builds the row collapse container and tracks the folded column", async () => {
			table = await buildCollapseTable();

			fold(table, "city");

			const mod = table.module("responsiveLayout");
			const column = table.columnManager.findColumn("city");

			expect(column.visible).toBe(false);
			expect(mod.hiddenColumns).toContain(column);
			expect(collapseEl(table.getRows()[0])).not.toBeUndefined();
		});
	});

	describe("cell relocation", () => {
		it("moves the real cell element into the collapse container", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			expect(cell.getElement().parentNode).toBe(row.getElement());

			fold(table, "city");

			expect(collapseEl(row).contains(cell.getElement())).toBe(true);
			expect(cell.getElement().parentNode).not.toBe(row.getElement());
		});

		it("relocates cells when the responsive loop folds a column on its own", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];

			// take the room away and let update() choose what to fold
			Object.defineProperty(window.Element.prototype, "clientWidth", crampedElement);

			try{
				table.module("responsiveLayout").update();
			}finally{
				Object.defineProperty(window.Element.prototype, "clientWidth", roomyElement);
			}

			// highest responsive value folds first
			expect(table.module("responsiveLayout").hiddenColumns.map(c => c.field)).toEqual(["age", "city"]);
			expect(collapseEl(row).contains(row.getCell("city").getElement())).toBe(true);
			expect(collapseEl(row).contains(row.getCell("age").getElement())).toBe(true);
			expect(rowFieldOrder(row)).toEqual([null, "id", "name"]);
		});

		it("relocates the cell of every row, not just the first", async () => {
			table = await buildCollapseTable();

			fold(table, "city");

			table.getRows().forEach((row) => {
				expect(collapseEl(row).contains(row.getCell("city").getElement())).toBe(true);
			});
		});

		it("shows the relocated cell, which Cell.hide() had left display:none", async () => {
			table = await buildCollapseTable();

			const cell = table.getRows()[0].getCell("city");

			fold(table, "city");

			// Cell.show() clears the inline display, letting the stylesheet decide
			expect(cell.getElement().style.display).toBe("");

			// width is pinned by the playwright spec; jsdom computes no layout
		});

		it("keeps the value rendered by the column's own formatter", async () => {
			table = await buildCollapseTable({
				columns: [
					{ title: "ID", field: "id", responsive: 0 },
					{ title: "City", field: "city", responsive: 3,
						formatter: (cell) => "<b>" + cell.getValue() + "</b>" },
				],
			});

			fold(table, "city");

			const cell = table.getRows()[0].getCell("city");

			expect(cell.getElement().querySelector("b")).not.toBeNull();
			expect(cell.getElement().textContent).toBe("New York");
		});

		it("puts the cell element back in the row, in column order, when unfolded", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			expect(rowFieldOrder(row)).toEqual([null, "id", "name", "age"]);

			unfold(table, "city");

			expect(cell.getElement().parentNode).toBe(row.getElement());
			expect(collapseEl(row).contains(cell.getElement())).toBe(false);
			expect(rowFieldOrder(row)).toEqual([null, "id", "name", "age", "city"]);
		});

		it("keeps the collapse container as the row's last child after a round trip", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];

			fold(table, "city");
			fold(table, "age");
			unfold(table, "age");
			unfold(table, "city");

			expect(row.getElement().lastChild).toBe(collapseEl(row));
			expect(rowFieldOrder(row)).toEqual([null, "id", "name", "age", "city"]);
		});

		it("restores a cell whose column was shown outside the responsive loop", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			expect(collapseEl(row).contains(cell.getElement())).toBe(true);

			// a user calling showColumn() directly bypasses ResponsiveLayout.showColumn;
			// the rebuild that column-show triggers has to converge anyway
			table.showColumn("city");

			expect(cell.getElement().parentNode).toBe(row.getElement());
			expect(cell.getElement().style.display).not.toBe("none");
		});
	});

	describe("editing a folded field", () => {
		it("opens the column's editor inside the collapse container", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			expect(collapseEl(row).querySelector("input")).not.toBeNull();
			expect(isEditing(cell)).toBe(true);
			expect(editingField(table)).toBe("city");
		});

		it("keeps the field label beside the editor while it is open", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");

			const label = cell.getElement().closest("tr").querySelector("td");

			expect(label.textContent).toBe("City");

			cell.edit();

			// the label is a sibling cell of the editor, so it cannot move
			expect(label.textContent).toBe("City");
			expect(label.isConnected).toBe(true);
			expect(collapseEl(row).contains(label)).toBe(true);
		});

		it("commits through cell.setValue, so row data and cellEdited follow", async () => {
			table = await buildCollapseTable();

			const edited = jest.fn();
			const row = table.getRows()[0];
			const cell = row.getCell("city");

			table.on("cellEdited", c => edited(c.getField(), c.getValue()));

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			input.value = "Chicago";
			input.dispatchEvent(new window.Event("change", {bubbles: true}));

			expect(cell.getValue()).toBe("Chicago");
			expect(row.getData().city).toBe("Chicago");
			expect(table.getData()[0].city).toBe("Chicago");
			expect(edited).toHaveBeenCalledTimes(1);
			expect(edited).toHaveBeenCalledWith("city", "Chicago");
		});

		it("fires cellEditing and marks the cell edited", async () => {
			table = await buildCollapseTable();

			const editing = jest.fn();
			const row = table.getRows()[0];
			const cell = row.getCell("city");

			table.on("cellEditing", c => editing(c.getField()));

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			input.value = "Chicago";
			input.dispatchEvent(new window.Event("change", {bubbles: true}));

			expect(editing).toHaveBeenCalledWith("city");
			expect(cell.isEdited()).toBe(true);
			expect(table.getEditedCells().map(c => c.getField())).toEqual(["city"]);
		});

		it("runs the column validator and holds the editor open on failure", async () => {
			table = await buildCollapseTable({
				columns: [
					{ title: "", formatter: "responsiveCollapse", width: 30, headerSort: false, responsive: 0 },
					{ title: "ID", field: "id", responsive: 0 },
					{ title: "City", field: "city", editor: passiveEditor, validator: "required", responsive: 3 },
				],
			});

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			input.value = "";
			input.dispatchEvent(new window.Event("change", {bubbles: true}));

			await settle();

			expect(table.module("edit").invalidEdit).toBe(true);
			expect(isEditing(cell)).toBe(true);
			expect(row.getData().city).toBe("New York");
			expect(cell.getElement().classList.contains("tabulator-validation-fail")).toBe(true);
		});

		it("commits on Enter and cancels on Escape with the built in editor", async () => {
			table = await buildCollapseTable({}, "input");

			const cancelled = jest.fn();
			const row = table.getRows()[0];
			const cell = row.getCell("city");

			table.on("cellEditCancelled", c => cancelled(c.getField()));

			fold(table, "city");

			const press = (key) => collapseEl(row).querySelector("input")
				.dispatchEvent(new window.KeyboardEvent("keydown", {key: key, bubbles: true}));

			cell.edit();
			collapseEl(row).querySelector("input").value = "Chicago";
			press("Enter");

			expect(cell.getValue()).toBe("Chicago");
			expect(editingField(table)).toBe(false);

			cell.edit();
			collapseEl(row).querySelector("input").value = "Nowhere";
			press("Escape");

			expect(cell.getValue()).toBe("Chicago");
			expect(cancelled).toHaveBeenCalledWith("city");
			expect(editingField(table)).toBe(false);
		});

		it("honours editable:false on a folded column", async () => {
			table = await buildCollapseTable({
				columns: [
					{ title: "ID", field: "id", responsive: 0 },
					{ title: "City", field: "city", editor: passiveEditor, editable: false, responsive: 3 },
				],
			});

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			expect(isEditing(cell)).toBe(false);
			expect(editingField(table)).toBe(false);
			expect(collapseEl(row).querySelector("input")).toBeNull();
		});

		it("tabs from a visible cell into a folded one", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];

			fold(table, "city");

			row.getCell("name").edit();
			expect(editingField(table)).toBe("name");

			// age is still visible, city is folded but shown inside the container, so
			// both pass Helpers.elVisible() and both are reachable
			expect(table.navigateNext()).toBe(true);
			expect(editingField(table)).toBe("age");

			expect(table.navigateNext()).toBe(true);
			expect(editingField(table)).toBe("city");
			expect(collapseEl(row).querySelector("input")).not.toBeNull();
		});
	});

	describe("editor survival", () => {
		it("leaves an open editor alone when the collapsed content regenerates", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			input.value = "half typed";

			// a resize driven hide/show, or a row update, lands here mid edit
			table.module("responsiveLayout").generateCollapsedRowContent(row._row);

			expect(collapseEl(row).querySelector("input")).toBe(input);
			expect(input.value).toBe("half typed");
			expect(isEditing(cell)).toBe(true);
			expect(editingField(table)).toBe("city");
		});

		it("survives another column being folded in beside it", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			fold(table, "age");

			expect(input.isConnected).toBe(true);
			expect(editingField(table)).toBe("city");
		});

		// a rebuild skipped to protect an open editor has to be replayed, or the
		// row keeps collapsed content that no longer matches hiddenColumns
		it("replays a rebuild that was deferred by an open editor", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			// folding a second column cannot rebuild this row yet
			fold(table, "age");
			expect(collapseEl(row).textContent).not.toContain("Age");
			expect(table.module("responsiveLayout").deferredRows.has(row._row)).toBe(true);

			// closing the editor has to bring the row back in line
			table.module("edit").cancelEdit();

			expect(collapseEl(row).textContent).toContain("Age");
			expect(collapseEl(row).contains(row.getCell("age").getElement())).toBe(true);
			expect(table.module("responsiveLayout").deferredRows.size).toBe(0);
		});

		it("replays when the editor was open on a visible cell of the row", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];

			// the guard keys on the row, not on the edited cell being folded, so an
			// edit anywhere in the row defers its rebuild
			row.getCell("name").edit();
			fold(table, "city");

			expect(collapseEl(row).textContent).not.toContain("City");

			table.module("edit").cancelEdit();

			expect(collapseEl(row).textContent).toContain("City");
			expect(collapseEl(row).contains(row.getCell("city").getElement())).toBe(true);
		});

		it("replays after a commit, with the committed value in place", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");
			cell.edit();

			const input = collapseEl(row).querySelector("input");

			fold(table, "age");

			input.value = "Chicago";
			input.dispatchEvent(new window.Event("change", {bubbles: true}));

			expect(cell.getValue()).toBe("Chicago");
			expect(collapseEl(row).textContent).toContain("Age");
			expect(collapseEl(row).textContent).toContain("Chicago");
		});

		it("closes the editor when the collapsed block is collapsed", async () => {
			table = await buildCollapseTable();

			const cancelled = jest.fn();
			const row = table.getRows()[0];
			const cell = row.getCell("city");

			table.on("cellEditCancelled", c => cancelled(c.getField()));

			fold(table, "city");
			cell.edit();
			expect(editingField(table)).toBe("city");

			const toggle = row.getElement().querySelector(".tabulator-responsive-collapse-toggle");

			toggle.dispatchEvent(new window.MouseEvent("click", {bubbles: true, cancelable: true}));

			expect(row._row.modules.responsiveLayout.open).toBe(false);
			expect(editingField(table)).toBe(false);
			expect(cancelled).toHaveBeenCalledWith("city");
		});

		it("leaves the editor open when the block is merely opened", async () => {
			table = await buildCollapseTable({responsiveLayoutCollapseStartOpen: false});

			const row = table.getRows()[0];

			fold(table, "city");

			const toggle = row.getElement().querySelector(".tabulator-responsive-collapse-toggle");

			toggle.dispatchEvent(new window.MouseEvent("click", {bubbles: true, cancelable: true}));
			expect(row._row.modules.responsiveLayout.open).toBe(true);

			row.getCell("city").edit();

			expect(editingField(table)).toBe("city");
		});
	});

	describe("row updates", () => {
		it("re-renders the relocated cell when the row data changes", async () => {
			table = await buildCollapseTable();

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");

			await row.update({city: "Denver"});

			expect(cell.getValue()).toBe("Denver");
			expect(collapseEl(row).textContent).toContain("Denver");
			expect(collapseEl(row).contains(row.getCell("city").getElement())).toBe(true);
		});
	});

	describe('responsiveLayout: "collapse" is unchanged', () => {
		it("leaves the real cell in the row and formats a copy of the value", async () => {
			table = await buildCollapseTable({responsiveLayout: "collapse"});

			const row = table.getRows()[0];
			const cell = row.getCell("city");

			fold(table, "city");

			expect(cell.getElement().parentNode).toBe(row.getElement());
			expect(collapseEl(row).contains(cell.getElement())).toBe(false);
			expect(collapseEl(row).textContent).toContain("New York");
			expect(collapseEl(row).querySelector(".tabulator-cell")).toBeNull();
		});

		it("still cannot edit a folded field", async () => {
			table = await buildCollapseTable({responsiveLayout: "collapse"});

			const row = table.getRows()[0];

			fold(table, "city");

			expect(collapseEl(row).querySelector("input")).toBeNull();
			expect(table.module("responsiveLayout").isEditableMode()).toBe(false);
		});
	});
});
