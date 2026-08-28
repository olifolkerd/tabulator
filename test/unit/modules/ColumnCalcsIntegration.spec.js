import TabulatorFull from "../../../src/js/core/TabulatorFull";

// Integration tests for ColumnCalcs live in their own file because
// ColumnCalcs.spec.js stubs Module.prototype globals at import time and does
// not restore them, which would break a real TabulatorFull instance.

describe("ColumnCalcs top calc row DOM structure", () => {
    /** @type {TabulatorFull} */
    let tabulator;

    const brCount = () => tabulator.columnManager.getContentsElement().querySelectorAll("br").length;

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "column-calcs-integration";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#column-calcs-integration", {
            data: [
                { id: 1, name: "John", dept: "sales", value: 10 },
                { id: 2, name: "Jane", dept: "sales", value: 20 },
                { id: 3, name: "Bob", dept: "ops", value: 30 }
            ],
            columns: [
                { title: "Name", field: "name" },
                { title: "Dept", field: "dept" },
                { title: "Value", field: "value", topCalc: "sum" }
            ]
        });

        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    afterEach(() => {
        tabulator.destroy();
        document.getElementById("column-calcs-integration")?.remove();
    });

    // https://github.com/tabulator-tables/tabulator/issues/4540
    it("should remove the calc row line break when grouping removes the calc row", () => {
        // the calc row is inserted after the headers together with a structural
        // <br> (other modules insert their own, so count relative to the start)
        const initial = brCount();

        // with the default columnCalcs setting, grouping moves the calcs into
        // the groups and removes the table level calc row
        tabulator.setGroupBy("dept");

        expect(brCount()).toBe(initial - 1);
    });

    // https://github.com/tabulator-tables/tabulator/issues/4540
    it("should not accumulate line breaks when grouping is toggled", () => {
        const initial = brCount();

        tabulator.setGroupBy("dept");
        tabulator.setGroupBy(false);
        tabulator.setGroupBy("dept");
        tabulator.setGroupBy(false);

        expect(brCount()).toBe(initial);
    });
});
