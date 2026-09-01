/**
 * Regression tests for tabulator-tables/tabulator#4419
 * "Error when setting maxHeight on a datatable"
 *
 * Reported against 5.6.1 (5.6.0 was fine). Setting `maxHeight` on a table that has
 * no fixed `height` pins Chrome at 100% CPU and eventually throws:
 *
 *   RangeError: Maximum call stack size exceeded
 *       at VirtualDomVertical._virtualRenderFill
 *       at VirtualDomVertical.rerenderRows
 *       at RowManager.reRenderInPosition
 *       at RowManager.redraw
 *       at RowManager.adjustTableSize
 *       at VirtualDomVertical._virtualRenderFill      <-- cycle repeats
 *
 * The cycle existed because `_virtualRenderFill()` calls `rowManager.adjustTableSize()`
 * from inside its render loop, and `adjustTableSize()` kicked off a full `redraw()`
 * whenever the holder changed size - which rendered the rows all over again while the
 * first render pass was still running. The render loop now blocks that redraw: it
 * picks up the new container size itself.
 *
 * These tests drive the real `VirtualDomVertical` renderer and the real
 * `RowManager.adjustTableSize()`/`redraw()` against a simulated box model, because
 * jsdom reports 0 for every layout measurement. The model mirrors what the browser
 * does for the configuration in the issue's fiddle (https://jsfiddle.net/20efovmx/41/):
 * an auto-height table capped by `maxHeight`, so the holder grows with its content
 * until the table hits the cap.
 */

import RowManager from "../../../../src/js/core/RowManager";
import VirtualDomVertical from "../../../../src/js/core/rendering/renderers/VirtualDomVertical";

const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 54; // column title row + header filter row, as in the issue's fiddle
const MAX_HEIGHT = 600;
const ROW_COUNT = 50;

// depth at which we give up rather than letting the stack actually overflow, so a
// failure reports the render cycle instead of an opaque RangeError
const RUNAWAY_RENDER_DEPTH = 25;

