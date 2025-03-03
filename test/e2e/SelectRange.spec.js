// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.setContent(`<div id="tabulator"></div>`);
	await page.addStyleTag({ path: "./dist/css/tabulator.css" });
	await page.addScriptTag({ path: "./dist/js/tabulator.js" });
	await page.addScriptTag({
		content: `
const table = new Tabulator("#tabulator", {
    selectableRange: true,
    selectableRangeColumns: true,
    selectableRangeRows: true,
    editTriggerEvent: "dblclick",
    rowHeader: {
        resizable: false,
        frozen: true,
        width: 40,
        hozAlign: "center",
        formatter: "rownum",
        cssClass: "range-header-col",
        editor: false,
    },
    columnDefaults: {
        headerSort: false,
        headerHozAlign: "center",
        editable: true,
        editor: "input",
        resizable: "header",
        width: 100,
    },
    columns: [{ field: "text", title: "Text 1" }],
    data: [{ text: "abc" }, { text: "123" }],
});
		`,
	});
	// Wait until the table is initialized
	await page.getByText("abc").waitFor({ state: "visible" });
});

test("Editing cells", async ({ page }) => {
	await page.getByText("abc").click()

	await page.keyboard.press('Enter')
	await page.keyboard.press('ArrowLeft')
	await page.keyboard.press('ArrowLeft')
	await page.keyboard.type('-')
	await page.keyboard.press('ArrowRight')
	await page.keyboard.type('+')
	await page.keyboard.press('Enter')
	await page.keyboard.press('ArrowDown')

	expect(page.getByText("a-b+c")).toBeVisible()
});
