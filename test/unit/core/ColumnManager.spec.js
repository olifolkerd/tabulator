import TabulatorFull from "../../../src/js/core/TabulatorFull";

describe("ColumnManager - calculateSorterFromValue with BigInt values", () => {
    // Fix https://github.com/tabulator-tables/tabulator/pull/4894
    // isNaN(value) threw "Cannot convert a BigInt value to a number" when
    // auto-generating columns from row data containing BigInt values.

    /** @type {TabulatorFull} */
    let tabulator;

    afterEach(() => {
        tabulator?.destroy();
        document.getElementById("tabulator")?.remove();
    });

    function buildTable(options) {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", options);
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => resolve());
        });
    }

    it("detects a number sorter for a BigInt value without throwing", async () => {
        await buildTable({ data: [{ id: 1 }], columns: [{ field: "id" }] });
        const columnManager = tabulator.columnManager;
        expect(() => columnManager.calculateSorterFromValue(10n)).not.toThrow();
        expect(columnManager.calculateSorterFromValue(10n)).toBe("number");
    });

    it("builds auto columns from BigInt row data without throwing", async () => {
        await buildTable({
            autoColumns: true,
            data: [{ id: 1, big: 100n }],
        });

        const column = tabulator.columnManager.findColumn("big");
        expect(column).toBeTruthy();
        expect(column.definition.sorter).toBe("number");
    });
});
