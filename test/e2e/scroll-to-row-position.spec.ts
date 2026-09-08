import { test, expect, Page } from "@playwright/test";
import { join } from "path";

// Regression coverage for scrollToRowPosition alignment.
//
// After scrollToRow(row) fills the virtual DOM, the target row is in the window
// but NOT necessarily at the top. The old center/bottom math derived the offset
// from the current scrollTop (assuming top placement), so for rows deep in the
// list it scrolled the wrong distance — the row could land far from the
// requested position or detach entirely. The fix reads the row's actual
// offsetTop. It also syncs vDomScrollPosTop/Bottom so a following user scroll
// doesn't see a stale tracker and jump.
//
// Metric: distance (px) between where the target row landed and where the
// requested position wants it. Lower is better; a large reading is the bug.

// A row near the bottom of the list: after scrollToRow fills the window it
// cannot sit at the window top (not enough rows below it), so the old math that
// assumed top placement misaligns it — the documented trigger.
const TARGET_ID = 1490;

async function landingMiss(page: Page, position: "top" | "center" | "bottom") {
	await page.evaluate(
		async ({ id, position }) => {
			// @ts-expect-error test global
			await window.testTable.scrollToRow(id, position, true);
		},
		{ id: TARGET_ID, position },
	);
	await page.waitForTimeout(80);

	return page.evaluate(
		({ id, position }) => {
			const holder = document.querySelector(".tabulator-tableholder") as HTMLElement;
			const rows = [...holder.querySelectorAll(".tabulator-row")];
			const target = rows.find((r) => {
				const cell = r.querySelector(".tabulator-cell");
				return cell && cell.textContent === String(id);
			});
			if (!target) {
				return { found: false as const };
			}
			const rr = target.getBoundingClientRect();
			const hr = holder.getBoundingClientRect();
			let miss: number;
			if (position === "center") {
				miss = Math.abs(rr.top + rr.height / 2 - (hr.top + hr.height / 2));
			} else if (position === "bottom") {
				miss = Math.abs(rr.bottom - hr.bottom);
			} else {
				miss = Math.abs(rr.top - hr.top);
			}
			return { found: true as const, miss: Math.round(miss) };
		},
		{ id: TARGET_ID, position },
	);
}

test.describe("scrollToRow position alignment", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "scroll-to-row-position.html")}`);
		await page.waitForSelector(".tabulator-tableholder");
	});

	for (const position of ["top", "center", "bottom"] as const) {
		test(`scrollToRow lands the target at ${position}`, async ({ page }) => {
			const res = await landingMiss(page, position);
			expect(res.found).toBe(true);
			// The target row (id 750 of 1500, variable heights) must land within a
			// row-height of the requested position.
			expect(res.miss).toBeLessThanOrEqual(6);
		});
	}
});
