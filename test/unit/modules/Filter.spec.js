import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Filter from "../../../src/js/modules/Filter/Filter";

describe("Filter module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Filter} */
    let filterMod;
    let tableData = [
        { id: 1, name: "John", age: 30, location: "New York" },
        { id: 2, name: "Jane", age: 25, location: "London" },
        { id: 3, name: "Bob", age: 35, location: "Paris" },
        { id: 4, name: "Alice", age: 28, location: "New York" },
        { id: 5, name: "Mark", age: 40, location: "Tokyo" }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name" },
        { title: "Age", field: "age" },
        { title: "Location", field: "location" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        filterMod = tabulator.module("filter");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("should initialize with no filters", () => {
        const filters = filterMod.getFilters();
        expect(filters.length).toBe(0);
    });

    it("should add a single filter", () => {
        filterMod.addFilter("name", "=", "John");
        
        const filters = filterMod.getFilters();
        expect(filters.length).toBe(1);
        expect(filters[0].field).toBe("name");
        expect(filters[0].type).toBe("=");
        expect(filters[0].value).toBe("John");
    });

    it("should remove a filter", () => {
        filterMod.addFilter("name", "=", "John");
        expect(filterMod.getFilters().length).toBe(1);
        
        filterMod.removeFilter("name", "=", "John");
        expect(filterMod.getFilters().length).toBe(0);
    });

    it("should clear all filters", () => {
        filterMod.addFilter("name", "=", "John");
        filterMod.addFilter("age", ">", 25);
        expect(filterMod.getFilters().length).toBe(2);
        
        filterMod.clearFilter();
        expect(filterMod.getFilters().length).toBe(0);
    });

    it("should filter data with equals operator", () => {
        // Apply filter for name = "John"
        filterMod.addFilter("name", "=", "John");
        
        // Filter the data
        const filtered = filterMod.filter(tabulator.rowManager.activeRows);
        
        // Should return only one row with name "John"
        expect(filtered.length).toBe(1);
        expect(filtered[0].data.name).toBe("John");
    });

    it("should filter data with greater than operator", () => {
        // Apply filter for age > 30
        filterMod.addFilter("age", ">", 30);
        
        // Filter the data
        const filtered = filterMod.filter(tabulator.rowManager.activeRows);
        
        // Should return 2 rows: Bob (35) and Mark (40)
        expect(filtered.length).toBe(2);
        
        // Check the filtered data contains the expected names
        const names = filtered.map(row => row.data.name);
        expect(names).toContain("Bob");
        expect(names).toContain("Mark");
    });

    it("should filter data with less than operator", () => {
        // Apply filter for age < 30
        filterMod.addFilter("age", "<", 30);
        
        // Filter the data
        const filtered = filterMod.filter(tabulator.rowManager.activeRows);
        
        // Should return 2 rows: Jane (25) and Alice (28)
        expect(filtered.length).toBe(2);
        
        // Check the filtered data contains the expected names
        const names = filtered.map(row => row.data.name);
        expect(names).toContain("Jane");
        expect(names).toContain("Alice");
    });

    it("should filter data with like operator", () => {
        // Apply filter for location like "New" (should match "New York")
        filterMod.addFilter("location", "like", "New");
        
        // Filter the data
        const filtered = filterMod.filter(tabulator.rowManager.activeRows);
        
        // Should return 2 rows with location "New York"
        expect(filtered.length).toBe(2);
        
        // Check all filtered rows have location containing "New"
        filtered.forEach(row => {
            expect(row.data.location).toContain("New");
        });
    });

    it("should apply multiple filters with AND logic", () => {
        // Apply two filters: location = "New York" AND age < 30
        filterMod.addFilter("location", "=", "New York");
        filterMod.addFilter("age", "<", 30);
        
        // Filter the data
        const filtered = filterMod.filter(tabulator.rowManager.activeRows);
        
        // Should return 1 row: Alice (age 28, location "New York")
        expect(filtered.length).toBe(1);
        expect(filtered[0].data.name).toBe("Alice");
    });

    it("should search data and return matching rows", () => {
        // Search for rows with age > 30
        const results = filterMod.searchData("age", ">", 30);
        
        // Should find 2 rows
        expect(results.length).toBe(2);
        
        // Check results have the expected data
        const names = results.map(row => row.name);
        expect(names).toContain("Bob");
        expect(names).toContain("Mark");
    });
});