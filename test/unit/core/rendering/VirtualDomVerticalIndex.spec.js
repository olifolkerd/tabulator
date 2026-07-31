import VirtualDomVertical from "../../../../src/js/core/rendering/renderers/VirtualDomVertical.js";

// Pure-unit. The height index and _findRowAt read only instance fields, so a
// minimal fake table is enough to construct the renderer — no DOM, no Tabulator.
function makeRenderer(){
	const el = {};

	return new VirtualDomVertical({
		options:{rowHeight:null},
		rowManager:{element:el, tableElement:el},
		columnManager:{element:el},
	});
}

// Seed the coordinate model: `heights[i]` is the true height of row i, and rows
// where `measured[i]` is falsy stay priced at the estimate.
function seed(heights, measured, estimate){
	const r = makeRenderer();

	r.estimateHeight = estimate;
	r.estimateFrozen = true;
	r._resetHeightIndex(heights.length);

	for(let i = 0; i < heights.length; i++){
		if(measured[i]){
			r._setHeight(i, heights[i], undefined);
		}
	}

	return r;
}

// The implementation _findRowAt is replacing: binary search over the _cumHeight
// oracle. Kept here as the reference the optimised version must match exactly.
function referenceFindRowAt(r, y){
	const n = r.measuredHeight.length;

	if(n === 0 || y <= 0){
		return 0;
	}

	if(y >= r._totalHeight()){
		return n - 1;
	}

	let lo = 0,
	hi = n;

	while(lo < hi){
		const mid = (lo + hi) >>> 1;

		if(r._cumHeight(mid) <= y){
			lo = mid + 1;
		}else{
			hi = mid;
		}
	}

	return Math.max(0, lo - 1);
}

// Deterministic PRNG so a failure is reproducible from the seed alone.
function rng(seedValue){
	let s = seedValue >>> 0;

	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

function priced(r, i){
	return r.isMeasured[i] === 1 ? r.measuredHeight[i] : r.estimateHeight;
}

// Every y worth probing: each row's start, interior, and the boundary either side.
function probePoints(r){
	const n = r.measuredHeight.length,
	points = [-5, -1, 0];

	let cum = 0;

	for(let i = 0; i < n; i++){
		const h = priced(r, i);

		points.push(cum - 1, cum, cum + 0.5, cum + h / 2, cum + h - 1);
		cum += h;
	}

	points.push(cum - 1, cum, cum + 1, cum + 1000);

	return points;
}

describe("VirtualDomVertical._findRowAt", () => {
	const cases = [
		["all rows measured, uniform", (n, rand) => ({heights:Array.from({length:n}, () => 25), measured:Array.from({length:n}, () => 1), estimate:25})],
		["all rows measured, variable", (n, rand) => ({heights:Array.from({length:n}, () => 10 + Math.floor(rand() * 90)), measured:Array.from({length:n}, () => 1), estimate:25})],
		["no rows measured", (n) => ({heights:Array.from({length:n}, () => 25), measured:Array.from({length:n}, () => 0), estimate:25})],
		["mixed measured and estimated", (n, rand) => ({heights:Array.from({length:n}, () => 10 + Math.floor(rand() * 90)), measured:Array.from({length:n}, () => (rand() < 0.5 ? 1 : 0)), estimate:25})],
		["fractional heights", (n, rand) => ({heights:Array.from({length:n}, () => 20 + rand() * 10), measured:Array.from({length:n}, () => 1), estimate:24.5})],
		["fractional estimate, partly measured", (n, rand) => ({heights:Array.from({length:n}, () => 18.3 + rand() * 7), measured:Array.from({length:n}, () => (rand() < 0.3 ? 1 : 0)), estimate:23.7})],
	];

	// Sizes chosen to straddle powers of two, where a Fenwick descent's step
	// bound is most likely to be wrong.
	const sizes = [0, 1, 2, 3, 7, 8, 9, 15, 16, 17, 31, 33, 64, 100, 1000, 1024, 1025];

	for(const [name, build] of cases){
		for(const n of sizes){
			it(`matches the reference binary search: ${name}, n=${n}`, () => {
				const rand = rng(n * 7919 + name.length),
				spec = build(n, rand),
				r = seed(spec.heights, spec.measured, spec.estimate);

				for(const y of probePoints(r)){
					expect(r._findRowAt(y)).toBe(referenceFindRowAt(r, y));
				}
			});
		}
	}

	it("returns an index whose row actually spans y", () => {
		const rand = rng(4871),
		n = 500,
		heights = Array.from({length:n}, () => 10 + Math.floor(rand() * 90)),
		measured = Array.from({length:n}, () => (rand() < 0.6 ? 1 : 0)),
		r = seed(heights, measured, 25);

		for(let i = 0; i < n; i++){
			const start = r._cumHeight(i),
			h = priced(r, i);

			// Interior of the row must resolve to the row itself.
			expect(r._findRowAt(start + h / 2)).toBe(i);
		}
	});

	it("honours lockedEstimate over estimateHeight", () => {
		const n = 64,
		r = seed(Array.from({length:n}, () => 25), Array.from({length:n}, () => 0), 25);

		r.lockedEstimate = 50;

		expect(r._findRowAt(0)).toBe(0);
		expect(r._findRowAt(125)).toBe(2);
		expect(r._findRowAt(149)).toBe(2);
		expect(r._findRowAt(150)).toBe(3);
	});
});
