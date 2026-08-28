/**
 * Cross-cutting reactivity regression tests for the ReactiveData module.
 *
 * These complement ReactiveDataVue3.spec.js (which uses real Vue 3 proxies)
 * and the original ReactiveData.spec.js, focusing on two things:
 *
 *  1. "No framework" / plain arrays — the case used by React (state is plain
 *     arrays) and Angular (Zone.js change detection over plain arrays), and the
 *     baseline for everyone else. We assert the underlying array (and tree
 *     child array) is actually mutated correctly, not just that the table-side
 *     hooks fire. This guards against regressions in the normal path and also
 *     covers the arrow-function `arguments` bug that previously corrupted
 *     tree-child mutations even without any framework.
 *
 *  2. Generic Proxy-based reactivity — a minimal stand-in for proxy-based
 *     reactive libraries (Vue 3, MobX, Valtio, Solid stores) that return an
 *     instrumented method when a mutating array method is read and re-dispatch
 *     it to the raw target. This proves the fix generalises beyond Vue's
 *     specific implementation.
 *
 * Note: React and Angular do not use Proxy-based array instrumentation, so the
 * meaningful guarantee for them is the plain-array path. Proxy-based libraries
 * commonly paired with React (MobX/Valtio) are covered by the generic proxy
 * suite.
 */

import ReactiveData from "../../../src/js/modules/ReactiveData/ReactiveData";

