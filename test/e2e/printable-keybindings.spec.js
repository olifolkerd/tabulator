import { test, expect } from "@playwright/test";
import { join } from "path";
import { pathToFileURL } from "url";

test.beforeEach(async({page}) => {
	await page.goto(pathToFileURL(join(__dirname, "printable-keybindings.html")).href);
	await page.locator(".tabulator-cell").first().click();
	await expect(page.locator(".tabulator-cell input")).toBeFocused();
});

// #4900: reproduce unshifted hash events from non-US layouts without changing the OS keyboard.
for(const keyCode of [191, 222]){
	test(`unshifted hash (${keyCode}) leaves the editor active`, async({page}) => {
		const input = page.locator(".tabulator-cell input");
		const prevented = await input.evaluate((element, keyCode) => {
			const event = new KeyboardEvent("keydown", {key: "#", keyCode, bubbles: true, cancelable: true});
			element.dispatchEvent(event);
			return event.defaultPrevented;
		}, keyCode);
		expect(prevented).toBe(false);
		await expect(input).toBeFocused();
		await input.press("End");
		await input.press("#");
		await expect(input).toHaveValue("text#");
		await input.press("Enter");
		await expect(page.locator(".tabulator-cell").first()).toHaveText("text#");
	});
}

test("End still scrolls the table outside the editor", async({page}) => {
	await page.locator(".tabulator-cell input").press("Escape");
	await page.locator("#table").focus();
	await page.locator("#table").press("End");
	await expect.poll(() => page.locator(".tabulator-tableholder").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});
