import Renderer from '../Renderer.js';

//Variable-height vertical virtual renderer.
//
//Coordinate model — two Fenwick (binary indexed) trees:
//  cumHeight(i) = fenwickMeasured.prefixSum(i)
//               + fenwickUnmeasuredCount.prefixSum(i) * estimateHeight
//giving O(log n) cumHeight/totalHeight and O(log^2 n) findRowAt. estimateHeight is
//calibrated once from the first painted window then frozen, and additionally
//locked for the duration of each render call, so the coordinate space never
//shifts underneath the user.
//
//Padding is RECOMPUTED from the index on every render (paddingTop =
//cumHeight(top)) rather than adjusted incrementally. That is deliberate: the
//incremental add/subtract model it replaces accumulated error and needed a clamp
//which, when it fired mid-list, collapsed the spacer reserving space for the
//unrendered rows above and left the table unable to scroll up.
//
//Display rows are a UNION of Row objects (type "row"/"calc") and GroupRows'
//Group objects. Group HAS `initialized` and a no-op `deinitializeHeight()`, has
//NO `heightInitialized` (so it always re-measures on attach), has NO `data` (so
//it is never durably cached), and its `getHeight()` returns a real measured
//height. All member access below is duck-typed accordingly.

const DEFAULT_ESTIMATE_HEIGHT = 20;

//Overscan is counted in ROWS, not pixels: render cost is linear in rendered row
//count, so capping the count is the meaningful knob. Deliberately small.
const OVERSCAN_MIN = 4;
const OVERSCAN_MAX = 16;

//Both loops below are hard-bounded rather than run to convergence.
const MAX_COVERAGE_ITER = 4;
const MAX_RECONCILE = 4;

//Minimum holder-width delta (px) that counts as a real resize; ignores subpixel
//retina jitter.
const RESIZE_WIDTH_THRESHOLD_PX = 1;

//Standard 1-indexed Fenwick tree over a Float64Array, exposing 0-indexed
//operations. tree[0] is unused.
class Fenwick{
	constructor(n){
		this.n = n;
		this.tree = new Float64Array(n + 1);
	}

	resize(n){
		this.n = n;
		this.tree = new Float64Array(n + 1);
	}

	resetZero(){
		this.tree.fill(0);
	}

	//Initialize as if values[i] = value for all i, using the identity
	//tree[i] = lowbit(i) * value for constant arrays — O(n), no n log n cost.
	bulkInitConstant(value){
		this.tree[0] = 0;
		for(let i = 1; i <= this.n; i++){
			this.tree[i] = (i & -i) * value;
		}
	}

	update(i0, delta){
		if(delta === 0){
			return;
		}

		let i = i0 + 1;

		while(i <= this.n){
			this.tree[i] += delta;
			i += i & -i;
		}
	}

	//Sum of values[0..count). count clamped to [0, n].
	prefixSum(count){
		let i = count;

		if(i > this.n){
			i = this.n;
		}else if(i <= 0){
			return 0;
		}

		let s = 0;

		while(i > 0){
			s += this.tree[i];
			i -= i & -i;
		}

		return s;
	}
}

