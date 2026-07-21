import InternalEventBus from "../../../../src/js/core/tools/InternalEventBus";

// Locks the _chain semantics the reuse-args fast path must preserve.

describe("InternalEventBus._chain", () => {
	test("threads the accumulator through subscribers in order", () => {
		const bus = new InternalEventBus(false);
		bus.subscribe("k", (_arg, value) => value + 1);
		bus.subscribe("k", (_arg, value) => value * 10);
		// priority equal -> insertion order: (0+1)=1 then 1*10=10
		expect(bus.chain("k", ["x"], 0, false)).toBe(10);
	});

	test("passes the leading args before the accumulator value", () => {
		const bus = new InternalEventBus(false);
		bus.subscribe("k", (a, b, value) => `${a}|${b}|${value}`);
		expect(bus.chain("k", ["p", "q"], "init", false)).toBe("p|q|init");
	});

	test("non-array args is wrapped", () => {
		const bus = new InternalEventBus(false);
		bus.subscribe("k", (a, value) => `${a}:${value}`);
		expect(bus.chain("k", "solo", "v", false)).toBe("solo:v");
	});

	test("an array return value is forwarded as a SINGLE argument", () => {
		const bus = new InternalEventBus(false);
		bus.subscribe("k", () => [1, 2, 3]);
		bus.subscribe("k", (_arg, value) => (Array.isArray(value) ? value.length : "spread"));
		// must be 3 (received [1,2,3] as one arg), not "spread"/NaN from a spread array
		expect(bus.chain("k", ["x"], 0, false)).toBe(3);
	});

	test("no subscribers returns the fallback value", () => {
		const bus = new InternalEventBus(false);
		expect(bus.chain("missing", ["x"], "init", "fallbackValue")).toBe("fallbackValue");
	});

	test("no subscribers invokes a function fallback", () => {
		const bus = new InternalEventBus(false);
		expect(bus.chain("missing", ["x"], "init", () => "fromFn")).toBe("fromFn");
	});

	test("a key whose subscribers were all removed falls back (not the initial value)", () => {
		const bus = new InternalEventBus(false);
		const cb = (_arg, value) => value;
		bus.subscribe("k", cb);
		bus.unsubscribe("k", cb);
		expect(bus.chain("k", ["x"], "init", "fallbackValue")).toBe("fallbackValue");
	});
});
