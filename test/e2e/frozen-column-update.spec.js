import { test, expect } from "@playwright/test";
import { join } from "path";
import { pathToFileURL } from "url";

// https://github.com/tabulator-tables/tabulator/issues/4959
for(const side of ["left", "right"]){
	test(`updating and deleting ${side} frozen columns preserves offsets`, async({page}) => {
		const url = pathToFileURL(join(__dirname, "frozen-column-update.html"));
		if(side === "right") url.searchParams.set("right", "true");
		await page.goto(url.href);
		await page.waitForSelector(".tabulator-row");
		const snapshot = () => page.locator("#table").evaluate((element, side) => {
			return window.table.modules.frozenColumns[`${side}Columns`].map(column => ({
				field: column.field,
				margin: column.modules.frozen.marginValue,
				width: column.getWidth(),
				connected: column.element.isConnected,
			}));
		}, side);
		const before = await snapshot();
		expect(before).toHaveLength(3);
		for(const field of ["b", "a", "c"]){
			await page.locator("#table").evaluate(async(element, field) => {
				await window.table.updateColumnDefinition(field, {title: `${field} renamed`, frozen: true});
			}, field);
			expect(await snapshot()).toEqual(before);
		}
		await page.locator("#table").evaluate(async() => {
			await window.table.deleteColumn("b");
			window.table.redraw(true);
		});
		const after = await snapshot();
		expect(after.map(column => column.field).sort()).toEqual(["a", "c"]);
		expect(after.every(column => column.connected)).toBe(true);
		expect(after.map(column => column.margin)).toEqual([0, after[0].width]);
	});
}