export default class VirtualDomVertical extends Renderer{
	constructor(table){
		super(table);

		this.verticalFillMode = "fill";

		this.scrollTop = 0;
		this.scrollLeft = 0;

		//Rendered window, two views. vDomTop/vDomBottom are the stable
		//post-render snapshot and are read externally (SelectRange); they are
		//written exactly once per render so no reader sees a torn value.
		//renderedRange is the live value the attach path reads mid-coverage-loop.
		this.vDomTop = 0;
		this.vDomBottom = -1; //inclusive; -1 = empty
		this.renderedRange = {top:0, bottom:-1};

		//Coordinate model. Positional, rebuilt on structural change.
		this.fenwickMeasured = new Fenwick(0); //sum of measured heights
		this.fenwickUnmeasuredCount = new Fenwick(0); //1 per unmeasured row
		this.measuredHeight = new Float64Array(0);
		this.isMeasured = new Uint8Array(0);
		this.rowsCountCached = 0;

		//Durable heights keyed by data OBJECT REFERENCE, so a row keeps its real
		//height across sort/filter/tree toggles. Group rows have no `data` and are
		//simply never cached.
		this.dataHeights = new WeakMap();

		this.estimateHeight = this.table.options.rowHeight || DEFAULT_ESTIMATE_HEIGHT;
		this.measuredSum = 0;
		this.measuredCount = 0;
		//INVARIANT: calibrated once from the first painted window then frozen. A
		//drifting mean re-prices every unmeasured row and lurches totalHeight by
		//100k+ px at scale. Reset only by clearRows.
		this.estimateFrozen = false;
		//Per-render snapshot of estimateHeight honoured by _cumHeight/_heightOf so
		//every probe within one render is self-consistent. Null outside renders.
		this.lockedEstimate = null;

		//Cached holder dimensions, maintained by resize(), so the scroll path does
		//not read clientHeight (which forces style+layout once anything is dirty).
		this.lastClientWidth = 0;
		this.lastClientHeight = 0;

		//True while a scroll-driven render runs: gates the estimate flush (a
		//mid-scroll mean shift would tug against the user) and the DOM-truth clamp.
		this.inScrollDrivenRender = false;

		//Above-viewport measurement compensation: _setHeight accumulates
		//(real - priced) deltas for rows above the viewport top and the render
		//applies the sum to scrollTop so visible content stays pinned.
		this.pendingScrollAdjust = 0;
		this.renderVisTop = -1; //-1 = not in a scroll-driven render

		//Every programmatic scrollTop write records its value here first so the
		//echoed scroll event is recognised and swallowed instead of scheduling a
		//redundant render. NaN = nothing pending. Note the base class's
		//scrollToRowPosition writes scrollTop directly, so an unrecognised write is
		//always tolerated (it just renders, which is harmless).
		this.pendingProgrammaticScrollTop = NaN;

		//Deferred-render bookkeeping (resize only in this stage; fling deferral is
		//a separate, optional follow-up).
		this.rafScheduled = false;

		//Scratch buffers reused across renders to avoid per-frame garbage.
		this.detachRangesScratch = [];
		this.attachRangesScratch = [];
	}

	//////////////////////////////////////
	///////// Public Functions ///////////
	//////////////////////////////////////

	initialize(){
		//Cancel deferred work on teardown: RowManager.destroy() does not call into
		//the renderer, so subscribe like the other core features do.
		this.subscribe("table-destroy", this._clearDeferred.bind(this));

		this.lastClientWidth = this.elementVertical.clientWidth;
		this.lastClientHeight = this.elementVertical.clientHeight;
	}

	clearRows(){
		var element = this.tableElement;

		this._clearDeferred();
		this._detachAllRendered();

		element.style.paddingTop = "";
		element.style.paddingBottom = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";

		this.elementVertical.scrollLeft = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;

		this._resetHeightIndex(0);

		//New dataset: previously measured heights are meaningless.
		this.dataHeights = new WeakMap();
		//Recalibrate the estimate from the next dataset's first window.
		this.estimateFrozen = false;

		this._setScrollTop(0);
	}

	renderRows(){
		//Zero scrollTop only on a genuinely fresh render (post-clearRows/setData);
		//re-renders routed through here keep their position.
		if(this.rowsCountCached === 0){
			this._setScrollTop(0);
		}

		this._renderWindow();
	}

	rerenderRows(callback){
		var left = this.table.rowManager.scrollLeft,
		scrollTop = this.elementVertical.scrollTop,
		anchorIndex = false,
		anchorOffset = 0,
		rows = this.rows();

		//Find the rendered row nearest the current scroll position BEFORE anything
		//is detached, so the window can be restored around it afterwards. This
		//mirrors what the previous implementation did and is why no separate
		//anchoring module is needed.
		for(let i = this.vDomTop; i <= this.vDomBottom; i++){
			if(rows[i]){
				let diff = scrollTop - rows[i].getElement().offsetTop;

				if(anchorIndex === false || Math.abs(diff) < Math.abs(anchorOffset)){
					anchorOffset = diff;
					anchorIndex = i;
				}else{
					break;
				}
			}
		}

		this._detachAllRendered();

		if(callback){
			callback();
		}

		var rowsAfter = this.rows();

		//Rebuild the positional index for the new order, seeded from the durable
		//cache so previously measured rows keep their real height.
		this._rebuildIndexFromCache(rowsAfter);

		//Rendered rows re-measure on attach (confirming the seed); off-screen rows
		//keep the seeded value until they enter the window.
		for(let row of rowsAfter){
			if(row.deinitializeHeight){
				row.deinitializeHeight();
			}
		}

		if(rowsAfter.length){
			if(anchorIndex === false || anchorIndex >= rowsAfter.length){
				this._renderWindow();
			}else{
				this._anchorRowAt(anchorIndex, rowsAfter[anchorIndex], anchorOffset);
			}
		}else{
			this.clear();
			this.table.rowManager.tableEmpty();
		}

		this.scrollColumns(left);
	}

