import { test, expect, Page } from "@playwright/test";
import { join } from "path";

const FIXTURE = `file://${join(__dirname, "basic-vertical.html")}`;
const TOLERANCE = 5;

async function openTable(page: Page, rendererType: "basic" | "virtual") {
	await page.goto(`${FIXTURE}?renderer-type=${rendererType}`);
	await page.waitForSelector(".tabulator-row");
}

async function scrollTo(page: Page, top: number) {
	await page.locator(".tabulator-tableholder").evaluate((h, top) => {
		h.scrollTop = top;
	}, top);
	await page.waitForTimeout(50);
}

async function getScrollTop(page: Page) {
	return await page
		.locator(".tabulator-tableholder")
		.evaluate((h) => h.scrollTop);
}

for (const rendererType of ["basic", "virtual"] as const) {
	test.describe(`${rendererType} renderer keeps its scroll position`, () => {
		test("appending rows in place does not scroll back to the top", async ({
			page,
		}) => {
			await openTable(page, rendererType);

			await scrollTo(page, 600);
			await expect(getScrollTop(page)).resolves.toBe(600);

			await page.evaluate(() =>
				window["table"].addData(window["generateData"](201, 50)),
			);
			await page.waitForTimeout(100);

			const scrollTop = await getScrollTop(page);
			expect(Math.abs(scrollTop - 600)).toBeLessThanOrEqual(TOLERANCE);
		});

		test("deleting a row below the viewport does not scroll back to the top", async ({
			page,
		}) => {
			await openTable(page, rendererType);

			await scrollTo(page, 600);
			await expect(getScrollTop(page)).resolves.toBe(600);

			await page.evaluate(() => window["table"].deleteRow(200));
			await page.waitForTimeout(100);

			const scrollTop = await getScrollTop(page);
			expect(Math.abs(scrollTop - 600)).toBeLessThanOrEqual(TOLERANCE);
		});
	});
}
