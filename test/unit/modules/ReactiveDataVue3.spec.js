/**
 * Real-Vue-3 smoke tests for issue #4212
 * https://github.com/tabulator-tables/tabulator/issues/4212
 *
 * "vue3 reactivity problem: .push() causes Tabulator data to be updated but
 *  does not update the array variable"
 *
 * With reactiveData enabled and a Vue 3 reactive() array, the mutating array
 * methods updated the table but left the reactive array unchanged, because the
 * overrides re-dispatched through Vue's instrumented method while reactivity
 * was blocked, dropping the native mutation. The fix performs the mutation via
 * the native Array.prototype methods.
 *
 * The framework-agnostic proof of the fix — all five mutators, add and remove,
 * on the top-level data array and on tree-child arrays — lives in
 * ReactiveDataReactivity.spec.js, which uses a generic Proxy plus plain arrays
 * and needs no framework dependency. These two tests are the minimal
 * confirmation that a *real* Vue 3 reactive() proxy behaves the same, covering
 * both the top-level data array and a data-tree child array (sub-objects).
 */

import { reactive } from "vue";
import ReactiveData from "../../../src/js/modules/ReactiveData/ReactiveData";

describe("ReactiveData with real Vue 3 reactive() arrays (issue #4212)", () => {
    /** @type {ReactiveData} */
    let reactiveData;
    let mockRowManager;

    beforeEach(() => {
        mockRowManager = {
            addRowActual: jest.fn(),
            getRowFromDataObject: jest.fn().mockReturnValue({ deleteActual: jest.fn() }),
            reRenderInPosition: jest.fn(),
            refreshActiveData: jest.fn(),
        };

        const mockTable = {
            rowManager: mockRowManager,
            modules: { dataTree: { initializeRow: jest.fn(), layoutRow: jest.fn() } },
            options: {
                reactiveData: true,
                dataTree: true,
                dataTreeChildField: "children",
            },
            eventBus: { subscribe: jest.fn() },
        };

        jest.spyOn(ReactiveData.prototype, "registerTableOption").mockImplementation(
            function (key, value) {
                this.table.options[key] = this.table.options[key] || value;
            }
        );
        jest.spyOn(ReactiveData.prototype, "subscribe").mockImplementation(() => {});

        reactiveData = new ReactiveData(mockTable);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("keeps the top-level reactive array in sync when push() is called", () => {
        const data = reactive([{ id: 1, name: "John" }]);
        reactiveData.watchData(data);

        const newRow = { id: 2, name: "Bob" };
        data.push(newRow);

        // The table is updated...
        expect(mockRowManager.addRowActual).toHaveBeenCalledWith(newRow, false);
        // ...and the reactive array is actually mutated (the #4212 symptom).
        expect(data).toHaveLength(2);
        expect(data[1]).toEqual(newRow);
    });

    it("keeps a reactive tree-child array (sub-objects) in sync when push() is called", () => {
        const children = reactive([{ id: 2, name: "Child A" }]);
        const row = { getData: () => ({ id: 1, name: "Parent", children }) };

        jest.spyOn(reactiveData, "rebuildTree").mockImplementation(() => {});
        reactiveData.watchTreeChildren(row);

        const newChild = { id: 3, name: "Child B" };
        children.push(newChild);

        expect(reactiveData.rebuildTree).toHaveBeenCalledWith(row);
        expect(children).toHaveLength(2);
        expect(children[1]).toEqual(newChild);
    });
});
