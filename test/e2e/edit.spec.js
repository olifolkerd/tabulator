// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

/**
 * End to end coverage for https://github.com/tabulator-tables/tabulator/issues/4716
 *
 * Tabbing along a row of editable cells used to activate only every other
 * editor, because Edit.edit() bailed out whenever another cell was still open.
 */
test.describe("Editing adjacent cells", () => {
	test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "edit.html");

		await page.goto(`file://${htmlPath}`);
		await page.waitForSelector(".tabulator-row");
	});

	const cell = (page, row, field) => page.locator(`.tabulator-row`).nth(row).locator(`.tabulator-cell[tabulator-field="${field}"]`);

	test("activates the editor on every cell tabbed into", async ({ page }) => {
		const name = cell(page, 0, "name");
		const age = cell(page, 0, "age");
		const city = cell(page, 0, "city");

		await name.click();
		await expect(name).toHaveClass(/tabulator-editing/);

		await page.keyboard.press("Tab");
		await expect(age).toHaveClass(/tabulator-editing/);
		await expect(age.locator("input[data-passive-editor]")).toBeVisible();

		await page.keyboard.press("Tab");
		await expect(city).toHaveClass(/tabulator-editing/);
		await expect(city.locator("input[data-passive-editor]")).toBeVisible();
	});

	test("closes the editor on the cell left behind", async ({ page }) => {
		const name = cell(page, 0, "name");
		const age = cell(page, 0, "age");

		await name.click();
		await expect(name).toHaveClass(/tabulator-editing/);

		await page.keyboard.press("Tab");

		await expect(name).not.toHaveClass(/tabulator-editing/);
		await expect(name.locator("input[data-passive-editor]")).toHaveCount(0);
		await expect(age).toHaveClass(/tabulator-editing/);
	});

	test("wraps onto the next row and keeps activating editors", async ({ page }) => {
		await cell(page, 0, "city").click();
		await expect(cell(page, 0, "city")).toHaveClass(/tabulator-editing/);

		await page.keyboard.press("Tab");
		await expect(cell(page, 0, "code")).toHaveClass(/tabulator-editing/);

		await page.keyboard.press("Tab");
		await expect(cell(page, 1, "name")).toHaveClass(/tabulator-editing/);

		await page.keyboard.press("Tab");
		await expect(cell(page, 1, "age")).toHaveClass(/tabulator-editing/);
	});
});

test.describe("Editor hand off", () => {
	test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "edit.html");

		await page.goto(`file://${htmlPath}`);
		await page.waitForSelector(".tabulator-row");
	});

	test("holds focus on a cell that failed validation", async ({ page }) => {
		const code = page.locator(".tabulator-row").nth(0).locator('.tabulator-cell[tabulator-field="code"]');
		const name = page.locator(".tabulator-row").nth(1).locator('.tabulator-cell[tabulator-field="name"]');

		await code.click();
		await expect(code).toHaveClass(/tabulator-editing/);

		await code.locator("input").fill("");
		await page.keyboard.press("Tab");

		await expect(code).toHaveClass(/tabulator-validation-fail/);
		await expect(code).toHaveClass(/tabulator-editing/);
		await expect(name).not.toHaveClass(/tabulator-editing/);
	});
});