function buildModule() {
    const mockRowManager = {
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

    const reactiveData = new ReactiveData(mockTable);
    return { reactiveData, mockTable, mockRowManager };
}

/**
 * Minimal proxy that mimics how proxy-based reactive libraries instrument
 * array mutators: reading e.g. `arr.push` returns a wrapper that re-dispatches
 * to the (possibly overridden) method on the raw target. This is the exact
 * shape that triggered issue #4212.
 */
function makeReactiveProxy(arr) {
    const MUTATORS = ["push", "unshift", "shift", "pop", "splice"];
    return new Proxy(arr, {
        get(target, key, receiver) {
            if (typeof key === "string" && MUTATORS.includes(key)) {
                return function (...args) {
                    return target[key].apply(target, args);
                };
            }
            return Reflect.get(target, key, receiver);
        },
    });
}

describe("ReactiveData reactivity (no framework / plain arrays)", () => {
    let reactiveData;
    let mockRowManager;

    beforeEach(() => {
        ({ reactiveData, mockRowManager } = buildModule());
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe("top-level data array", () => {
        it("push() mutates the array and notifies the table", () => {
            const data = [{ id: 1 }];
            reactiveData.watchData(data);

            const row = { id: 2 };
            const len = data.push(row);

            expect(len).toBe(2);
            expect(data).toEqual([{ id: 1 }, { id: 2 }]);
            expect(mockRowManager.addRowActual).toHaveBeenCalledWith(row, false);
        });

        it("unshift() mutates the array and notifies the table", () => {
            const data = [{ id: 1 }];
            reactiveData.watchData(data);

            const row = { id: 0 };
            const len = data.unshift(row);

            expect(len).toBe(2);
            expect(data).toEqual([{ id: 0 }, { id: 1 }]);
            expect(mockRowManager.addRowActual).toHaveBeenCalledWith(row, true);
        });

        it("pop() mutates the array and notifies the table", () => {
            const last = { id: 2 };
            const data = [{ id: 1 }, last];
            reactiveData.watchData(data);

            const result = data.pop();

            expect(result).toEqual(last);
            expect(data).toEqual([{ id: 1 }]);
            expect(mockRowManager.getRowFromDataObject).toHaveBeenCalledWith(last);
        });

        it("shift() mutates the array and notifies the table", () => {
            const first = { id: 1 };
            const data = [first, { id: 2 }];
            reactiveData.watchData(data);

            const result = data.shift();

            expect(result).toEqual(first);
            expect(data).toEqual([{ id: 2 }]);
            expect(mockRowManager.getRowFromDataObject).toHaveBeenCalledWith(first);
        });

        it("splice() mutates the array and notifies the table", () => {
            const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
            reactiveData.watchData(data);

            const newRow = { id: 9 };
            const removed = data.splice(1, 1, newRow);

            expect(removed).toEqual([{ id: 2 }]);
            expect(data).toEqual([{ id: 1 }, { id: 9 }, { id: 3 }]);
            expect(mockRowManager.reRenderInPosition).toHaveBeenCalled();
        });
    });

    describe("tree child array (sub-objects)", () => {
        let reactiveDataLocal;
        let row;

        const makeRow = (children) => ({
            getData: () => ({ id: 1, children }),
        });

        beforeEach(() => {
            ({ reactiveData: reactiveDataLocal } = buildModule());
            jest.spyOn(reactiveDataLocal, "rebuildTree").mockImplementation(() => {});
        });

        it("push() pushes the given child (not the row) and rebuilds the tree", () => {
            const children = [{ id: 2 }];
            row = makeRow(children);
            reactiveDataLocal.watchTreeChildren(row);

            const child = { id: 3 };
            children.push(child);

            // Regression for the arrow-function `arguments` bug: the pushed value
            // must be the child, never the row.
            expect(children).toEqual([{ id: 2 }, { id: 3 }]);
            expect(children[1]).toBe(child);
            expect(reactiveDataLocal.rebuildTree).toHaveBeenCalledWith(row);
        });

        it("unshift() inserts the given child and rebuilds the tree", () => {
            const children = [{ id: 2 }];
            row = makeRow(children);
            reactiveDataLocal.watchTreeChildren(row);

            children.unshift({ id: 1 });

            expect(children).toEqual([{ id: 1 }, { id: 2 }]);
            expect(reactiveDataLocal.rebuildTree).toHaveBeenCalledWith(row);
        });

        it("pop() removes the last child and rebuilds the tree", () => {
            const children = [{ id: 2 }, { id: 3 }];
            row = makeRow(children);
            reactiveDataLocal.watchTreeChildren(row);

            const result = children.pop();

            expect(result).toEqual({ id: 3 });
            expect(children).toEqual([{ id: 2 }]);
            expect(reactiveDataLocal.rebuildTree).toHaveBeenCalledWith(row);
        });

        it("shift() removes the first child and rebuilds the tree", () => {
            const children = [{ id: 2 }, { id: 3 }];
            row = makeRow(children);
            reactiveDataLocal.watchTreeChildren(row);

            const result = children.shift();

            expect(result).toEqual({ id: 2 });
            expect(children).toEqual([{ id: 3 }]);
            expect(reactiveDataLocal.rebuildTree).toHaveBeenCalledWith(row);
        });

        it("splice() applies the given args and rebuilds the tree", () => {
            const children = [{ id: 2 }, { id: 3 }, { id: 4 }];
            row = makeRow(children);
            reactiveDataLocal.watchTreeChildren(row);

            const removed = children.splice(1, 1, { id: 9 });

            expect(removed).toEqual([{ id: 3 }]);
            expect(children).toEqual([{ id: 2 }, { id: 9 }, { id: 4 }]);
            expect(reactiveDataLocal.rebuildTree).toHaveBeenCalledWith(row);
        });
    });

    it("watchKey() still propagates a property change to the row", () => {
        const data = { id: 1, name: "John" };
        const mockRow = { getData: () => data, updateData: jest.fn() };

        reactiveData.watchKey(mockRow, data, "name");
        data.name = "Jane";

        expect(data.name).toBe("Jane");
        expect(mockRow.updateData).toHaveBeenCalledWith({ name: "Jane" });
    });
});

describe("ReactiveData reactivity (generic Proxy-based: MobX / Valtio / Solid)", () => {
    let reactiveData;
    let mockRowManager;

    beforeEach(() => {
        ({ reactiveData, mockRowManager } = buildModule());
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("keeps a proxy-instrumented array in sync when push() is called", () => {
        const raw = [{ id: 1 }];
        const data = makeReactiveProxy(raw);

        reactiveData.watchData(data);

        const row = { id: 2 };
        data.push(row);

        expect(mockRowManager.addRowActual).toHaveBeenCalledWith(row, false);
        expect(data).toHaveLength(2);
        expect(raw).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("keeps a proxy-instrumented array in sync when unshift() is called", () => {
        const raw = [{ id: 1 }];
        const data = makeReactiveProxy(raw);

        reactiveData.watchData(data);

        data.unshift({ id: 0 });

        expect(data).toHaveLength(2);
        expect(raw).toEqual([{ id: 0 }, { id: 1 }]);
    });

    it("keeps a proxy-instrumented array in sync when pop() is called", () => {
        const raw = [{ id: 1 }, { id: 2 }];
        const data = makeReactiveProxy(raw);

        reactiveData.watchData(data);

        const result = data.pop();

        expect(result).toEqual({ id: 2 });
        expect(raw).toEqual([{ id: 1 }]);
    });

    it("keeps a proxy-instrumented array in sync when shift() is called", () => {
        const raw = [{ id: 1 }, { id: 2 }];
        const data = makeReactiveProxy(raw);

        reactiveData.watchData(data);

        const result = data.shift();

        expect(result).toEqual({ id: 1 });
        expect(raw).toEqual([{ id: 2 }]);
    });

    it("keeps a proxy-instrumented array in sync when splice() is called", () => {
        const raw = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const data = makeReactiveProxy(raw);

        reactiveData.watchData(data);

        const removed = data.splice(1, 1, { id: 9 });

        expect(removed).toEqual([{ id: 2 }]);
        expect(raw).toEqual([{ id: 1 }, { id: 9 }, { id: 3 }]);
    });
});
