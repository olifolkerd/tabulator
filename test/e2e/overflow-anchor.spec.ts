import { test, expect } from "@playwright/test";
import { join } from "path";

// Regression coverage for disabling browser scroll anchoring on the table
// holder. The virtual renderer manages scrollTop/padding itself; Chrome's
// scroll anchoring double-compensates when rows are inserted above the
// viewport, causing drift on scroll-up. The fix sets overflow-anchor:none on
// .tabulator-tableholder. This guards that the rule survives in the built CSS
// and is applied by the browser.
test.describe("table holder disables browser scroll anchoring", () => {
	test("computed overflow-anchor is none", async ({ page }) => {
		await page.goto(`file://${join(__dirname, "scroll-jump.html")}`);
		await page.waitForSelector(".tabulator-tableholder");

		const value = await page
			.locator(".tabulator-tableholder")
			.evaluate((el) => getComputedStyle(el).overflowAnchor);

		expect(value).toBe("none");
	});
});