	scrollColumns(left){
		this.table.rowManager.scrollHorizontal(left);
	}

	//`top`/`dir` are ignored: the live scrollTop is authoritative and the window is
	//derived from it, so no direction bookkeeping is needed.
	scrollRows(top, dir){
		var scrollTop = this.elementVertical.scrollTop;

		//Echo suppression: a scroll event matching a value we just wrote is the
		//browser echoing our own write; the caller already rendered, so re-rendering
		//here would visibly shift the window. +/-1px because browsers round
		//fractional scrollTop writes. One-shot.
		if(Math.abs(scrollTop - this.pendingProgrammaticScrollTop) <= 1){
			this.pendingProgrammaticScrollTop = NaN;
			return;
		}

		this.pendingProgrammaticScrollTop = NaN;
		this.scrollTop = scrollTop;

		this.inScrollDrivenRender = true;

		try{
			this._renderWindow();
		}finally{
			this.inScrollDrivenRender = false;
		}
	}

	//DO NOT RERENDER SYNCHRONOUSLY HERE — RowManager calls this from inside
	//adjustTableSize().
	resize(){
		var holder = this.elementVertical,
		cw = holder.clientWidth,
		ch = holder.clientHeight,
		widthChanged = Math.abs(cw - this.lastClientWidth) > RESIZE_WIDTH_THRESHOLD_PX,
		heightChanged = Math.abs(ch - this.lastClientHeight) > RESIZE_WIDTH_THRESHOLD_PX;

		//A width change re-wraps text, so every measured height is stale.
		if(this.lastClientWidth !== 0 && widthChanged){
			this._invalidateMeasuredHeights();
		}

		this.lastClientWidth = cw;
		this.lastClientHeight = ch;

		if(!widthChanged && !heightChanged){
			return;
		}

		//A grown viewport can expose padding past the overscan, so re-render — but
		//deferred, never synchronously (see the contract note above).
		this._scheduleRender();
	}

	scrollToRow(row){
		var index = this.rows().indexOf(row);

		if(index > -1){
			this._anchorRowAt(index, row, 0);
		}
	}

	scrollToRowNearestTop(row){
		var index = this.rows().indexOf(row);

		return Math.abs(this.vDomTop - index) <= Math.abs(this.vDomBottom - index);
	}

	visibleRows(includingBuffer){
		var rows = this.rows();

		if(this.vDomBottom < this.vDomTop){
			return [];
		}

		if(includingBuffer){
			return rows.slice(this.vDomTop, this.vDomBottom + 1);
		}

		var top = this.elementVertical.scrollTop,
		bottom = top + (this.lastClientHeight || this.elementVertical.clientHeight),
		result = [],
		//One Fenwick seed then exact O(1) accumulation per row, since
		//rowTop + heightOf(i) === cumHeight(i + 1) by construction.
		rowTop = this._cumHeight(this.vDomTop);

		for(let i = this.vDomTop; i <= this.vDomBottom; i++){
			let rowBottom = rowTop + this._heightOf(i);

			if(rowBottom > top && rowTop < bottom && rows[i]){
				result.push(rows[i]);
			}

			rowTop = rowBottom;
		}

		return result;
	}

	//////////////////////////////////////
	//////// Internal Rendering //////////
	//////////////////////////////////////

	_renderWindow(){
		var rows = this.rows();

		if(this.rowsCountCached !== rows.length){
			this._resetHeightIndex(rows.length);
		}

		//Lock the estimate for this call; try/finally so a throw still unlocks.
		this.lockedEstimate = this.estimateHeight;

		try{
			this._renderWindowLocked(rows);
		}finally{
			this.lockedEstimate = null;
		}
	}

