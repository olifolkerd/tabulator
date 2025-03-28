import TabulatorFull from "../../../src/js/core/TabulatorFull";
import Format from "../../../src/js/modules/Format/Format";

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