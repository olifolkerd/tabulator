import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Select range tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "select-range.html")}`);
		await page.waitForSelector(".tabulator-range-overlay");
	});

	test("Pressing `enter` should trigger editing", async ({ page }) => {
		// We should not see any input elements yet
		await expect(page.locator("input")).toBeHidden();

		await page.locator("#test-table").press("Enter");

		await expect(page.locator("input")).toBeVisible();
		await expect(page.locator("input")).toBeFocused();
	});
});