	_renderWindowLocked(rows){
		var element = this.tableElement,
		holder = this.elementVertical,
		//Cached dimension rather than a live read: this runs on every scroll frame
		//and clientHeight forces style+layout when anything dirtied it earlier.
		clientHeight = this.lastClientHeight > 0 ? this.lastClientHeight : holder.clientHeight;

		if(!rows.length){
			this._detachAllRendered();
			element.style.paddingTop = "0px";
			element.style.paddingBottom = "0px";
			//Dispatch even when empty: GroupRows relies on this to fix minWidth when
			//no data rows are visible.
			this.dispatch("render-virtual-fill");
			return;
		}

		var scrollTop = holder.scrollTop,
		lastIdx = rows.length - 1;

		//Pre-render clamp: if the document shrank (sort/filter) pull scrollTop into
		//range so the findRowAt math is valid, and write it to the DOM rather than
		//just locally. Structural renders trust the model; scroll-driven renders
		//trust the DOM (clamping to an undershooting estimate would bounce the user
		//off the bottom). Skipped on scroll frames far from the end, where it
		//provably cannot fire — that saves a scrollHeight read per frame.
		if(!(this.inScrollDrivenRender && scrollTop + (2 * clientHeight) <= this._totalHeight())){
			let maxScroll = this.inScrollDrivenRender
				? Math.max(0, holder.scrollHeight - clientHeight)
				: Math.max(0, this._totalHeight() - clientHeight);

			if(scrollTop > maxScroll){
				this._setScrollTop(maxScroll);
				scrollTop = maxScroll;
			}
		}

		//Row-domain window selection: find the visible range, then expand by
		//overscan on each side.
		var overscanRows = this._resolveOverscanRows(clientHeight),
		visTop = this._findRowAt(scrollTop),
		visBottom = this._findRowAt(scrollTop + clientHeight),
		newTop = Math.max(0, visTop - overscanRows),
		newBottom = Math.min(lastIdx, visBottom + overscanRows);

		//Arm the above-viewport measurement accumulator. Only scroll-driven renders
		//compensate; structural renders are anchor-corrected instead.
		this.pendingScrollAdjust = 0;
		this.renderVisTop = this.inScrollDrivenRender ? visTop : -1;

		var windowFilled = this._diffRender(rows, newTop, newBottom);

		//Coverage iteration: if the locked estimate over-counted heights the
		//rendered window can stop short of a viewport edge (blank padding shows).
		//Re-check both edges against the just-measured rows and extend. Bounded;
		//converges in 1-2 passes.
		var coverageIter = 0;

		while(coverageIter++ < MAX_COVERAGE_ITER){
			let extended = false,
			viewportBottomY = scrollTop + clientHeight;

			if(newBottom < lastIdx && this._cumHeight(newBottom + 1) < viewportBottomY){
				let desired = Math.min(lastIdx, this._findRowAt(viewportBottomY) + overscanRows);

				if(desired > newBottom){
					this._attachRanges(rows, [[newBottom + 1, desired]], newTop);
					newBottom = desired;
					this.renderedRange.top = newTop;
					this.renderedRange.bottom = newBottom;
					extended = true;
				}
			}

			if(newTop > 0 && this._cumHeight(newTop) > scrollTop){
				let desired = Math.max(0, this._findRowAt(scrollTop) - overscanRows);

				if(desired < newTop){
					//The OLD renderedRange.top must still be in place here:
					//_attachRanges uses it to route this range to insertBefore.
					this._attachRanges(rows, [[desired, newTop - 1]], desired);
					newTop = desired;
					this.renderedRange.top = newTop;
					this.renderedRange.bottom = newBottom;
					extended = true;
				}
			}

			if(!extended){
				break;
			}
		}

		//Padding, recomputed from the index (never incrementally adjusted).
		var paddingTop = this._cumHeight(newTop),
		//Forced to 0 at the last row: float drift in the subtraction would show as
		//a hairline gap at the very bottom.
		paddingBottom = newBottom === lastIdx ? 0 : Math.max(0, this._totalHeight() - this._cumHeight(newBottom + 1));

		element.style.paddingTop = paddingTop + "px";
		element.style.paddingBottom = paddingBottom + "px";

		this.vDomTop = newTop;
		this.vDomBottom = newBottom;
		this.renderedRange.top = newTop;
		this.renderedRange.bottom = newBottom;

		//Absorb above-viewport measurement deltas into scrollTop so visible content
		//stays pinned. The scrollHeight read must observe the paddings just written
		//and is only paid when deltas actually occurred.
		if(this.renderVisTop >= 0){
			if(this.pendingScrollAdjust !== 0){
				let domMax = Math.max(0, holder.scrollHeight - clientHeight),
				corrected = Math.max(0, Math.min(scrollTop + this.pendingScrollAdjust, domMax));

				if(Math.abs(corrected - holder.scrollTop) > 0.5){
					this._setScrollTop(corrected);
				}
			}

			this.pendingScrollAdjust = 0;
			this.renderVisTop = -1;
		}

		//Flush the estimate only on structural renders: a mid-scroll mean shift
		//would either jump or tug against the user.
		if(!this.inScrollDrivenRender){
			this._flushEstimateUpdate();
		}

		//Fired after every fill (structural render, or a scroll that replaced the
		//whole window) but not after incremental scroll ticks, matching the previous
		//implementation's contract.
		if(!this.inScrollDrivenRender || windowFilled){
			this.dispatch("render-virtual-fill");
		}
	}

