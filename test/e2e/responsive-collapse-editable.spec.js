// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Editing collapsed responsive columns", () => {
	test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "responsive-collapse-editable.html");

		// wide enough for every column, so each test narrows to the width it wants
		await page.setViewportSize({ width: 1100, height: 600 });
		await page.goto(`file://${htmlPath}`);
		await page.waitForSelector(".tabulator-row");
	});

	const row = (page, index) => page.locator(".tabulator-row").nth(index);
	const cell = (page, index, field) => row(page, index).locator(`.tabulator-cell[tabulator-field="${field}"]`);
	const collapse = (page, index) => row(page, index).locator(".tabulator-responsive-collapse");

	// the label cell that formatCollapsedData puts beside the relocated cell
	const label = (page, index, field) => collapse(page, index)
		.locator("tr", { has: page.locator(`.tabulator-cell[tabulator-field="${field}"]`) })
		.locator("td")
		.first();

	// narrow the table until the responsive loop folds the low priority columns
	const narrow = async (page) => {
		await page.setViewportSize({ width: 420, height: 600 });
		await expect(collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]')).toBeVisible();
	};

	test("folds low priority columns into the collapse container as the table narrows", async ({ page }) => {
		// wide: every cell sits in the row itself
		await expect(cell(page, 0, "city")).toBeVisible();
		await expect(collapse(page, 0).locator(".tabulator-cell")).toHaveCount(0);

		await narrow(page);

		// the relocated cells are the real ones, still carrying their field attribute
		await expect(collapse(page, 0).locator(".tabulator-cell")).not.toHaveCount(0);
		await expect(collapse(page, 0).locator('.tabulator-cell[tabulator-field="code"]')).toBeVisible();
		await expect(cell(page, 0, "name")).toBeVisible();
	});

	test("gives the relocated cell the full width of its row in the block", async ({ page }) => {
		await narrow(page);

		// the layout re-applies the column's inline width on every pass, so the
		// stylesheet is what hands the cell the width of its container.
		// measured against the wrapping div, not the td: the td carries 2px of UA
		// padding, so its border box is not what a width:100% child resolves against
		for(const field of ["age", "city", "code"]){
			const cell = collapse(page, 0).locator(`.tabulator-cell[tabulator-field="${field}"]`);
			const cellBox = await cell.boundingBox();
			const hostBox = await cell.locator("xpath=..").boundingBox();

			expect(cellBox).not.toBeNull();
			expect(hostBox).not.toBeNull();
			expect(Math.abs(cellBox.width - hostBox.width)).toBeLessThanOrEqual(1);

			// and the inline column width really is being overridden, not absent
			expect(await cell.evaluate(el => el.style.width)).not.toBe("");
		}
	});

	test("edits a collapsed field and commits through cellEdited", async ({ page }) => {
		await narrow(page);

		const city = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');

		await city.click();
		await expect(city).toHaveClass(/tabulator-editing/);

		const input = city.locator("input");

		await expect(input).toBeVisible();
		await input.fill("Boston");
		await input.press("Enter");

		await expect(city).not.toHaveClass(/tabulator-editing/);
		await expect(city).toHaveText("Boston");

		expect(await page.evaluate(() => window.edits)).toEqual([{ field: "city", value: "Boston" }]);
		expect(await page.evaluate(() => window.testTable.getData()[0].city)).toBe("Boston");
	});

	test("keeps the field label beside the editor while it is open", async ({ page }) => {
		await narrow(page);

		const city = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');
		const cityLabel = label(page, 0, "city");

		await expect(cityLabel).toHaveText("City");

		await city.click();
		await expect(city.locator("input")).toBeVisible();

		// the label has to stay put, and stay to the left of the editor
		await expect(cityLabel).toBeVisible();
		await expect(cityLabel).toHaveText("City");

		const labelBox = await cityLabel.boundingBox();
		const inputBox = await city.locator("input").boundingBox();

		expect(labelBox).not.toBeNull();
		expect(inputBox).not.toBeNull();
		expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(inputBox.x + 1);
	});

	test("holds the editor open when the validator fails", async ({ page }) => {
		await narrow(page);

		const code = collapse(page, 0).locator('.tabulator-cell[tabulator-field="code"]');

		await code.click();

		const input = code.locator("input");

		await input.fill("");
		await input.press("Enter");

		await expect(code).toHaveClass(/tabulator-editing/);
		await expect(code).toHaveClass(/tabulator-validation-fail/);
		expect(await page.evaluate(() => window.edits)).toEqual([]);
		expect(await page.evaluate(() => window.testTable.getData()[0].code)).toBe("AA");
	});

	test("cancels a collapsed edit on Escape", async ({ page }) => {
		await narrow(page);

		const city = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');

		await city.click();
		await city.locator("input").fill("Nowhere");
		await city.locator("input").press("Escape");

		await expect(city).not.toHaveClass(/tabulator-editing/);
		await expect(city).toHaveText("New York");
		expect(await page.evaluate(() => window.cancels)).toContain("city");
		expect(await page.evaluate(() => window.edits)).toEqual([]);
	});

	test("closes the collapsed block, and the editor with it", async ({ page }) => {
		await narrow(page);

		const city = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');

		await city.click();
		await expect(city).toHaveClass(/tabulator-editing/);

		await row(page, 0).locator(".tabulator-responsive-collapse-toggle").click();

		await expect(collapse(page, 0)).toBeHidden();
		await expect(city).not.toHaveClass(/tabulator-editing/);
		expect(await page.evaluate(() => window.cancels)).toContain("city");
	});

	test("reopens the collapsed block and edits again", async ({ page }) => {
		await narrow(page);

		const toggle = row(page, 0).locator(".tabulator-responsive-collapse-toggle");

		await toggle.click();
		await expect(collapse(page, 0)).toBeHidden();

		await toggle.click();
		await expect(collapse(page, 0)).toBeVisible();

		const city = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');

		await city.click();
		await city.locator("input").fill("Denver");
		await city.locator("input").press("Enter");

		await expect(city).toHaveText("Denver");
		expect(await page.evaluate(() => window.edits)).toEqual([{ field: "city", value: "Denver" }]);
	});

	test("returns the cell to its column when the table widens again", async ({ page }) => {
		await narrow(page);

		// edit while collapsed, then widen: the value has to survive the move back
		const collapsedCity = collapse(page, 0).locator('.tabulator-cell[tabulator-field="city"]');

		await collapsedCity.click();
		await collapsedCity.locator("input").fill("Austin");
		await collapsedCity.locator("input").press("Enter");

		await page.setViewportSize({ width: 1100, height: 600 });

		await expect(collapse(page, 0).locator(".tabulator-cell")).toHaveCount(0);
		await expect(cell(page, 0, "city")).toBeVisible();
		await expect(cell(page, 0, "city")).toHaveText("Austin");

		// and it is editable in its column, as any other cell
		await cell(page, 0, "city").click();
		await expect(cell(page, 0, "city")).toHaveClass(/tabulator-editing/);
	});

	test("puts the cells back in column order after a fold and unfold", async ({ page }) => {
		await narrow(page);
		await page.setViewportSize({ width: 1100, height: 600 });

		await expect(collapse(page, 0).locator(".tabulator-cell")).toHaveCount(0);

		const fields = await row(page, 0).locator(".tabulator-cell").evaluateAll(
			els => els.map(el => el.getAttribute("tabulator-field"))
		);

		expect(fields).toEqual([null, "id", "name", "age", "city", "code"]);

		// the collapse container stays the row's last child
		const lastIsCollapse = await row(page, 0).evaluate(
			el => el.lastElementChild.classList.contains("tabulator-responsive-collapse")
		);

		expect(lastIsCollapse).toBe(true);
	});

	test("edits collapsed fields on more than one row", async ({ page }) => {
		await narrow(page);

		for(const [index, value] of [[0, "Boston"], [1, "Dallas"]]){
			const city = collapse(page, Number(index)).locator('.tabulator-cell[tabulator-field="city"]');

			await city.click();
			await city.locator("input").fill(String(value));
			await city.locator("input").press("Enter");

			await expect(city).toHaveText(String(value));
		}

		expect(await page.evaluate(() => window.testTable.getData().map(r => r.city))).toEqual(["Boston", "Dallas"]);
	});
});
