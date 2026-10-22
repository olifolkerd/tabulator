import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Correctness coverage for Sort._sortItems decorate-sort-undecorate rewrite.
// Builds real rows/columns via TabulatorFull (the Sort.spec.js pattern) and
// validates ordering + stability against a reference implementation of the
// stock per-comparison algorithm, so the tests exercise the real Row/Column
// contract rather than hand-built fakes.

describe("Sort._sortItems (decorate-sort-undecorate)", () => {
	/** @type {TabulatorFull} */
	let tabulator;
	let sortMod;

	const columns = [
		{ title: "A", field: "a", sorter: "number" },
		{ title: "B", field: "b", sorter: "number" },
		{ title: "Name", field: "name", sorter: "string" },
		{ title: "Id", field: "id", sorter: "number" },
	];

	beforeEach(() => {
		const el = document.createElement("div");
		el.id = "tabulator";
		document.body.appendChild(el);
		tabulator = new TabulatorFull("#tabulator", { data: [], columns });
		sortMod = tabulator.module("sort");
		return new Promise((resolve) => tabulator.on("tableBuilt", resolve));
	});

	afterEach(() => {
		tabulator.destroy();
		document.getElementById("tabulator")?.remove();
	});

	// Reference: an independent per-comparison oracle (the pre-rewrite sort algorithm),
	// run over the same real rows/columns _sortItems sees.
	function referenceSort(rows, sortList) {
		const sorterCount = sortList.length - 1;
		return rows.slice().sort((a, b) => {
			let result = 0;
			for (let i = sorterCount; i >= 0; i--) {
				const { column, dir } = sortList[i];
				const { sorter, params } = column.modules.sort;
				const el1 = dir === "asc" ? a : b;
				const el2 = dir === "asc" ? b : a;
				let av = column.getFieldValue(el1.getData());
				let bv = column.getFieldValue(el2.getData());
				av = typeof av !== "undefined" ? av : "";
				bv = typeof bv !== "undefined" ? bv : "";
				result = sorter.call(sortMod, av, bv, el1.getComponent(), el2.getComponent(), column.getComponent(), dir, params);
				if (result !== 0) break;
			}
			return result;
		});
	}

	// Load data, apply sort, and return { actual, expected, original } where actual is
	// produced by Sort.sort() (which delegates to _sortItems) and expected by the reference.
	async function sortData(data, sortSpec) {
		await tabulator.setData(data);
		const sortList = sortSpec.map(({ field, dir }) => ({ column: tabulator.columnManager.findColumn(field), dir }));
		sortMod.setSort(sortList);
		const original = tabulator.rowManager.activeRows.slice();
		const actual = sortMod.sort(original.slice());
		return { actual, expected: referenceSort(original, sortList) };
	}

	const ids = (rows) => rows.map((row) => row.data.id);
	const field = (rows, key) => rows.map((row) => row.data[key]);

	test("single numeric column ascending", async () => {
		const { actual } = await sortData([{ id: 1, a: 3 }, { id: 2, a: 1 }, { id: 3, a: 2 }], [{ field: "a", dir: "asc" }]);
		expect(field(actual, "a")).toEqual([1, 2, 3]);
	});

	test("single numeric column descending", async () => {
		const { actual } = await sortData([{ id: 1, a: 3 }, { id: 2, a: 1 }, { id: 3, a: 2 }], [{ field: "a", dir: "desc" }]);
		expect(field(actual, "a")).toEqual([3, 2, 1]);
	});

	test("sorts the passed data array in place (same reference)", async () => {
		await tabulator.setData([{ id: 1, a: 2 }, { id: 2, a: 1 }]);
		sortMod.setSort([{ column: tabulator.columnManager.findColumn("a"), dir: "asc" }]);
		const rows = tabulator.rowManager.activeRows.slice();
		const ref = rows;
		const out = sortMod.sort(rows);
		expect(out).toBe(ref);
		expect(field(rows, "a")).toEqual([1, 2]);
	});

	test("multi-column ordering matches reference", async () => {
		const data = [
			{ id: 1, a: 2, b: 1 }, { id: 2, a: 1, b: 2 }, { id: 3, a: 1, b: 1 }, { id: 4, a: 2, b: 2 },
		];
		const { actual, expected } = await sortData(data, [{ field: "b", dir: "asc" }, { field: "a", dir: "asc" }]);
		expect(ids(actual)).toEqual(ids(expected));
	});

	test("stability: equal keys preserve original order", async () => {
		const { actual } = await sortData([{ id: 1, a: 1 }, { id: 2, a: 1 }, { id: 3, a: 1 }], [{ field: "a", dir: "asc" }]);
		expect(ids(actual)).toEqual([1, 2, 3]);
	});

	test("matches reference over randomized multi-column (numeric + string, asc + desc)", async () => {
		const sortSpec = [{ field: "name", dir: "desc" }, { field: "a", dir: "asc" }];
		let seed = 99;
		const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
		for (let trial = 0; trial < 10; trial++) {
			const data = [];
			for (let i = 0; i < 60; i++) data.push({ id: i, a: Math.floor(rnd() * 5), name: "n" + Math.floor(rnd() * 5) });
			const { actual, expected } = await sortData(data, sortSpec);
			expect(ids(actual)).toEqual(ids(expected));
		}
	});

	test("undefined field values are coerced to empty string (as stock)", async () => {
		const { actual, expected } = await sortData([{ id: 1, a: 5 }, { id: 2 }, { id: 3, a: 2 }], [{ field: "a", dir: "asc" }]);
		expect(ids(actual)).toEqual(ids(expected));
	});
});
