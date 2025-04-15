// @ts-check
import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Tabulator functionality", () => {
    test.beforeEach(async ({ page }) => {
		const htmlPath = join(__dirname, "index.html");
        await page.goto(`file://${htmlPath}`);
        await page.waitForSelector(".tabulator");
    });

    test("should initialize table correctly", async ({ page }) => {
        // Check that table is initialized
        const tableExists = await page.isVisible(".tabulator");
        expect(tableExists).toBeTruthy();
        
        // Check row count
        await page.waitForSelector(".tabulator-row");
        const rowCount = await page.locator(".tabulator-row").count();
        expect(rowCount).toBe(5);
        
        // Check column count
        const columnCount = await page.locator(".tabulator-col").count();
        expect(columnCount).toBe(4);
    });

    test.describe("Row operations", () => {
        test("should add a new row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.addRow({
                    id: 6,
                    name: "Frank",
                    age: 29,
                    gender: "Male",
                });
            });
            await page.waitForTimeout(300);
    
            const newRowCount = await page.locator(".tabulator-row").count();
            expect(newRowCount).toBe(6);
        });
        
        test("should update an existing row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.updateRow(1, { name: "Alice Updated" });
            });
            await page.waitForTimeout(300);
    
            const updatedName = await page.evaluate(() => {
                return window.testTable.getRow(1).getData().name;
            });
    
            expect(updatedName).toBe("Alice Updated");
        });
        
        test("should delete a row", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.deleteRow(1);
            });
            await page.waitForTimeout(300);
    
            const finalRowCount = await page.locator(".tabulator-row").count();
            expect(finalRowCount).toBe(4); // Original count minus one
        });
    });

    test.describe("Filtering functionality", () => {
        test("should filter rows by gender", async ({ page }) => {
            await page.evaluate(() => {
                window.testTable.setFilter("gender", "=", "Female");
            });
            await page.waitForTimeout(300);
    
            const filteredRowCount = await page.locator(".tabulator-row").count();
            expect(filteredRowCount).toBe(2); // 2 females in our data
        });
        
        test("should clear filters", async ({ page }) => {
            // First apply a filter
            await page.evaluate(() => {
                window.testTable.setFilter("gender", "=", "Female");
            });
            await page.waitForTimeout(300);
            
            // Then clear it
            await page.evaluate(() => {
                window.testTable.clearFilter();
            });
            await page.waitForTimeout(300);
    
            const rowCountAfterClearingFilter = await page
                .locator(".tabulator-row")
                .count();
            expect(rowCountAfterClearingFilter).toBe(5); // Back to original count
        });
    });
});
