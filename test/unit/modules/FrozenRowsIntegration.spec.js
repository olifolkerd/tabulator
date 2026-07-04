import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// Regression tests for https://github.com/tabulator-tables/tabulator/issues/4871
//
// PR #4809 removed `fragment.appendChild(document.createElement("br"));` from
// FrozenRows.initialize(). That `<br>` was the line break that pushed the
// inline-block `.tabulator-frozen-rows-holder` onto a new row below the
// column headers. Without it the holder collapses next to the headers and a
// frozen row no longer appears pinned above the scrollable body.
describe('FrozenRows integration (issue #4871)', () => {
	let table;

	const setupTable = async (tableOptions = {}) => {
		document.body.innerHTML = '<div id="test-table"></div>';

		const defaultOptions = {
			data: [
				{ id: 1, name: "Alice" },
				{ id: 2, name: "Bob" },
				{ id: 3, name: "Carol" },
			],
			columns: [
				{ title: "ID", field: "id" },
				{ title: "Name", field: "name" },
			],
		};

		const options = { ...defaultOptions, ...tableOptions };
		const newTable = new TabulatorFull("#test-table", options);

		await new Promise(resolve => newTable.on("tableBuilt", resolve));
		return newTable;
	};

	afterEach(() => {
		if (table) {
			table.destroy();
			table = null;
		}
	});

	test('frozen-rows-holder is preceded by a <br> when freezing via row.freeze()', async () => {
		table = await setupTable();

		table.getRow(1).freeze();

		const holder = document.querySelector('.tabulator-frozen-rows-holder');
		expect(holder).not.toBeNull();
		// Sanity: the row was moved into the holder.
		expect(holder.children.length).toBe(1);

		// The visual bug: without a <br> separator the inline-block holder
		// renders inline with the column headers instead of below them.
		expect(holder.previousSibling).not.toBeNull();
		expect(holder.previousSibling.nodeName).toBe('BR');
	});

	test('frozen-rows-holder is preceded by a <br> when using the frozenRows option', async () => {
		table = await setupTable({ frozenRows: 1 });

		const holder = document.querySelector('.tabulator-frozen-rows-holder');
		expect(holder).not.toBeNull();
		// Sanity: the configured row was frozen on init.
		expect(holder.children.length).toBe(1);

		expect(holder.previousSibling).not.toBeNull();
		expect(holder.previousSibling.nodeName).toBe('BR');
	});
});