	//Reconcile the rendered range to [newTop, newBottom]: detach rows that left,
	//attach rows that entered. Returns true when the window was replaced wholesale
	//(the equivalent of the old full fill), which gates the render-virtual-fill
	//dispatch on scroll renders.
	_diffRender(rows, newTop, newBottom){
		var oldTop = this.renderedRange.top,
		oldBottom = this.renderedRange.bottom,
		oldEmpty = oldBottom < oldTop,
		newEmpty = newBottom < newTop,
		wasFill = false,
		detachRanges = this.detachRangesScratch,
		attachRanges = this.attachRangesScratch;

		if(oldEmpty && newEmpty){
			return false;
		}

		detachRanges.length = 0;
		attachRanges.length = 0;

		if(oldEmpty){
			wasFill = true;
			attachRanges.push([newTop, newBottom]);
		}else if(newEmpty){
			detachRanges.push([oldTop, oldBottom]);
		}else if(newBottom < oldTop || newTop > oldBottom){
			wasFill = true;
			detachRanges.push([oldTop, oldBottom]);
			attachRanges.push([newTop, newBottom]);
		}else{
			if(newTop > oldTop){
				detachRanges.push([oldTop, newTop - 1]);
			}else if(newTop < oldTop){
				attachRanges.push([newTop, oldTop - 1]);
			}

			if(newBottom < oldBottom){
				detachRanges.push([newBottom + 1, oldBottom]);
			}else if(newBottom > oldBottom){
				attachRanges.push([oldBottom + 1, newBottom]);
			}
		}

		for(let range of detachRanges){
			for(let i = range[0]; i <= range[1]; i++){
				let row = rows[i],
				el = row ? row.getElement() : null;

				if(el && el.parentNode){
					el.parentNode.removeChild(el);
				}
			}
		}

		//_attachRanges routes each range to insertBefore-vs-append by comparing it
		//against the range that is STILL rendered, so renderedRange must not be
		//advanced until after the attach — otherwise an upward extension fails the
		//prepend test and gets appended below the window, putting the DOM out of
		//index order.
		if(attachRanges.length){
			this._attachRanges(rows, attachRanges, newTop);
		}

		this.renderedRange.top = newTop;
		this.renderedRange.bottom = newBottom;

		return wasFill;
	}

