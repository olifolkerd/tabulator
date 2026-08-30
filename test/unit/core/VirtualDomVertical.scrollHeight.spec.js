import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Regression: vDomScrollHeight was only ever assigned inside _virtualRenderFill's
// full-fill branch, never initialized. scrollRows reads it (vDomScrollHeight -
// scrollTop > vDomWindowBuffer) on the first scroll before any full fill has run,
// where it was undefined → NaN comparison → wrong branch.
describe("VirtualDomVertical vDomScrollHeight initialization", () => {
	let el;

	beforeEach(() => {
		el = document.createElement("div");
		document.body.appendChild(el);
	});

	afterEach(() => {
		el.remove();
	});

	const build = () =>
		new Promise((resolve) => {
			const table = new TabulatorFull(el, {
				height: "300px",
				data: Array.from({ length: 100 }, (_, i) => ({ id: i, a: "row " + i })),
				columns: [{ title: "A", field: "a" }],
			});
			table.on("tableBuilt", () => resolve(table));
		});

	test("vDomScrollHeight is a number from construction and after clearRows", async () => {
		const table = await build();
		const renderer = table.rowManager.renderer;

		expect(typeof renderer.vDomScrollHeight).toBe("number");

		renderer.clearRows();
		expect(renderer.vDomScrollHeight).toBe(0);
	});
});