function pixels(value){
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * A stand in for a rendered Row. Every hook `_virtualRenderFill()` and
 * `rerenderRows()` reach for, with a constant height so the box model below stays
 * predictable.
 */
function buildRow(index){
    const element = document.createElement("div");

    element.classList.add("tabulator-row");
    Object.defineProperty(element, "offsetTop", {get: () => index * ROW_HEIGHT});

    return {
        element,
        heightInitialized: false,
        getElement(){ return this.element; },
        initialize(){},
        rendered(){},
        calcHeight(){ this.heightInitialized = true; },
        setCellHeight(){},
        clearCellHeight(){},
        deinitializeHeight(){ this.heightInitialized = false; },
        normalizeHeight(){},
        getHeight(){ return ROW_HEIGHT; },
    };
}

function buildRows(count){
    const rows = [];

    for(let i = 0; i < count; i++){
        rows.push(buildRow(i));
    }

    return rows;
}

/**
 * Wires a real RowManager to a real VirtualDomVertical renderer and gives the
 * elements a browser-like box model:
 *
 *   .tabulator             height: min(maxHeight, header + holder)   <- maxHeight cap
 *   .tabulator-tableholder height: its inline style, or its content when unset
 *   .tabulator-table       height: rendered rows + vertical padding
 */
function buildTable({rowCount = ROW_COUNT, maxHeight = MAX_HEIGHT} = {}){
    const eventBus = {
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        subscribed: jest.fn(() => false),
        dispatch: jest.fn(),
        chain: jest.fn((key, args, initial) => initial),
        confirm: jest.fn(() => false),
    };

    const externalEvents = {
        dispatch: jest.fn(),
        subscribed: jest.fn(() => false),
    };

    const element = document.createElement("div");
    element.classList.add("tabulator");
    element.style.maxHeight = maxHeight + "px";

    const header = document.createElement("div");
    header.classList.add("tabulator-header");
    header.getBoundingClientRect = () => ({height: HEADER_HEIGHT, width: 800});

    const table = {
        element,
        eventBus,
        externalEvents,
        modules: {},
        options: {
            maxHeight: maxHeight + "px",
            minHeight: false,
            height: false,
            rowHeight: false,
            renderVerticalBuffer: 0,
        },
        columnManager: {
            element: header,
            getElement: () => header,
            getWidth: () => 800,
        },
    };

    const rowManager = new RowManager(table);
    table.rowManager = rowManager;

    // `initializeRenderer()` leaves fixedHeight false for a table with maxHeight but
    // no height, because the element is still empty when the renderer is created
    rowManager.fixedHeight = false;

    const holder = rowManager.element;
    const tableElement = rowManager.tableElement;

    holder.appendChild(tableElement);
    element.appendChild(header);
    element.appendChild(holder);
    document.body.appendChild(element);

    const contentHeight = () => pixels(tableElement.style.paddingTop) +
        pixels(tableElement.style.paddingBottom) +
        (tableElement.children.length * ROW_HEIGHT);

    // browsers reject a negative inline height, which leaves the holder at its
    // content height, exactly as if no height had been set at all
    const holderHeight = () => {
        const height = parseFloat(holder.style.height);

        return isNaN(height) || height < 0 ? contentHeight() : height;
    };

    Object.defineProperties(tableElement, {
        clientHeight: {get: contentHeight},
        offsetHeight: {get: contentHeight},
    });

    let scrollTop = 0;

    Object.defineProperties(holder, {
        clientHeight: {get: holderHeight},
        offsetHeight: {get: holderHeight},
        scrollHeight: {get: () => Math.max(holderHeight(), contentHeight())},
        clientWidth: {value: 800},
        offsetWidth: {value: 800},
        scrollWidth: {value: 800},
        scrollTop: {get: () => scrollTop, set: (value) => { scrollTop = value; }},
    });

    Object.defineProperties(element, {
        clientHeight: {get: () => Math.min(maxHeight, HEADER_HEIGHT + holderHeight())},
        clientWidth: {value: 800},
    });

    const rows = buildRows(rowCount);

    const setRows = (displayRows) => {
        rowManager.displayRows = [displayRows];
        rowManager.displayRowsCount = displayRows.length;
        rowManager.activeRows = displayRows;
    };

    setRows(rows);
    rowManager.renderMode = "virtual";

    const renderer = new VirtualDomVertical(table);
    renderer.initialize();
    rowManager.renderer = renderer;

    return {table, rowManager, renderer, rows, setRows, element, holder, tableElement};
}

/**
 * Counts how often `_virtualRenderFill()` runs, and how deeply it nests inside
 * itself, for a single render.
 */
function trackRenderPasses(renderer){
    const passes = {count: 0, depth: 0, maxDepth: 0};
    const render = renderer._virtualRenderFill.bind(renderer);

    renderer._virtualRenderFill = function(...args){
        passes.count++;
        passes.depth++;
        passes.maxDepth = Math.max(passes.maxDepth, passes.depth);

        if(passes.depth > RUNAWAY_RENDER_DEPTH){
            throw new Error("_virtualRenderFill recursed " + passes.depth + " levels deep");
        }

        try{
            return render(...args);
        }finally{
            passes.depth--;
        }
    };

    return passes;
}

describe("VirtualDomVertical maxHeight rendering (issue #4419)", () => {

    afterEach(() => {
        document.body.innerHTML = "";
        jest.restoreAllMocks();
    });

    it("does not start a new render pass while one is already running", () => {
        const {renderer} = buildTable();
        const passes = trackRenderPasses(renderer);

        renderer.renderRows();

        // `_virtualRenderFill()` calls `adjustTableSize()` from inside its render loop.
        // If that triggered `redraw()` on a size change, the rows would be re-rendered
        // through `reRenderInPosition()` while the first pass was still running - the
        // cycle from the stack trace in #4419.
        expect(passes.maxDepth).toBe(1);
        expect(passes.count).toBe(1);
    });

    it("adjustTableSize() still reports a resize when its redraw is blocked", () => {
        const {rowManager, rows, holder, tableElement} = buildTable();
        const redraw = jest.spyOn(rowManager, "redraw").mockImplementation(() => {});
        const appendRows = (from, to) => rows.slice(from, to).forEach((row) => tableElement.appendChild(row.getElement()));

        // size the empty holder, then let the content grow underneath it
        rowManager.adjustTableSize();
        expect(holder.style.height).toBe("0px");

        appendRows(0, 20);

        expect(rowManager.adjustTableSize(true)).toBe(true);
        expect(holder.clientHeight).toBe(20 * ROW_HEIGHT);
        expect(redraw).not.toHaveBeenCalled();

        appendRows(20, 40);

        expect(rowManager.adjustTableSize()).toBe(true);
        expect(holder.clientHeight).toBe(MAX_HEIGHT - HEADER_HEIGHT);
        expect(redraw).toHaveBeenCalledTimes(1);
    });

    it("does not overflow the call stack when rendering a table with maxHeight", () => {
        const {renderer} = buildTable();
        const passes = trackRenderPasses(renderer);

        expect(() => renderer.renderRows()).not.toThrow();
        expect(passes.maxDepth).toBeLessThan(RUNAWAY_RENDER_DEPTH);
    });

    it("sizes the holder to fill the table up to maxHeight", () => {
        const {renderer, element, holder} = buildTable();

        renderer.renderRows();

        expect(element.clientHeight).toBe(MAX_HEIGHT);
        expect(holder.clientHeight).toBe(MAX_HEIGHT - HEADER_HEIGHT);
    });
});

describe("VirtualDomVertical maxHeight smaller than the header", () => {

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("gives the holder no height rather than an invalid negative one, and keeps the render virtual", () => {
        const rowCount = 1000;
        const {renderer, holder, tableElement} = buildTable({rowCount, maxHeight: HEADER_HEIGHT - 14});

        renderer.renderRows();

        // a negative height is invalid css, so the holder would fall back to its content
        // height; the renderer then sizes its buffer from that and renders every row
        expect(holder.style.height).toBe("0px");
        expect(tableElement.children.length).toBeLessThanOrEqual(renderer.vDomWindowMinTotalRows);
        expect(tableElement.children.length).toBeLessThan(rowCount);
    });
});

describe("VirtualDomVertical rerenderRows() without a row to anchor on", () => {

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders from the top when the table had no rows before", () => {
        const {renderer, setRows, holder} = buildTable({rowCount: 0});
        const rows = buildRows(1000);

        renderer.renderRows();

        // the same shape as a filter that matched nothing being replaced by one that
        // matches everything: the rows only exist once the callback has run
        renderer.rerenderRows(() => {
            setRows(rows);
        });

        expect(renderer.vDomTop).toBe(0);
        expect(holder.scrollTop).toBe(0);
    });

    it("stays at the end of the data when the rendered window is past its new end", () => {
        const {renderer, rows, setRows, holder} = buildTable({rowCount: 1000});

        renderer.renderRows();
        renderer.scrollToRow(rows[rows.length - 1]);

        expect(renderer.vDomBottom).toBe(rows.length - 1);

        // rows deleted while redrawing was blocked: the rendered window now points past
        // the end of the data, so no previously rendered row can be used as the anchor
        const remaining = rows.slice(0, 100);
        setRows(remaining);

        renderer.rerenderRows();

        expect(renderer.vDomBottom).toBe(remaining.length - 1);
        expect(holder.scrollTop).toBe(holder.scrollHeight - holder.clientHeight);
    });
});
