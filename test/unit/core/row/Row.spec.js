import Row from "../../../../src/js/core/row/Row.js";

describe("Row", () => {
	test("deinitialize invalidates the cached row height", () => {
		const row = Object.create(Row.prototype);
		row.initialized = true;
		row.heightInitialized = true;

		row.deinitialize();

		expect(row.initialized).toBe(false);
		expect(row.heightInitialized).toBe(false);
	});
});
