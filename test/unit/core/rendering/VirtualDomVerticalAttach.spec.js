import VirtualDomVertical from "../../../../src/js/core/rendering/renderers/VirtualDomVertical.js";

// Pure-unit. _attachRanges needs a real element to append fragments into, so use
// a document element for the row container; everything else is a stub. jsdom has
// no layout, so offsetHeight is 0 throughout — these tests assert which lifecycle
// calls the attach path makes, not any geometry.
function makeRenderer(rows){
	const tableElement = document.createElement("div");

	const renderer = new VirtualDomVertical({
		options:{rowHeight:null},
		rowManager:{element:document.createElement("div"), tableElement:tableElement},
		columnManager:{element:document.createElement("div")},
	});

	renderer._resetHeightIndex(rows.length);
	renderer.styleRow = () => {};

	return renderer;
}

// A stand-in for Row that records how initialize() was called. Row.initialize
// itself is what routes an already-initialized row to
// columnManager.renderer.rerenderRowCells, so recording the arguments here pins
// the contract the attach path relies on.
function makeRow(index, initialized){
	return {
		type:"row",
		data:{id:index},
		element:document.createElement("div"),
		initialized:initialized,
		heightInitialized:initialized,
		initializeCalls:[],
		initialize(...args){
			this.initializeCalls.push(args);
			this.initialized = true;
		},
		getElement(){
			return this.element;
		},
		getHeight(){
			return this.initialized ? 20 : 0;
		},
		rendered(){},
		clearCellHeight(){},
		calcHeight(){},
		setCellHeight(){},
	};
}

describe("VirtualDomVertical attach lifecycle", function(){
	it("builds cells off-DOM for a row it has never initialized", function(){
		const rows = [makeRow(0, false)],
		renderer = makeRenderer(rows);

		renderer._attachRanges(rows, [[0, 0]], 0);

		expect(rows[0].initializeCalls).toEqual([[false, true]]);
	});

	// A row that leaves the vertical window is detached but NOT deinitialized, so
	// it keeps `initialized === true` and keeps the cell set it had when it left.
	// Meanwhile VirtualDomHorizontal's addColRight/addColLeft update
	// row.modules.vdomHoz only for the rows visible at that moment. So with
	// renderHorizontal:"virtual", a row re-entering the vertical window after a
	// horizontal scroll holds a stale column window, and the only thing that
	// resyncs it is Row.initialize falling through to rerenderRowCells.
	it("still routes an already-initialized row through initialize, so the horizontal renderer can resync its columns", function(){
		const rows = [makeRow(0, true)],
		renderer = makeRenderer(rows);

		renderer.inScrollDrivenRender = true;

		renderer._attachRanges(rows, [[0, 0]], 0);

		expect(rows[0].initializeCalls.length).toBe(1);
	});

	// VirtualDomHorizontal.rerenderRowCells(row, force) reads Row.initialize's
	// second argument as `force`, and a forced rebuild discards and regenerates
	// every cell. Passing it for a re-attached row would rebuild the whole window
	// on every scroll tick — the exact cost the diff path exists to avoid — and
	// would defeat reinitializeRow's leftCol/rightCol guard.
	it("does not force a cell rebuild when re-attaching an already-initialized row", function(){
		const rows = [makeRow(0, true)],
		renderer = makeRenderer(rows);

		renderer.inScrollDrivenRender = true;

		renderer._attachRanges(rows, [[0, 0]], 0);

		const [force] = rows[0].initializeCalls[0];

		expect(force).toBeFalsy();
	});
});
