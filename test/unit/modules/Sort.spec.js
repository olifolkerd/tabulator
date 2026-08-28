import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Sort from "../../../src/js/modules/Sort/Sort";
import { DateTime } from "luxon";

describe("Sort module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Sort} */
    let sortMod;
    let tableData = [
        { id: 2, name: "Jane", age: 25, score: 85.2 },
        { id: 1, name: "John", age: 30, score: 78.4 },
        { id: 3, name: "Bob", age: 35, score: 92.1 }
    ];
    let tableColumns = [
        { title: "ID", field: "id", sorter: "number" },
        { title: "Name", field: "name", sorter: "string" },
        { title: "Age", field: "age", sorter: "number" },
        { title: "Score", field: "score", sorter: "number" }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        sortMod = tabulator.module("sort");
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

    it("should initialize with no sorting", () => {
        const sorters = sortMod.getSort();
        expect(sorters.length).toBe(0);
    });

    it("should set a sort on a single column", () => {
        const column = tabulator.columnManager.findColumn("name");
        
        sortMod.setSort(column, "asc");
        
        const sorters = sortMod.getSort();
        expect(sorters.length).toBe(1);
        expect(sorters[0].field).toBe("name");
        expect(sorters[0].dir).toBe("asc");
    });

    it("should clear sort when calling clearSort", () => {
        const column = tabulator.columnManager.findColumn("name");
        
        sortMod.setSort(column, "asc");
        expect(sortMod.getSort().length).toBe(1);
        
        sortMod.clear();
        expect(sortMod.getSort().length).toBe(0);
    });

    it("should set multiple column sorting", () => {
        const nameColumn = tabulator.columnManager.findColumn("name");
        const ageColumn = tabulator.columnManager.findColumn("age");
        
        sortMod.setSort([
            { column: nameColumn, dir: "asc" },
            { column: ageColumn, dir: "desc" }
        ]);
        
        const sorters = sortMod.getSort();
        expect(sorters.length).toBe(2);
        expect(sorters[0].field).toBe("name");
        expect(sorters[0].dir).toBe("asc");
        expect(sorters[1].field).toBe("age");
        expect(sorters[1].dir).toBe("desc");
    });

    it("should sort data by string column", () => {
        // Apply sort
        const column = tabulator.columnManager.findColumn("name");
        sortMod.setSort(column, "asc");
        
        // Trigger sort
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        
        // Check order is correct
        expect(sorted[0].data.name).toBe("Bob");
        expect(sorted[1].data.name).toBe("Jane");
        expect(sorted[2].data.name).toBe("John");
    });

    it("should sort data by number column", () => {
        // Apply sort
        const column = tabulator.columnManager.findColumn("age");
        sortMod.setSort(column, "asc");
        
        // Trigger sort
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        
        // Check order is correct
        expect(sorted[0].data.age).toBe(25);
        expect(sorted[1].data.age).toBe(30);
        expect(sorted[2].data.age).toBe(35);
    });

    it("should sort data by multiple columns", () => {
        // Create test data with same ages but different names
        const testData = [
            { id: 1, name: "John", age: 30 },
            { id: 2, name: "Jane", age: 30 },
            { id: 3, name: "Bob", age: 25 }
        ];
        
        // Update table data
        tabulator.setData(testData);
        
        // Apply multi-column sort: first by age ascending, then by name ascending
        const ageColumn = tabulator.columnManager.findColumn("age");
        const nameColumn = tabulator.columnManager.findColumn("name");
        
        sortMod.setSort([
            { column: ageColumn, dir: "asc" },
            { column: nameColumn, dir: "asc" }
        ]);
        
        // Trigger sort
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        
        // First should be Bob (age 25)
        expect(sorted[0].data.name).toBe("Bob");
        
        // Then Jane (age 30) before John (age 30) due to alphabetical sort
        expect(sorted[1].data.name).toBe("Jane");
        expect(sorted[2].data.name).toBe("John");
    });

    it("should reverse sort direction", () => {
        // Apply sort
        const column = tabulator.columnManager.findColumn("name");
        sortMod.setSort(column, "desc");
        
        // Trigger sort
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        
        // Check order is reversed
        expect(sorted[0].data.name).toBe("John");
        expect(sorted[1].data.name).toBe("Jane");
        expect(sorted[2].data.name).toBe("Bob");
    });
});

describe("Sort module - datetime sorter with 'x' (epoch milliseconds) format", () => {
    // 2021-05-10T00:00:00.000Z and the two following days, supplied out of order.
    const DAY = 24 * 60 * 60 * 1000;
    const EPOCH_MS = 1620604800000;

    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Sort} */
    let sortMod;

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            dependencies: { luxon: { DateTime } },
            data: [
                { id: 1, ts: EPOCH_MS + DAY },
                { id: 2, ts: EPOCH_MS },
                { id: 3, ts: EPOCH_MS + 2 * DAY },
            ],
            columns: [
                { title: "ID", field: "id", sorter: "number" },
                { title: "TS", field: "ts", sorter: "datetime", sorterParams: { format: "x" } },
            ],
        });
        sortMod = tabulator.module("sort");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("orders epoch-ms timestamps chronologically when ascending", () => {
        sortMod.setSort(tabulator.columnManager.findColumn("ts"), "asc");
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        expect(sorted.map((row) => row.data.id)).toEqual([2, 1, 3]);
    });

    it("orders epoch-ms timestamps in reverse when descending", () => {
        sortMod.setSort(tabulator.columnManager.findColumn("ts"), "desc");
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        expect(sorted.map((row) => row.data.id)).toEqual([3, 1, 2]);
    });
});

describe("Sort module - BigInt values with auto-detected sorter", () => {
    // Fix https://github.com/tabulator-tables/tabulator/pull/4894
    // isNaN(value) threw "Cannot convert a BigInt value to a number" when
    // guessing a sorter for a column holding BigInt values.

    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Sort} */
    let sortMod;

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: [
                { id: 1, big: 30n },
                { id: 2, big: 10n },
                { id: 3, big: 20n },
            ],
            // no sorter defined, so it must be auto-detected via findSorter
            columns: [
                { title: "ID", field: "id", sorter: "number" },
                { title: "Big", field: "big" },
            ],
        });
        sortMod = tabulator.module("sort");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("auto-detects a number sorter for a BigInt column without throwing", () => {
        const column = tabulator.columnManager.findColumn("big");
        expect(() => sortMod.findSorter(column)).not.toThrow();
        expect(sortMod.findSorter(column)).toBe(Sort.sorters.number);
    });

    it("sorts BigInt values numerically when the sorter is auto-detected", () => {
        const column = tabulator.columnManager.findColumn("big");
        sortMod.setSort(column, "asc");
        const sorted = sortMod.sort(tabulator.rowManager.activeRows);
        expect(sorted.map((row) => row.data.id)).toEqual([2, 3, 1]);
    });
});