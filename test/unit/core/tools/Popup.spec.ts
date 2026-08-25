import Popup from "../../../../src/js/core/tools/Popup";

type Position = "center" | "right" | "bottom" | "top" | "left";

const POSITIONS: Position[] = ["center", "right", "bottom", "top", "left"];

// document.body and document.documentElement outlive each test, so every
// stub on them has to be undone afterwards.
const stubbed: [Element, string][] = [];

function stub(element: Element, property: string, value: number): void {
	Object.defineProperty(element, property, {
		configurable: true,
		get: () => value,
	});

	stubbed.push([element, property]);
}

function restoreStubs(): void {
	stubbed.forEach(([element, property]) => {
		delete (element as never as Record<string, unknown>)[property];
	});

	stubbed.length = 0;
}

// Helpers.elOffset reads getBoundingClientRect, so this is what actually
// drives elementPositionCoords once show() runs for real.
function placeAt(
	element: HTMLElement,
	left: number,
	top: number,
	width: number,
	height: number,
): void {
	element.getBoundingClientRect = () => ({
		left,
		top,
		right: left + width,
		bottom: top + height,
		width,
		height,
		x: left,
		y: top,
		toJSON: () => ({}),
	});
}

// The code under test expresses horizontal placement as either `left` or
// `right`, so resolve both down to a single left edge to compare against.
function popupLeft(popup: Popup, bodyWidth: number): number {
	if (popup.offset.left !== null) {
		return popup.offset.left;
	}

	return bodyWidth - (popup.offset.right as number) - popup.element.offsetWidth;
}

function expectInsideViewport(popup: Popup): void {
	const bodyWidth = document.body.offsetWidth;
	const left = popupLeft(popup, bodyWidth);

	expect(left).toBeGreaterThanOrEqual(0);
	expect(left + popup.element.offsetWidth).toBeLessThanOrEqual(bodyWidth);
}

function resolvedTop(popup: Popup): number {
	return popup.offset.top as number;
}

function setViewport(spec: {
	width: number;
	height: number;
	scrollHeight?: number;
	scrollTop?: number;
}): void {
	stub(document.body, "offsetWidth", spec.width);
	stub(document.body, "offsetHeight", spec.height);
	stub(document.body, "scrollHeight", spec.scrollHeight ?? spec.height);
	stub(document.documentElement, "scrollTop", spec.scrollTop ?? 0);
}

function createDiv(spec: {
	left: number;
	top: number;
	width: number;
	height: number;
}) {
	const el = document.createElement("div");

	stub(el, "offsetWidth", spec.width);
	stub(el, "offsetHeight", spec.height);
	placeAt(el, spec.left, spec.top, spec.width, spec.height);
	document.body.appendChild(el);

	return { ...spec, el };
}

function createPopup(spec: { width: number; height: number }) {
	const tableElement = document.createElement("div");
	document.body.appendChild(tableElement);

	const el = document.createElement("div");
	stub(el, "offsetWidth", spec.width);
	stub(el, "offsetHeight", spec.height);

	const popup = new Popup(
		{
			destroyed: false,
			element: tableElement,
			options: { popupContainer: false },
			eventBus: { subscribe: jest.fn(), unsubscribe: jest.fn() },
		},
		el,
	);

	return popup;
}

