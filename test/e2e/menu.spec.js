import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Context menu viewport bounds", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`file://${join(__dirname, "menu.html")}`);
		await page.waitForSelector(".tabulator-row");
	});

	const margin = 5;
	const positions = [
		{ name: "top-left", offsetX: margin, offsetY: 50 },
		{ name: "top-right", offsetX: -margin, offsetY: 50 },
		{ name: "bottom-left", offsetX: margin, offsetY: -margin },
		{ name: "bottom-right", offsetX: -margin, offsetY: -margin },
		{ name: "middle", offsetX: 0.5, offsetY: 0.5 },
	];

	for (const corner of positions) {
		test(`menu stays inside viewport when opened near ${corner.name}`, async ({ page }) => {
			const viewport = page.viewportSize();
			const resolve = (offset, size) => {
				if (offset > 0 && offset < 1) return Math.round(size * offset);
				return offset < 0 ? size + offset : offset;
			};
			const x = resolve(corner.offsetX, viewport.width);
			const y = resolve(corner.offsetY, viewport.height);

			await page.evaluate(({ x, y }) => {
				const el = document.elementFromPoint(x, y);
				el.dispatchEvent(new MouseEvent("contextmenu", {
					bubbles: true,
					cancelable: true,
					view: window,
					button: 2,
					clientX: x,
					clientY: y,
				}));
			}, { x, y });

			const menu = page.locator(".tabulator-menu");
			await expect(menu).toBeVisible();

			const box = await menu.boundingBox();
			expect(box).not.toBeNull();
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.y).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
			expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
		});
	}
});
