import { test, expect } from "@playwright/test";
import { join } from "path";

const holderSel = ".tabulator-tableholder";

// - #4219 (cannot scroll to the bottom)
// - #4525 (expanding a group resets the scroll position)
test.describe("Grouped table virtual scrolling (#4219, #4525)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "group-scroll.html")}`);
		await page.waitForSelector(".tabulator-row");
		// position the pointer over the table so wheel events scroll it
		await page.locator(holderSel).hover();
	});

	async function atBottom(page) {
		return page.evaluate((sel) => {
			const holder = document.querySelector(sel);
			return holder.scrollTop >= holder.scrollHeight - holder.clientHeight - 1;
		}, holderSel);
	}

	test("scrolls to the bottom through many collapsed groups (#4219)", async ({
		page,
	}) => {
		// Scroll down with the mouse wheel until we reach the bottom or give up.
		for (let i = 0; i < 250; i++) {
			if (await atBottom(page)) {
				break;
			}
			await page.mouse.wheel(0, 300);
			await page.waitForTimeout(12);
		}

		const result = await page.evaluate((sel) => {
			const holder = document.querySelector(sel);
			return {
				scrollTop: holder.scrollTop,
				maxScroll: holder.scrollHeight - holder.clientHeight,
			};
		}, holderSel);

		// Before the fix the view snapped back to the top after a few hundred
		// pixels and never reached the bottom of a ~25,000px tall table.
		expect(result.scrollTop).toBeGreaterThan(result.maxScroll * 0.9);
	});

	test("expanding a group below the fold keeps the scroll position (#4525)", async ({
		page,
	}) => {
		// Wheel into the middle of the table, away from the top.
		for (let i = 0; i < 45; i++) {
			await page.mouse.wheel(0, 300);
			await page.waitForTimeout(12);
		}
		await page.waitForTimeout(150);

		const result = await page.evaluate((sel) => {
			const holder = document.querySelector(sel);
			const before = holder.scrollTop;

			const groups = window.testTable.getGroups();
			groups[Math.floor(groups.length / 2) + 2].toggle();

			return new Promise((resolve) => {
				setTimeout(() => resolve({ before, after: holder.scrollTop }), 200);
			});
		}, holderSel);

		// Before the fix expanding a group reset the scroll position to 0.
		expect(result.before).toBeGreaterThan(0);
		expect(result.after).toBeGreaterThan(result.before * 0.8);
	});

	test("should not shrink group rows and their content horizontally when scrolling down (#4877)", async ({ page }) => {
		const borderOffset = 2;

		await page.evaluate(() => window.testTable.getGroups()[0].toggle());
		await page.waitForTimeout(200);

		await page.mouse.wheel(0, 400);
		await page.waitForTimeout(200);

		const [tableWidth, groupWidth] = await page.evaluate(() => [
			window.testTable.element.offsetWidth,
			window.testTable.getGroups()[18].getElement().offsetWidth,
		]);
		expect(groupWidth).toBe(tableWidth - borderOffset);
	});
});
