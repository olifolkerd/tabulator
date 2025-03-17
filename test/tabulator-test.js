// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Single test file that loads the HTML directly and tests basic Tabulator functionality
test('Tabulator basic functionality', async ({ page }) => {
  // Create an HTML file with embedded test content
  const tempHtmlPath = path.join(__dirname, 'temp-test.html');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Tabulator Test</title>
        <link rel="stylesheet" href="../dist/css/tabulator.min.css">
        <script src="../dist/js/tabulator.js"></script>
        <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            #test-table { width: 100%; height: 400px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <h1>Tabulator Test</h1>
        <div id="test-table"></div>
        
        <script>
            // Initialize table with test data
            document.addEventListener('DOMContentLoaded', function() {
                const testData = [
                    {id: 1, name: "Alice", age: 25, gender: "Female"},
                    {id: 2, name: "Bob", age: 32, gender: "Male"},
                    {id: 3, name: "Charlie", age: 45, gender: "Male"},
                    {id: 4, name: "Diana", age: 27, gender: "Female"},
                    {id: 5, name: "Ethan", age: 35, gender: "Male"}
                ];
                
                const columns = [
                    {title: "ID", field: "id", sorter: "number"},
                    {title: "Name", field: "name", sorter: "string"},
                    {title: "Age", field: "age", sorter: "number"},
                    {title: "Gender", field: "gender", sorter: "string"}
                ];
                
                // Create global reference for tests to access
                window.testTable = new Tabulator("#test-table", {
                    data: testData,
                    columns: columns,
                    layout: "fitColumns"
                });
            });
        </script>
    </body>
    </html>
  `;
  
  // Write the HTML file
  fs.writeFileSync(tempHtmlPath, htmlContent);
  
  try {
    // Open the HTML file directly (file:// protocol)
    await page.goto(`file://${tempHtmlPath}`);
    
    // Wait for the table to initialize
    await page.waitForSelector('.tabulator');
    
    // Test 1: Check that table is initialized
    const tableExists = await page.isVisible('.tabulator');
    expect(tableExists).toBeTruthy();
    console.log('✅ Table initialized successfully');
    
    // Test 2: Check row count
    await page.waitForSelector('.tabulator-row');
    const rowCount = await page.locator('.tabulator-row').count();
    expect(rowCount).toBe(5);
    console.log('✅ Row count verified');
    
    // Test 3: Add a row
    await page.evaluate(() => {
      window.testTable.addRow({id: 6, name: "Frank", age: 29, gender: "Male"});
    });
    await page.waitForTimeout(300);
    
    const newRowCount = await page.locator('.tabulator-row').count();
    expect(newRowCount).toBe(6);
    console.log('✅ Add row test passed');
    
    // Test 4: Filter rows
    await page.evaluate(() => {
      window.testTable.setFilter("gender", "=", "Female");
    });
    await page.waitForTimeout(300);
    
    const filteredRowCount = await page.locator('.tabulator-row').count();
    expect(filteredRowCount).toBe(2); // 2 females in our data
    console.log('✅ Filter test passed');
    
    // Test 5: Clear filter 
    await page.evaluate(() => {
      window.testTable.clearFilter();
    });
    await page.waitForTimeout(300);
    
    const rowCountAfterClearingFilter = await page.locator('.tabulator-row').count();
    expect(rowCountAfterClearingFilter).toBe(6);
    console.log('✅ Clear filter test passed');
    
    // Test 6: Update a row
    await page.evaluate(() => {
      window.testTable.updateRow(1, {name: "Alice Updated"});
    });
    await page.waitForTimeout(300);
    
    const updatedName = await page.evaluate(() => {
      return window.testTable.getRow(1).getData().name;
    });
    
    expect(updatedName).toBe("Alice Updated");
    console.log('✅ Update row test passed');
    
    // Test 7: Delete a row
    await page.evaluate(() => {
      window.testTable.deleteRow(1);
    });
    await page.waitForTimeout(300);
    
    const finalRowCount = await page.locator('.tabulator-row').count();
    expect(finalRowCount).toBe(5); // Back to original count
    console.log('✅ Delete row test passed');
    
    console.log('🎉 All tests passed successfully!');
  } finally {
    // Clean up - delete the temporary file
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (e) {
      console.error('Error cleaning up temp file:', e);
    }
  }
});