import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Regression: rerenderRows' fallback index was `this.rows.length - 1`, but
// `this.rows` is the METHOD (arity 0), so the expression was always -1. When the
// pre-render window scan found no anchor row (stale / out-of-range window), the
// renderer filled from position -1. Asserted on the argument passed to
// _virtualRenderFill because jsdom reports the holder as non-visible, so the
// fill itself is a no-op there.
describe("VirtualDomVertical rerenderRows fallback index", () => {
	let el;

	beforeEach(() => {
		el = document.createElement("div");
		document.body.appendChild(el);
	});

	afterEach(() => {
		el.remove();
	});

	const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, a: "row " + i }));

	const build = () =>
		new Promise((resolve) => {
			const table = new TabulatorFull(el, {
				height: "300px",
				data,
				columns: [{ title: "A", field: "a" }],
			});
			table.on("tableBuilt", () => resolve(table));
		});

	test("fallback passes the last display-row index, not -1", async () => {
		const table = await build();
		const renderer = table.rowManager.renderer;

		// Inverted rendered window so the anchor scan never runs its body and
		// topRow stays false, exercising the fallback branch. The indices stay
		// in range on purpose: an out-of-range window is the separate
		// windowInvalid case, which takes a fresh fill instead.
		renderer.vDomTop = 5;
		renderer.vDomBottom = 3;

		const spy = jest.spyOn(renderer, "_virtualRenderFill");
		renderer.rerenderRows(() => {});

		expect(spy).toHaveBeenCalled();
		expect(spy.mock.calls[0][0]).toBe(data.length - 1); // 999, not -1
	});
});
