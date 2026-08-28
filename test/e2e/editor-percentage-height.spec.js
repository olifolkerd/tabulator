// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

// Regression test for https://github.com/tabulator-tables/tabulator/issues/4142
// "Text area unclickable when tabulator height set to a percentage"
//
// When the table height is a percentage, clicking a cell with a "textarea"
// editor triggers a ResizeObserver feedback loop. The row height normalisation
// performed while opening the editor resizes the table, which re-renders the
// rows and immediately tears the editor back down, so the textarea never
// becomes usable.

test.describe("Issue 4142 - textarea editor with percentage table height", () => {
    test.beforeEach(async ({ page }) => {
        const htmlPath = join(__dirname, "editor-percentage-height.html");
        await page.goto(`file://${htmlPath}`);
        await page.waitForSelector(".tabulator-row");
    });

    test("opens and keeps a usable textarea editor when clicking the cell", async ({ page }) => {
        const cell = page.locator(".tabulator-cell[tabulator-field='info']").first();

        // Click the cell to start editing (default editTriggerEvent is "focus").
        await cell.click();

        // Give any resize/redraw loop a chance to settle.
        await page.waitForTimeout(500);

        const editor = cell.locator("textarea");

        // The editor textarea should exist, be visible and be the focused element
        // so the user can actually type into it.
        await expect(editor).toBeVisible();

        const isFocused = await editor.evaluate(
            (el) => el === document.activeElement,
        );
        expect(isFocused).toBe(true);

        // The cell should be in editing mode.
        await expect(cell).toHaveClass(/tabulator-editing/);

        // And typing should actually update the editor value.
        await editor.fill("Edited text");
        await expect(editor).toHaveValue("Edited text");
    });
});
