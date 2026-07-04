import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Format from "../../../src/js/modules/Format/Format";
import { DateTime } from "luxon";

describe("Format module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {Format} */
    let formatMod;
    let tableData = [
        { id: 1, name: "John", active: true, balance: 1250.75, date: "2021-05-10" },
        { id: 2, name: "Jane", active: false, balance: 750.50, date: "2022-03-15" },
        { id: 3, name: "Bob", active: true, balance: 325.20, date: "2020-12-01" }
    ];
    let tableColumns = [
        { title: "ID", field: "id" },
        { title: "Name", field: "name" },
        { title: "Active", field: "active", formatter: "tickCross" },
        { title: "Balance", field: "balance", formatter: "money", formatterParams: { symbol: "$" } },
        { title: "Date", field: "date", formatter: "datetime", formatterParams: { outputFormat: "DD/MM/YYYY" } }
    ];

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            data: tableData,
            columns: tableColumns
        });
        formatMod = tabulator.module("format");
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

    it("should initialize formatters for columns", () => {
        const columns = tabulator.columnManager.getColumns();
        
        // Check if formatters are properly set
        expect(columns[0].modules.format.formatter).toBeDefined();
        expect(columns[2].modules.format.formatter).toBeDefined();
        expect(columns[3].modules.format.formatter).toBeDefined();
        expect(columns[4].modules.format.formatter).toBeDefined();
    });

    it("should sanitize HTML properly", () => {
        // Test with HTML content
        const html = "<script>alert('test')</script><b>Hello</b>";
        const sanitized = formatMod.sanitizeHTML(html);
        
        // Check XSS is prevented
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("</script>");
        expect(sanitized).not.toContain("<b>");
        expect(sanitized).not.toContain("</b>");
        
        // Check correct HTML entities are used
        expect(sanitized).toContain("&lt;script&gt;");
        expect(sanitized).toContain("&lt;b&gt;");
    });

    it("should convert empty values to space", () => {
        expect(formatMod.emptyToSpace(null)).toBe("&nbsp;");
        expect(formatMod.emptyToSpace(undefined)).toBe("&nbsp;");
        expect(formatMod.emptyToSpace("")).toBe("&nbsp;");
        expect(formatMod.emptyToSpace("test")).toBe("test");
        expect(formatMod.emptyToSpace(0)).toBe(0);
    });

    it("should handle lookupFormatter", () => {
        // Test with a string formatter name
        const stringFormatter = formatMod.lookupFormatter("plaintext");
        expect(typeof stringFormatter).toBe("function");
        
        // Test with a function formatter
        const funcFormatter = function(cell) { return cell; };
        const returnedFuncFormatter = formatMod.lookupFormatter(funcFormatter);
        expect(returnedFuncFormatter).toBe(funcFormatter);
        
        // Test with non-existent formatter name
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const defaultFormatter = formatMod.lookupFormatter("nonExistentFormatter");
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(typeof defaultFormatter).toBe("function");
        
        // Clean up
        consoleWarnSpy.mockRestore();
    });

    it("should create proper type formatters", () => {
        const column = {
            definition: {
                formatter: "money",
                formatterParams: { symbol: "$" },
                formatterPrint: "plaintext",
                formatterPrintParams: { prefix: "Print-" }
            }
        };
        
        const config = formatMod.lookupTypeFormatter(column, "");
        expect(config.formatter).toBeDefined();
        expect(config.params).toEqual({ symbol: "$" });
        
        const printConfig = formatMod.lookupTypeFormatter(column, "Print");
        expect(printConfig.formatter).toBeDefined();
        expect(printConfig.params).toEqual({ prefix: "Print-" });
    });
});

describe("Format module - 'x' (epoch milliseconds) input format", () => {
    // 2021-05-10T00:00:00.000Z
    const EPOCH_MS = 1620604800000;

    /** @type {TabulatorFull} */
    let tabulator;

    // Builds a table with luxon injected as a dependency, the way a consumer
    // would wire it in, then resolves once the table (and its cells) are rendered.
    const buildTable = async (columns, data) => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            dependencies: { luxon: { DateTime } },
            data,
            columns,
        });
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    };

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("datetime formatter parses an epoch-ms value via inputFormat 'x'", async () => {
        await buildTable(
            [{
                title: "TS", field: "ts", formatter: "datetime",
                formatterParams: { inputFormat: "x", outputFormat: "yyyy-MM-dd", timezone: "UTC" },
            }],
            [{ id: 1, ts: EPOCH_MS }]
        );

        const cellEl = tabulator.getRows()[0].getCell("ts").getElement();
        expect(cellEl.innerHTML).toBe("2021-05-10");
    });

    it("datetimediff formatter measures the diff of an epoch-ms value via inputFormat 'x'", async () => {
        await buildTable(
            [{
                title: "TS", field: "ts", formatter: "datetimediff",
                formatterParams: { inputFormat: "x", unit: "days", date: DateTime.fromMillis(EPOCH_MS) },
            }],
            [{ id: 1, ts: EPOCH_MS + 3 * 24 * 60 * 60 * 1000 }]
        );

        const cellEl = tabulator.getRows()[0].getCell("ts").getElement();
        expect(cellEl.innerHTML).toBe("3");
    });
});

describe("Format module - formatters with BigInt values", () => {
    // Fix https://github.com/tabulator-tables/tabulator/pull/4895
    // The star formatter called isNaN() on the raw cell value, which throws
    // "Cannot convert a BigInt value to a number" for BigInt values. Number.isNaN()
    // never coerces its argument, so it is safe for BigInt (and any other type).

    /** @type {TabulatorFull} */
    let tabulator;

    const buildTable = async (columns, data) => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", { data, columns });
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    };

    afterEach(() => {
        tabulator?.destroy();
        document.getElementById("tabulator")?.remove();
    });

    it("star formatter renders the correct number of stars for a BigInt value", async () => {
        await buildTable(
            [{ title: "Rating", field: "rating", formatter: "star", formatterParams: { stars: 5 } }],
            [{ id: 1, rating: 3n }]
        );

        const cellEl = tabulator.getRows()[0].getCell("rating").getElement();
        const stars = cellEl.querySelectorAll("svg");
        const activeStars = cellEl.querySelectorAll('polygon[fill="#FFEA00"]');

        expect(stars.length).toBe(5);
        expect(activeStars.length).toBe(3);
    });
});