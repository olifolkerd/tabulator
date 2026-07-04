// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

// Regression test for https://github.com/tabulator-tables/tabulator/issues/4871
//
// PR #4809 removed the <br> separator between the column headers and the
// inline-block frozen-rows-holder, which caused the holder to collapse next
// to the headers. The visible symptom is that scrolling the table body no
// longer leaves the frozen row pinned at the top. Layout is a real-browser
// concern, so this lives in Playwright rather than jsdom.
test.describe("Frozen rows (#4871)", () => {
	test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "frozen-rows.html");
		await page.goto(`file://${htmlPath}`);
		await page.waitForSelector(".tabulator-frozen-rows-holder .tabulator-row");
	});

	test("the frozen row is laid out above the body and stays pinned when the body is scrolled", async ({ page }) => {
		const frozenRow = page.locator(".tabulator-frozen-rows-holder .tabulator-row").first();
		const tableHolder = page.locator(".tabulator-tableholder");
		const header = page.locator(".tabulator-header");

		const rects = async () => ({
			frozen: await frozenRow.evaluate(el => el.getBoundingClientRect().toJSON()),
			holder: await tableHolder.evaluate(el => el.getBoundingClientRect().toJSON()),
			header: await header.evaluate(el => el.getBoundingClientRect().toJSON()),
		});

		const before = await rects();

		// The visible regression in #4871: with the <br> removed, the inline-block
		// frozen-rows-holder is placed to the right of the inline-block headers
		// instead of on its own line below them, and gets clipped by the header's
		// overflow:hidden. Assert the frozen row is actually in the visible table
		// column (left edge aligned with the body) rather than pushed off to the side.
		expect(Math.abs(before.frozen.left - before.holder.left)).toBeLessThan(5);
		// And that it sits between the column headers and the scrollable body.
		expect(before.frozen.top).toBeGreaterThanOrEqual(before.header.top - 1);
		expect(before.frozen.bottom).toBeLessThanOrEqual(before.holder.top + 2);

		// Snapshot a body row by text so we can verify it moves on scroll.
		const sampleText = await page.evaluate(() => {
			const rows = document.querySelectorAll(".tabulator-tableholder .tabulator-row");
			return rows[rows.length - 1].textContent;
		});
		const bodyRowTop = (text) => page.evaluate((t) => {
			const rows = document.querySelectorAll(".tabulator-tableholder .tabulator-row");
			for (const r of rows) {
				if (r.textContent === t) return r.getBoundingClientRect().top;
			}
			return null;
		}, text);
		const bodyTopBefore = await bodyRowTop(sampleText);
		expect(bodyTopBefore).not.toBeNull();

		await tableHolder.evaluate(el => { el.scrollTop = 500; });
		await page.waitForTimeout(100);

		const scrollTop = await tableHolder.evaluate(el => el.scrollTop);
		expect(scrollTop).toBeGreaterThan(0);

		const bodyTopAfter = await bodyRowTop(sampleText);
		expect(bodyTopAfter).not.toBeNull();
		// Sanity: the body actually scrolled.
		expect(bodyTopAfter).toBeLessThan(bodyTopBefore);

		const after = await rects();
		// The frozen row's screen position must not change when the body scrolls.
		expect(Math.abs(after.frozen.top - before.frozen.top)).toBeLessThan(2);
		expect(Math.abs(after.frozen.left - before.frozen.left)).toBeLessThan(2);
		// And it must still sit above the scrollable body after scrolling.
		expect(after.frozen.bottom).toBeLessThanOrEqual(after.holder.top + 2);
	});
});
