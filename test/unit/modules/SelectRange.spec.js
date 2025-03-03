import TabulatorFull from "../../../src/js/core/TabulatorFull";
import SelectRange from "../../../src/js/modules/SelectRange/SelectRange";

describe("SelectRange module", () => {
    /** @type {TabulatorFull} */
    let tabulator;
    /** @type {SelectRange} */
    let selectRangeMod;

    beforeEach(async () => {
        const el = document.createElement("div");
        el.id = "tabulator";
        document.body.appendChild(el);
        tabulator = new TabulatorFull("#tabulator", {
            selectableRange: true,
        });
        selectRangeMod = tabulator.module("selectRange");
        return new Promise((resolve) => {
            tabulator.on("tableBuilt", () => {
                resolve();
            });
        });
    });

    it("should have one range initially at the top left", () => {
        const range = selectRangeMod.getRanges()[0]._range;
        expect(range.top).toBe(0);
        expect(range.left).toBe(0);
        expect(range.bottom).toBe(0);
        expect(range.right).toBe(0);
    });
});
