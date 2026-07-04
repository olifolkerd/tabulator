// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Issue 4142 - resize during edit: keep editor, then relayout", () => {
	test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "resize-table.html");
		await page.goto(`file://${htmlPath}`);
		await page.waitForSelector(".tabulator-row");
	});

	test("editor survives a resize during edit and columns re-fit once editing ends", async ({
		page,
	}) => {
		const header = page.locator(".tabulator-col[tabulator-field='name']");

		const widthBefore = await test.step("Verify that the Name column is in good shape", async () => {
			const width = (await header.boundingBox())?.width ?? 0;
			expect(width).toBeGreaterThan(0);
			return width;
		});

		const { cell, editor } =
			await test.step("Open the input editor on a Name cell", async () => {
				const cell = page
					.locator(".tabulator-cell[tabulator-field='name']")
					.first();
				await cell.click();
				const editor = cell.locator("input");
				await expect(editor).toBeVisible();
				await expect(cell).toHaveClass(/tabulator-editing/);
				return { cell, editor };
			});

		await test.step("Shrink the table container by half WHILE the editor is open", async () => {
			await page.locator("#wrapper").evaluate((el) => {
				el.style.width = 400 + "px";
			});
			// Let the ResizeObserver fire.
			await page.waitForTimeout(300);
		});

		const widthAfter =
			await test.step("Verify columns re-fit to the narrower container", async () => {
				const width = (await header.boundingBox())?.width ?? 0;
				expect(width).toBeLessThan(widthBefore * 0.8);
				return width;
			});

		await test.step("Verify the editor is still open, visible and usable mid-edit", async () => {
			await expect(editor).toBeVisible();
			await expect(cell).toHaveClass(/tabulator-editing/);
			await editor.fill("still editable");
			await expect(editor).toHaveValue("still editable");
		});

		await test.step("End the edit", async () => {
			await editor.press("Enter");
			await page.waitForTimeout(300);
			await expect(cell.locator("input")).toHaveCount(0);
		});

		await test.step("Verify columns width are still the same now that editing has ended. ", async () => {
			const width = (await header.boundingBox())?.width ?? 0;
			expect(width).toBeCloseTo(widthAfter);
		});
	});
});
