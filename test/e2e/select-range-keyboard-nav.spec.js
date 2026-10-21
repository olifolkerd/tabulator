// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

const fixture = `file://${join(__dirname, "select-range-keyboard-nav.html")}`;

function activePosition(page) {
	return page.evaluate(() => {
		const start = window.testTable.modules.selectRange.activeRange.start;
		return { row: start.row, col: start.col };
	});
}

function isEditing(page) {
	return page.evaluate(() => !!window.testTable.modules.edit.currentCell);
}

function cellValue(page, rowIndex, field) {
	return page.evaluate(
		(args) => window.testTable.getData()[args.rowIndex][args.field],
		{ rowIndex, field },
	);
}

function editor(page) {
	return page.locator(".tabulator-editing input, .tabulator-editing textarea");
}

test.describe("Select range Tab then Enter navigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(fixture);
		await page.waitForSelector(".tabulator-range-overlay");
	});

	test("should move to the next row at the column where tabbing started", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 2 });

		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(activePosition(page)).resolves.toEqual({ row: 1, col: 0 });
	});

	test("should return to the tab start column when tabbing while editing", async ({ page }) => {
		await page.keyboard.press("Enter");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 2 });

		await page.keyboard.press("Enter");

		await expect(activePosition(page)).resolves.toEqual({ row: 1, col: 0 });
	});

	test("should move straight down when another key broke the tab run", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("Tab");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 3 });

		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");

		await expect(activePosition(page)).resolves.toEqual({ row: 1, col: 2 });
	});

	test("should move straight down when nothing was tabbed", async ({ page }) => {
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");

		await expect(activePosition(page)).resolves.toEqual({ row: 1, col: 1 });
	});

	test("should move up to the tab start column on Shift+Enter", async ({ page }) => {
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");
		await page.keyboard.press("Shift+Enter");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 0 });
	});

	test("should commit a textarea with enterSubmit on Enter and move to the next row", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");

		await expect(editor(page)).toHaveJSProperty("tagName", "TEXTAREA");
		await editor(page).fill("changed");
		await page.keyboard.press("Enter");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(cellValue(page, 0, "d")).resolves.toBe("changed");
		await expect(activePosition(page)).resolves.toEqual({ row: 1, col: 0 });
	});

	test("should insert a newline in a textarea with altEnterNewLine on Alt+Enter", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");

		await editor(page).fill("ab");
		await editor(page).evaluate((el) => el.setSelectionRange(1, 1));
		await page.keyboard.press("Alt+Enter");

		await expect(editor(page)).toHaveValue("a\nb");
		await expect(isEditing(page)).resolves.toBe(true);
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 3 });
	});

	for (const modifier of ["Control", "Alt", "Meta"]) {
		test(`should not move when Enter is pressed with ${modifier}`, async ({ page }) => {
			await page.keyboard.press("Tab");
			await page.keyboard.press("Enter");
			await page.keyboard.press(`${modifier}+Enter`);

			await expect(isEditing(page)).resolves.toBe(false);
			await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 1 });
		});
	}
});

test.describe("Select range Tab with selectableRangeBlurEditOnNavigate", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${fixture}?blurEditOnNavigate`);
		await page.waitForSelector(".tabulator-range-overlay");
	});

	test("should cancel an input editor and move one cell on Tab", async ({ page }) => {
		await page.keyboard.press("Enter");
		await editor(page).fill("changed");
		await page.keyboard.press("Tab");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(cellValue(page, 0, "a")).resolves.toBe("a1");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 1 });
	});

	test("should cancel a textarea editor and move one cell left on Shift+Tab", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");
		await editor(page).fill("changed");
		await page.keyboard.press("Shift+Tab");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(cellValue(page, 0, "d")).resolves.toBe("d1");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 2 });
	});
});

test.describe("Select range Tab with selectableRangeCommitEditOnNavigate", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${fixture}?blurEditOnNavigate&commitEditOnNavigate`);
		await page.waitForSelector(".tabulator-range-overlay");
	});

	test("should commit an input editor and move one cell on Tab", async ({ page }) => {
		await page.keyboard.press("Enter");
		await editor(page).fill("changed");
		await page.keyboard.press("Tab");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(cellValue(page, 0, "a")).resolves.toBe("changed");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 1 });
	});

	test("should commit a textarea editor and move one cell left on Shift+Tab", async ({ page }) => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");
		await editor(page).fill("changed");
		await page.keyboard.press("Shift+Tab");

		await expect(isEditing(page)).resolves.toBe(false);
		await expect(cellValue(page, 0, "d")).resolves.toBe("changed");
		await expect(activePosition(page)).resolves.toEqual({ row: 0, col: 2 });
	});
});