	//Attach the rows in `ranges`: build cells off-DOM inside per-range fragments
	//(writes only), then run the measurement phases ONCE over the union with reads
	//and writes batched, so the whole call costs a single forced reflow:
	//  A. rendered()        - per-cell callbacks, before measurement
	//  B. clearCellHeight() - writes
	//  C. calcHeight(true)  - reads offsetHeight, THE layout flush
	//  D. setCellHeight()   - writes
	//  E. getHeight()       - cached from C, feeds the height index
	_attachRanges(rows, ranges, newTop){
		var element = this.tableElement,
		attached = [];

		for(let range of ranges){
			let fragment = document.createDocumentFragment(),
			rangeStart = attached.length;

			for(let i = range[0]; i <= range[1]; i++){
				let row = rows[i];

				if(!row){
					continue;
				}

				let wasUninitialized = !row.initialized;

				//A row's index, hence its even/odd class, is scroll-invariant, so
				//scroll re-attaches keep the class they already have.
				if(wasUninitialized || !this.inScrollDrivenRender){
					this.styleRow(row, i);
				}

				if(wasUninitialized){
					row.initialize(false, true); //inFragment: build cells off-DOM
				}

				let el = row.getElement();

				if(el.parentNode && el.parentNode !== fragment){
					el.parentNode.removeChild(el);
				}

				fragment.appendChild(el);

				//Measure when the height was never initialized OR the cached height is
				//invalid/zero. The second half matters: a row first measured while
				//detached caches a 0 outerHeight yet is still flagged
				//heightInitialized, so keying on that flag alone leaves it permanently
				//unmeasured and the coordinate space stuck on estimates.
				//
				//"Settled" must be captured HERE: phase D flips heightInitialized to
				//true, so reading it in phase E would also match rows that were just
				//re-measured and still need their index refresh. Group rows have no
				//heightInitialized and so are never settled — they always re-measure.
				let hasValidHeight = row.getHeight() > 0;

				attached.push({
					row:row,
					index:i,
					wasUninitialized:wasUninitialized,
					needsMeasure:!row.heightInitialized || !hasValidHeight,
					wasSettled:row.heightInitialized === true && hasValidHeight && this.isMeasured[i] === 1,
				});
			}

			if(attached.length === rangeStart){
				continue;
			}

			//Insertion point. renderedRange/newTop are fixed for the whole call, so
			//per-range evaluation is order independent.
			let insertAtTop = range[1] < newTop || (newTop <= range[0] && range[0] < this.renderedRange.top);

			if(insertAtTop && element.firstChild){
				element.insertBefore(fragment, element.firstChild);
			}else{
				element.appendChild(fragment);
			}
		}

		if(!attached.length){
			return;
		}

		//Phase A. On scroll renders, first attach only: cell DOM persists across
		//detach/attach, and re-dispatching cellRendered per cell per frame was the
		//single biggest live-tick cost. Structural renders fire for all rows.
		for(let entry of attached){
			if(!this.inScrollDrivenRender || entry.wasUninitialized){
				entry.row.rendered();
			}
		}

		//Phases B-D, guarded by heightInitialized. Never skipped for speed:
		//unmeasured rows would render at un-normalized heights AND leave the index
		//out of sync with the real DOM stack.
		if(!this.table.options.rowHeight){
			for(let entry of attached){
				if(entry.needsMeasure){
					entry.row.clearCellHeight();
				}
			}
		}

		for(let entry of attached){
			if(entry.needsMeasure){
				entry.row.calcHeight(true);
			}
		}

		for(let entry of attached){
			if(entry.needsMeasure){
				entry.row.setCellHeight();
			}
		}

		//Phase E: feed the height index from the value cached by phase C — no new
		//offsetHeight read, no extra reflow. Settled rows are skipped outright:
		//their height cannot have changed without something clearing
		//heightInitialized first.
		for(let entry of attached){
			if(entry.wasSettled){
				continue;
			}

			//Read the height AFTER normalization. calcHeight(true) in phase C runs
			//before setCellHeight() in phase D, and normalizing the cell heights
			//changes the row's final height — so the value getHeight() cached in
			//phase C is pre-normalization. Feeding that to the index leaves it
			//systematically disagreeing with the DOM, which drifts the rendered
			//block away from its computed position on every scroll. Rows that were
			//not re-measured this pass keep their cached value (no new layout read).
			let h = entry.needsMeasure ? entry.row.getElement().offsetHeight : entry.row.getHeight();

			if(h > 0){
				this._setHeight(entry.index, h, entry.row.data);
			}
		}
	}

	_detachAllRendered(){
		this.tableElement.replaceChildren();

		this.vDomTop = 0;
		this.vDomBottom = -1;
		this.renderedRange.top = 0;
		this.renderedRange.bottom = -1;
	}

	//////////////////////////////////////
	//////// Height bookkeeping //////////
	//////////////////////////////////////

	//Reset the positional index to "all rows unmeasured". Reallocates only on a
	//length change. estimateHeight is untouched.
	_resetHeightIndex(rowsCount){
		if(this.measuredHeight.length !== rowsCount){
			this.measuredHeight = new Float64Array(rowsCount);
			this.isMeasured = new Uint8Array(rowsCount);
			this.fenwickMeasured.resize(rowsCount);
			this.fenwickUnmeasuredCount.resize(rowsCount);
		}else{
			this.measuredHeight.fill(0);
			this.isMeasured.fill(0);
			this.fenwickMeasured.resetZero();
			this.fenwickUnmeasuredCount.resetZero();
		}

		this.fenwickUnmeasuredCount.bulkInitConstant(1);

		this.measuredSum = 0;
		this.measuredCount = 0;
		this.rowsCountCached = rowsCount;
	}

