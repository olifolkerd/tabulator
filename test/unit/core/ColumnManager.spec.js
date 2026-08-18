import TabulatorFull from "../../../src/js/core/TabulatorFull";
import ColumnManager from "../../../src/js/core/ColumnManager";

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

describe("ColumnManager - column width overflow", () => {
    it("sets the table body minWidth when columns overflow horizontally", () => {
        // https://github.com/tabulator-tables/tabulator/issues/4840
        const tableElement = document.createElement("div");
        const rowElement = document.createElement("div");
        Object.defineProperty(rowElement, "clientWidth", { value: 300 });

        const columnManager = new ColumnManager({
            rowManager: {
                element: rowElement,
                tableElement: tableElement,
            }
        });

        columnManager.columnsByIndex = [
            { visible: true, getWidth: () => 220 },
            { visible: true, getWidth: () => 160 },
        ];

        columnManager.adjustForColumnWidthOverflow();

        expect(tableElement.style.minWidth).toBe("380px");
    });

    it("does not set the table body minWidth when columns fit", () => {
        // https://github.com/tabulator-tables/tabulator/issues/4840
        const tableElement = document.createElement("div");
        const rowElement = document.createElement("div");
        Object.defineProperty(rowElement, "clientWidth", { value: 300 });

        const columnManager = new ColumnManager({
            rowManager: {
                element: rowElement,
                tableElement: tableElement,
            }
        });

        columnManager.columnsByIndex = [
            { visible: true, getWidth: () => 120 },
            { visible: true, getWidth: () => 120 },
        ];

        columnManager.adjustForColumnWidthOverflow();

        expect(tableElement.style.minWidth).toBe("");
    });

    it("clears only the table body minWidth it set when overflow is resolved", () => {
        // https://github.com/tabulator-tables/tabulator/issues/4840
        const tableElement = document.createElement("div");
        const rowElement = document.createElement("div");
        Object.defineProperty(rowElement, "clientWidth", { value: 300 });

        const columnManager = new ColumnManager({
            rowManager: {
                element: rowElement,
                tableElement: tableElement,
            }
        });

        columnManager.columnsByIndex = [
            { visible: true, getWidth: () => 220 },
            { visible: true, getWidth: () => 160 },
        ];

        columnManager.adjustForColumnWidthOverflow();
        expect(tableElement.style.minWidth).toBe("380px");

        columnManager.columnsByIndex = [
            { visible: true, getWidth: () => 120 },
            { visible: true, getWidth: () => 120 },
        ];

        columnManager.adjustForColumnWidthOverflow();
        expect(tableElement.style.minWidth).toBe("");
    });

    it("queues only one post-layout overflow adjustment", () => {
        // https://github.com/tabulator-tables/tabulator/issues/4840
        const originalRequestAnimationFrame = global.requestAnimationFrame;
        const callbacks = [];
        global.requestAnimationFrame = jest.fn((callback) => {
            callbacks.push(callback);
        });

        const columnManager = new ColumnManager({
            rowManager: {
                element: document.createElement("div"),
                tableElement: document.createElement("div"),
            }
        });

        columnManager.adjustForColumnWidthOverflow = jest.fn();

        try {
            columnManager.queueColumnWidthOverflowAdjustment();
            columnManager.queueColumnWidthOverflowAdjustment();

            expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(callbacks).toHaveLength(1);

            callbacks[0]();

            expect(columnManager.adjustForColumnWidthOverflow).toHaveBeenCalledTimes(1);
            expect(columnManager.columnWidthOverflowAdjustQueued).toBe(false);
        } finally {
            global.requestAnimationFrame = originalRequestAnimationFrame;
        }
    });
});
