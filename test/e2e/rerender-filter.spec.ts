import { test, expect, Page } from "@playwright/test";
import { join } from "path";

// Regression coverage for rerenderRows after a filter (blank strip).
//
// rerenderRows scanned the PRE-filter vDomTop..vDomBottom window for an anchor
// row, then filled against the POST-filter rows. When the pre-filter window
// pointed past the new (smaller) row count, the stale topOffset inflated
// vDomTopPad into a blank strip across the top. Separately, the position branch
// of _virtualRenderFill derived vDomBottomPad from a stale vDomScrollHeight,
// leaving an inflated blank strip below the last row after the row count shrank.
//
// Metric: gap (px) from the top / bottom edge of the holder to the nearest
// rendered row. A large gap after filtering is the bug.

async function gaps(page: Page) {
	return page.evaluate(() => {
		const holder = document.querySelector(".tabulator-tableholder") as HTMLElement;
		const table = document.querySelector(".tabulator-table") as HTMLElement;
		const r = holder.getBoundingClientRect();
		const x = r.left + r.width / 2;
		const max = Math.min(r.height, 600);
		const scan = (fromTop: boolean) => {
			for (let d = 2; d < max; d += 6) {
				const y = fromTop ? r.top + d : r.bottom - d;
				const el = document.elementFromPoint(x, y) as HTMLElement | null;
				if (el && el.closest && el.closest(".tabulator-row")) return Math.max(0, d - 2);
			}
			return max;
		};
		return {
			topGap: scan(true),
			bottomGap: scan(false),
			paddingTop: parseFloat(table.style.paddingTop) || 0,
		};
	});
}

test.describe("rerenderRows after filter does not leave a blank strip", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "rerender-filter.html")}`);
		await page.waitForSelector(".tabulator-tableholder");
	});

	test("filtering a long list down to a short one keeps content flush", async ({ page }) => {
		// Scroll to the middle so the pre-filter window is deep in the list.
		await page.locator(".tabulator-tableholder").evaluate((h) => {
			h.scrollTop = Math.round((h.scrollHeight - h.clientHeight) / 2);
			h.dispatchEvent(new Event("scroll"));
		});
		await page.waitForTimeout(80);

		// Filter 2000 -> ~50 rows.
		await page.evaluate(() => {
			// @ts-expect-error test global
			window.testTable.setFilter("cat", "=", "rare");
		});
		await page.waitForTimeout(120);

		const g = await gaps(page);
		expect(g.topGap).toBeLessThanOrEqual(6);
		expect(g.paddingTop).toBeLessThanOrEqual(6);
		expect(g.bottomGap).toBeLessThanOrEqual(6);
	});
});