	//Reset the index for a new display order, then seed it from the durable cache
	//so previously measured rows keep their real height. Uncached rows stay on the
	//estimate until they enter the window.
	_rebuildIndexFromCache(rows){
		this._resetHeightIndex(rows.length);

		for(let i = 0; i < rows.length; i++){
			let dataKey = rows[i] ? rows[i].data : undefined;

			if(dataKey === undefined){
				continue;
			}

			let h = this.dataHeights.get(dataKey);

			if(h === undefined || h <= 0){
				continue;
			}

			//Direct first-measurement writes; the arrays were just zeroed.
			this.fenwickMeasured.update(i, h);
			this.fenwickUnmeasuredCount.update(i, -1);
			this.isMeasured[i] = 1;
			this.measuredHeight[i] = h;
			this.measuredSum += h;
			this.measuredCount += 1;
		}
	}

	//Invalidate every measured height (the holder width changed, so text wrapping
	//may differ). The next render re-measures from the DOM.
	_invalidateMeasuredHeights(){
		this._resetHeightIndex(this.measuredHeight.length);
		this.dataHeights = new WeakMap();

		for(let row of this.rows()){
			if(row.deinitializeHeight){
				row.deinitializeHeight();
			}
		}
	}

	//Record a measurement: trees, running stats and the durable cache. Never
	//mutates estimateHeight (see _flushEstimateUpdate).
	_setHeight(i, h, dataKey){
		if(i < 0 || i >= this.measuredHeight.length || !Number.isFinite(h) || h <= 0){
			return;
		}

		var wasMeasured = this.isMeasured[i] === 1,
		oldH = this.measuredHeight[i];

		if(wasMeasured && oldH === h){
			return;
		}

		//Durable cache write only on first/changed measurements; this is per-row
		//hot path. Group rows pass undefined and are skipped.
		if(dataKey !== undefined){
			this.dataHeights.set(dataKey, h);
		}

		//Above-viewport size deltas shift everything visible, so accumulate them
		//for the render to absorb into scrollTop.
		if(this.renderVisTop >= 0 && i < this.renderVisTop){
			let prior = wasMeasured ? oldH : (this.lockedEstimate === null ? this.estimateHeight : this.lockedEstimate);

			this.pendingScrollAdjust += h - prior;
		}

		if(wasMeasured){
			this.fenwickMeasured.update(i, h - oldH);
			this.measuredSum += h - oldH;
		}else{
			this.fenwickMeasured.update(i, h);
			this.fenwickUnmeasuredCount.update(i, -1);
			this.isMeasured[i] = 1;
			this.measuredSum += h;
			this.measuredCount += 1;
		}

		this.measuredHeight[i] = h;
	}

	//One-shot estimate calibration; no-op once frozen.
	_flushEstimateUpdate(){
		if(this.estimateFrozen || this.measuredCount === 0){
			return;
		}

		this.estimateHeight = Math.max(1, this.measuredSum / this.measuredCount);
		this.estimateFrozen = true;
	}

	//cumHeight(i) = sum of heights[0..i)
	_cumHeight(i){
		if(i <= 0){
			return 0;
		}

		var n = this.measuredHeight.length,
		ci = i > n ? n : i,
		est = this.lockedEstimate === null ? this.estimateHeight : this.lockedEstimate;

		return this.fenwickMeasured.prefixSum(ci) + (this.fenwickUnmeasuredCount.prefixSum(ci) * est);
	}

	_totalHeight(){
		return this._cumHeight(this.measuredHeight.length);
	}

	//Index of the row at document Y — binary search over the cumHeight oracle.
	_findRowAt(y){
		var n = this.measuredHeight.length;

		if(n === 0 || y <= 0){
			return 0;
		}

		if(y >= this._totalHeight()){
			return n - 1;
		}

		//Largest i with cumHeight(i) <= y, then i-1 is the row containing y.
		var lo = 0,
		hi = n;

		while(lo < hi){
			let mid = (lo + hi) >>> 1;

			if(this._cumHeight(mid) <= y){
				lo = mid + 1;
			}else{
				hi = mid;
			}
		}

		return Math.max(0, lo - 1);
	}