describe("Popup tool positioning", () => {
	afterEach(() => {
		restoreStubs();
		document.body.replaceChildren();
	});

	describe("resolveCoordsByOrigin", () => {
		it("returns consistent coordinates regardless of origin type", () => {
			setViewport({ width: 300, height: 300 });

			const popup = createPopup({ width: 300, height: 100 });

			const anchor = createDiv({
				left: 0,
				top: 0,
				width: 1,
				height: 1,
			});

			expect(popup.resolveCoordsByOrigin(anchor.el, "bottom")).toStrictEqual({
				x: 0,
				y: 1,
			});
			expect(popup.resolveCoordsByOrigin(0, 1)).toStrictEqual({
				x: 0,
				y: 1,
			});
			expect(
				popup.resolveCoordsByOrigin(
					new MouseEvent("contextmenu", { clientX: 0, clientY: 1 }),
				),
			).toStrictEqual({
				x: 0,
				y: 1,
			});

			const anchor2 = createDiv({
				left: 200,
				top: 100,
				width: 50,
				height: 20,
			});

			expect(popup.resolveCoordsByOrigin(anchor2.el, "bottom")).toStrictEqual({
				x: 200,
				y: 120,
			});
			expect(popup.resolveCoordsByOrigin(200, 120)).toStrictEqual({
				x: 200,
				y: 120,
			});
			expect(
				popup.resolveCoordsByOrigin(
					new MouseEvent("contextmenu", { clientX: 200, clientY: 120 }),
				),
			).toStrictEqual({
				x: 200,
				y: 120,
			});
		});
	});

	describe("offset contract", () => {
		it("places the popup below the anchor when nothing overflows", () => {
			setViewport({ width: 650, height: 600 });

			const popup = createPopup({ width: 300, height: 100 });

			const anchor = createDiv({
				left: 100,
				top: 0,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(popup.offset).toStrictEqual({
				top: anchor.top + anchor.height,
				right: null,
				bottom: null,
				left: anchor.left,
			});
		});

		it("flips the popup to the left of the anchor when it overflows horizontally", () => {
			setViewport({ width: 650, height: 600 });

			const POPUP_WIDTH = 300;
			const popup = createPopup({ width: POPUP_WIDTH, height: 100 });

			// The anchor sits at 500 and the popup is 300 wide, so it runs past
			// the 650 body and moves to the anchor's left instead.
			const anchor = createDiv({
				left: 500,
				top: 0,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(popup.offset).toStrictEqual({
				top: anchor.top + anchor.height,
				right: null,
				bottom: null,
				left: anchor.left - POPUP_WIDTH,
			});
		});

		it("flips the popup above the anchor when it overflows vertically", () => {
			setViewport({ width: 650, height: 600 });

			const POPUP_HEIGHT = 100;

			const popup = createPopup({ width: 300, height: POPUP_HEIGHT });

			const anchor = createDiv({
				left: 100,
				top: 500,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(popup.offset).toStrictEqual({
				// the source insets the flip by 1px
				top: anchor.top - POPUP_HEIGHT - 1,
				right: null,
				bottom: null,
				left: anchor.left,
			});
		});

		it("flips the popup left and above the anchor when it overflows on both axes", () => {
			setViewport({ width: 650, height: 600 });

			const POPUP_WIDTH = 300;
			const POPUP_HEIGHT = 100;

			const popup = createPopup({ width: POPUP_WIDTH, height: POPUP_HEIGHT });

			// Both rescues apply at once.
			const anchor = createDiv({
				left: 500,
				top: 500,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(popup.offset).toStrictEqual({
				// the source insets the flip by 1px
				top: anchor.top - POPUP_HEIGHT - 1,
				right: null,
				bottom: null,
				left: anchor.left - POPUP_WIDTH,
			});
		});
	});

	describe("initial placement (no overflow)", () => {
		const BODY_WIDTH = 9999;
		const BODY_HEIGHT = 9999;
		const ANCHOR_LEFT = 100;
		const ANCHOR_WIDTH = 40;
		const ANCHOR_HEIGHT = 20;
		const POPUP_WIDTH = 300;
		const POPUP_HEIGHT = 100;

		// Anchor sits at x=100 so nothing overflows and we measure the raw
		// meaning of each position value.
		const cases: [Position, number][] = [
			["center", ANCHOR_LEFT + ANCHOR_WIDTH / 2],
			["right", ANCHOR_LEFT + ANCHOR_WIDTH],
			["bottom", ANCHOR_LEFT],
			["top", ANCHOR_LEFT],
			["left", ANCHOR_LEFT],
		];

		it.each(cases)("places %s at x=%i", (position, expected) => {
			setViewport({ width: BODY_WIDTH, height: BODY_HEIGHT });

			const popup = createPopup({ width: POPUP_WIDTH, height: POPUP_HEIGHT });

			const anchor = createDiv({
				left: ANCHOR_LEFT,
				top: 10,
				width: ANCHOR_WIDTH,
				height: ANCHOR_HEIGHT,
			});

			popup.show(anchor.el, position);

			expect(popupLeft(popup, BODY_WIDTH)).toBe(expected);
		});
	});

	describe("right overflow with an anchor element", () => {
		it.each(POSITIONS)("keeps a %s popup inside the viewport", (position) => {
			setViewport({ width: 650, height: 600 });

			const popup = createPopup({ width: 300, height: 100 });

			const anchor = createDiv({
				left: 500,
				top: 10,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, position);

			expectInsideViewport(popup);
		});
	});

	describe("a popup wider than the space to the anchor's left", () => {
		it.each(POSITIONS)("keeps a wide %s popup on screen", (position) => {
			setViewport({ width: 650, height: 600 });

			// Reversing a 600 wide popup around an anchor at 100 would put it
			// at 100 - 600 = -500, far off the left edge.
			const popup = createPopup({ width: 600, height: 100 });

			const anchor = createDiv({
				left: 100,
				top: 10,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, position);

			expectInsideViewport(popup);
		});
	});

	describe("mouse-event origin (no anchor element)", () => {
		it.each([300, 500])(
			"keeps a %ipx popup on screen when the cursor is near the right edge",
			(width) => {
				setViewport({ width: 650, height: 600 });

				const popup = createPopup({ width, height: 100 });

				popup.show(
					new MouseEvent("contextmenu", { clientX: 400, clientY: 10 }),
				);

				expectInsideViewport(popup);
			},
		);
	});

	describe("reversal state on reuse", () => {
		it("un-reverses when a reused popup no longer overflows", () => {
			setViewport({ width: 650, height: 600 });

			const popup = createPopup({ width: 300, height: 100 });

			popup.show(
				createDiv({ left: 500, top: 10, width: 40, height: 20 }).el,
				"bottom",
			);
			expect(popup.reversedX).toBe(true);

			popup.show(
				createDiv({ left: 50, top: 10, width: 40, height: 20 }).el,
				"bottom",
			);

			expect(popup.reversedX).toBe(false);
			expect(popupLeft(popup, 650)).toBe(50);
		});
	});

	describe("bottom overflow", () => {
		it("flips a popup that would fall below the viewport", () => {
			setViewport({ width: 650, height: 600 });

			const POPUP_HEIGHT = 100;

			const popup = createPopup({ width: 300, height: POPUP_HEIGHT });

			const anchor = createDiv({
				left: 100,
				top: 550,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(resolvedTop(popup) + POPUP_HEIGHT).toBeLessThanOrEqual(600);
		});

		it("flips a popup that would fall below a scrolled page", () => {
			// Visible area is scrollTop..scrollTop + body height, but the check
			// widens to scrollHeight once the page is scrolled.
			setViewport({
				width: 650,
				height: 600,
				scrollHeight: 3000,
				scrollTop: 100,
			});

			const POPUP_HEIGHT = 100;

			const popup = createPopup({ width: 300, height: POPUP_HEIGHT });

			const anchor = createDiv({
				left: 100,
				top: 650,
				width: 40,
				height: 20,
			});

			popup.show(anchor.el, "bottom");

			expect(resolvedTop(popup) + POPUP_HEIGHT).toBeLessThanOrEqual(100 + 600);
		});
	});
});
