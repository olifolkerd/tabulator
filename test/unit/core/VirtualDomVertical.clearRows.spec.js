import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Guards that the replaceChildren() clear (replacing the removeChild loop) still
// empties the render area.
describe("VirtualDomVertical clearRows", () => {
	let el;

	beforeEach(() => {
		el = document.createElement("div");
		document.body.appendChild(el);
	});

	afterEach(() => {
		el.remove();
	});

	test("clearRows removes all rendered row elements", async () => {
		const table = await new Promise((resolve) => {
			const t = new TabulatorFull(el, {
				height: "200px",
				data: Array.from({ length: 50 }, (_, i) => ({ id: i, a: "row " + i })),
				columns: [{ title: "A", field: "a" }],
			});
			t.on("tableBuilt", () => resolve(t));
		});

		// jsdom does not lay out the virtual renderer, so seed the render area
		// directly to prove clearRows empties it.
		const tableElement = table.rowManager.tableElement;
		tableElement.appendChild(document.createElement("div"));
		tableElement.appendChild(document.createElement("div"));
		expect(tableElement.children.length).toBe(2);

		table.rowManager.renderer.clearRows();

		expect(tableElement.children.length).toBe(0);
	});
});