	//Per-row height (measured if known, else the estimate). O(1) — reads the
	//shadow arrays, no tree query. By construction
	//cumHeight(i) + heightOf(i) === cumHeight(i + 1).
	_heightOf(i){
		if(i < 0 || i >= this.measuredHeight.length){
			return 0;
		}

		var est = this.lockedEstimate === null ? this.estimateHeight : this.lockedEstimate;

		return this.isMeasured[i] === 1 ? this.measuredHeight[i] : est;
	}

	//Adaptive overscan for the current viewport (~quarter viewport of rows),
	//clamped. An explicit renderVerticalBuffer is honoured as a pixel override,
	//converted to rows.
	_resolveOverscanRows(clientHeight){
		var est = Math.max(1, this.estimateHeight),
		buffer = this.table.options.renderVerticalBuffer;

		if(buffer){
			return Math.max(OVERSCAN_MIN, Math.ceil(buffer / est));
		}

		return Math.max(OVERSCAN_MIN, Math.min(OVERSCAN_MAX, Math.round(clientHeight / 4 / est)));
	}

	//////////////////////////////////////
	//////// Scroll positioning //////////
	//////////////////////////////////////

	//The single way to write scrollTop programmatically: records the value first so
	//scrollRows can swallow the echoed event.
	_setScrollTop(top){
		this.pendingProgrammaticScrollTop = top;
		this.scrollTop = top;
		this.elementVertical.scrollTop = top;
	}

	//Anchor the row at `index` at `offsetFromHolderTop` inside the holder.
	//One estimate-placed render cannot reach a far row (the browser clamps
	//scrollTop to the current document height), so: place via cumHeight, render,
	//then snap to DOM truth once the row is in the window, else re-place. Bounded,
	//and bails when the window stops moving. Synchronous, so the corrected window
	//is in the DOM on the same paint — the base class's scrollToRowPosition reads
	//rowEl.offsetTop straight after calling scrollToRow.
	_anchorRowAt(index, row, offsetFromHolderTop){
		var holder = this.elementVertical,
		clientHeight = holder.clientHeight || this.lastClientHeight,
		prevTop = -2,
		prevBottom = -2;

		if(this.rowsCountCached !== this.rows().length){
			this._resetHeightIndex(this.rows().length);
		}

		for(let i = 0; i < MAX_RECONCILE; i++){
			this.lockedEstimate = this.estimateHeight;

			let placed;

			try{
				let target = this._cumHeight(index) - offsetFromHolderTop,
				maxScroll = Math.max(0, this._totalHeight() - clientHeight);

				placed = Math.max(0, Math.min(target, maxScroll));
			}finally{
				this.lockedEstimate = null;
			}

			this._setScrollTop(placed);
			this._renderWindow();

			let el = row.getElement();

			if(el && el.parentNode){
				//The anchor is in the window: snap to DOM truth, converged.
				let desired = el.offsetTop - offsetFromHolderTop,
				maxScrollPost = Math.max(0, holder.scrollHeight - clientHeight),
				corrected = Math.max(0, Math.min(desired, maxScrollPost));

				if(Math.abs(corrected - holder.scrollTop) > 0.5){
					this._setScrollTop(corrected);
					this._renderWindow();
				}

				break;
			}

			//Still outside the window. If it did not move since the last iteration
			//the coordinate space is stable and re-placing would land identically.
			if(this.renderedRange.top === prevTop && this.renderedRange.bottom === prevBottom){
				break;
			}

			prevTop = this.renderedRange.top;
			prevBottom = this.renderedRange.bottom;
		}
	}

	//////////////////////////////////////
	//////// Deferred work ///////////////
	//////////////////////////////////////

	//Book a render on the next frame, coalescing multiple requests. Falls back to
	//a synchronous call where requestAnimationFrame is unavailable (jsdom), so no
	//code path can throw a ReferenceError.
	_scheduleRender(){
		if(this.rafScheduled){
			return;
		}

		if(typeof requestAnimationFrame !== "function"){
			this._renderWindow();
			return;
		}

		this.rafScheduled = true;

		this.rafHandle = requestAnimationFrame(() => {
			this.rafScheduled = false;
			this.rafHandle = null;

			if(!this.table.destroyed){
				this._renderWindow();
			}
		});
	}

	_clearDeferred(){
		if(this.rafHandle && typeof cancelAnimationFrame === "function"){
			cancelAnimationFrame(this.rafHandle);
		}

		this.rafHandle = null;
		this.rafScheduled = false;
	}
}
