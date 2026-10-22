import TabulatorFull from '../../../src/js/core/TabulatorFull.js';

// Regression tests for https://github.com/tabulator-tables/tabulator/issues/4832
//
// When a row is deleted, DataTree wipes its child rows on "row-deleting".
// With dataTreeSelectPropagate, SelectRow then deselects the children of the
// deleted row and walks them with DataTree.getChildren(), which read the tree
// config of child rows that had already been wiped and threw.
describe('DataTree integration (issue #4832)', () => {
	let table;

	const setupTable = async () => {
		document.body.innerHTML = '<div id="test-table"></div>';

		const newTable = new TabulatorFull("#test-table", {
			dataTree: true,
			dataTreeStartExpanded: true,
			dataTreeSelectPropagate: true,
			selectableRows: true,
			data: [
				{ id: 1, name: "Parent", _children: [
					{ id: 2, name: "Child", _children: [
						{ id: 3, name: "Grandchild" },
					] },
				] },
				{ id: 4, name: "Other" },
			],
			columns: [
				{ title: "Name", field: "name" },
			],
		});

		await new Promise((resolve) => newTable.on("tableBuilt", resolve));

		return newTable;
	};

	afterEach(() => {
		if (table && !table.destroyed) {
			table.destroy();
		}
		table = null;
		document.body.innerHTML = '';
	});

	it('should destroy the table when a parent row and its children are selected', async () => {
		table = await setupTable();

		table.getRows()[0].select();
		expect(table.getSelectedRows().map((row) => row.getData().id).sort()).toEqual([1, 2, 3]);

		expect(() => table.destroy()).not.toThrow();
	});

	it('should delete a selected parent row and deselect its children', async () => {
		table = await setupTable();

		table.getRows()[0].select();

		await expect(table.getRows()[0].delete()).resolves.toBeUndefined();

		expect(table.getSelectedRows()).toEqual([]);
		expect(table.getRows().map((row) => row.getData().id)).toEqual([4]);
	});
});
