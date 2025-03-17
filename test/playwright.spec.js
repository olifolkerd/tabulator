// @ts-check
const { test, expect } = require('@playwright/test');

// Single test file for Tabulator functionality
test.describe('Tabulator Functionality Tests', () => {
  // Setup - navigate to the test page before each test
  test.beforeEach(async ({ page }) => {
    // Open the test page directly from filesystem instead of using a server
    await page.goto('file://' + __dirname + '/index.html');
    
    // Wait for the Tabulator to initialize
    await page.waitForSelector('.tabulator-tableHolder');
  });

  // Test table initialization
  test('should initialize the table', async ({ page }) => {
    // Check if table exists
    const tableExists = await page.isVisible('.tabulator');
    expect(tableExists).toBeTruthy();
    
    // Check initial row count
    const rowCount = await page.locator('.tabulator-row').count();
    expect(rowCount).toBe(5);
  });

  // Test filtering
  test('should filter rows', async ({ page }) => {
    // Apply filter for female rows
    await page.evaluate(() => {
      window.testTable.setFilter("gender", "=", "Female");
    });
    
    // Wait for filter to apply
    await page.waitForTimeout(300);
    
    // Check filtered row count
    const rowCount = await page.locator('.tabulator-row').count();
    expect(rowCount).toBe(2);
    
    // Reset filter
    await page.evaluate(() => {
      window.testTable.clearFilter();
    });
  });

  // Test sorting
  test('should sort rows', async ({ page }) => {
    // Apply sort by age descending
    await page.evaluate(() => {
      window.testTable.setSort("age", "desc");
    });
    
    // Wait for sort to apply
    await page.waitForTimeout(300);
    
    // Check first row has highest age (Charlie, age 45)
    const firstRowAge = await page.evaluate(() => {
      const row = window.testTable.getRows()[0];
      return row.getData().age;
    });
    
    expect(firstRowAge).toBe(45);
  });

  // Test adding a row
  test('should add a new row', async ({ page }) => {
    // Initial row count
    const initialCount = await page.locator('.tabulator-row').count();
    
    // Add new row
    await page.evaluate(() => {
      window.testTable.addRow({
        id: 6, name: "Frank", age: 29, gender: "Male", 
        height: 182, progress: 55, color: "purple"
      });
    });
    
    // Wait for row to be added
    await page.waitForTimeout(300);
    
    // Check new row count
    const newCount = await page.locator('.tabulator-row').count();
    expect(newCount).toBe(initialCount + 1);
  });

  // Test updating a row
  test('should update a row', async ({ page }) => {
    // Update row with ID 1
    await page.evaluate(() => {
      window.testTable.updateRow(1, {name: "Alice Updated"});
    });
    
    // Wait for update to apply
    await page.waitForTimeout(300);
    
    // Verify update
    const updatedName = await page.evaluate(() => {
      return window.testTable.getRow(1).getData().name;
    });
    
    expect(updatedName).toBe("Alice Updated");
  });

  // Test deleting a row
  test('should delete a row', async ({ page }) => {
    // Initial row count
    const initialCount = await page.locator('.tabulator-row').count();
    
    // Delete row with ID 1
    await page.evaluate(() => {
      window.testTable.deleteRow(1);
    });
    
    // Wait for deletion to complete
    await page.waitForTimeout(300);
    
    // Check new row count
    const newCount = await page.locator('.tabulator-row').count();
    expect(newCount).toBe(initialCount - 1);
  });
});