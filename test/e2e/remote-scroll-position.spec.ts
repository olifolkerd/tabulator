import { test, expect, Page } from "@playwright/test";
import { join } from "path";

// Remote sorting, filtering and pagination must keep the horizontal scroll
// position, as the same actions do in local mode.

const SCROLL_LEFT = 400;

async function scrollRight(page: Page) {
	await page.locator(".tabulator-tableholder").evaluate((holder, left) => {
		holder.scrollLeft = left;
	}, SCROLL_LEFT);
	await expect.poll(() => getScroll(page).then((scroll) => scroll.left)).toBe(SCROLL_LEFT);
}

async function getScroll(page: Page) {
	return page.locator(".tabulator-tableholder").evaluate((holder) => ({
		left: holder.scrollLeft,
		top: holder.scrollTop,
	}));
}

// Runs a table action and waits until the remote response has been rendered.
async function runRemoteAction(page: Page, action: string) {
	await page.evaluate(async (action) => {
		const table = (window as any).testTable;
		const loaded = new Promise((resolve) => table.on("dataProcessed", resolve));
		await new Function("table", action)(table);
		await loaded;
		await new Promise((resolve) => requestAnimationFrame(resolve));
	}, action);
}

test.describe("Remote mode scroll position", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "remote-scroll-position.html")}`);
		await page.waitForFunction(() => (window as any).testTable?.getDataCount() > 0);
		await scrollRight(page);
	});

	test("keeps the horizontal scroll position when sorting", async ({ page }) => {
		await runRemoteAction(page, `table.setSort("value", "desc");`);

		expect((await getScroll(page)).left).toBe(SCROLL_LEFT);
		expect(await page.evaluate(() => (window as any).testTable.getData()[0].value)).toBe(999);
	});

	test("keeps the horizontal scroll position when filtering", async ({ page }) => {
		await runRemoteAction(page, `table.setHeaderFilterValue("city", "Rome");`);

		expect((await getScroll(page)).left).toBe(SCROLL_LEFT);
		expect(await page.evaluate(() => (window as any).testTable.getData().every((row) => row.city === "Rome"))).toBe(true);
	});

	test("keeps the horizontal scroll position and scrolls to the top when changing page", async ({ page }) => {
		await page.locator(".tabulator-tableholder").evaluate((holder) => {
			holder.scrollTop = 200;
		});

		await runRemoteAction(page, `return table.setPage(2);`);

		const scroll = await getScroll(page);
		expect(scroll.left).toBe(SCROLL_LEFT);
		expect(scroll.top).toBe(0);
		expect(await page.evaluate(() => (window as any).testTable.getData()[0].id)).toBe(51);
	});
});
