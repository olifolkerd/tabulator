import TabulatorFull from "../../../src/js/core/TabulatorFull";
import VirtualDomVertical from "../../../src/js/core/rendering/renderers/VirtualDomVertical.js";

// Regression: RowManager stored options.renderVertical verbatim in renderMode.
// When a custom renderer CLASS was passed (renderVertical: SomeRenderer), the
// class was later stringified into the tabulator-render-mode DOM attribute
// (RowManager._showPlaceholder) and returned by getRenderMode() as a function
// rather than a mode string.
describe("RowManager renderMode", () => {
	let el;

	beforeEach(() => {
		el = document.createElement("div");
		document.body.appendChild(el);
	});

	afterEach(() => {
		el.remove();
	});

	const build = (options) =>
		new Promise((resolve) => {
			const table = new TabulatorFull(el, options);
			table.on("tableBuilt", () => resolve(table));
		});

	test("string renderVertical is recorded verbatim", async () => {
		const table = await build({
			renderVertical: "virtual",
			placeholder: "No Data",
			data: [],
			columns: [{ title: "A", field: "a" }],
		});

		expect(table.rowManager.getRenderMode()).toBe("virtual");
	});

	test("custom renderer class resolves to a string mode, not the class source", async () => {
		class CustomRenderer extends VirtualDomVertical {}

		const table = await build({
			renderVertical: CustomRenderer,
			placeholder: "No Data",
			data: [],
			columns: [{ title: "A", field: "a" }],
		});

		const mode = table.rowManager.getRenderMode();
		expect(typeof mode).toBe("string");
		expect(mode).toBe("virtual");

		// The mode is written into the tabulator-render-mode DOM attribute; before
		// the fix this held the stringified class body. Show the placeholder so
		// the attribute is actually written.
		table.rowManager.tableEmpty();
		const placeholder = table.element.querySelector("[tabulator-render-mode]");
		expect(placeholder).not.toBeNull();
		const attr = placeholder.getAttribute("tabulator-render-mode");
		expect(attr).toBe("virtual");
		expect(attr).not.toMatch(/class |function |=>/);
	});
});
