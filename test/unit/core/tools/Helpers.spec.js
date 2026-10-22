import Helpers from "../../../../src/js/core/tools/Helpers";

// deepClone must produce an independent deep copy while preserving shared and
// circular reference identity (the case the WeakMap keying must get right).

describe("Helpers.deepClone", () => {
	test("deep copies nested objects and arrays (values equal, refs distinct)", () => {
		const src = { a: 1, nested: { b: 2, list: [1, 2, { c: 3 }] } };
		const out = Helpers.deepClone(src);
		expect(out).toEqual(src);
		expect(out).not.toBe(src);
		expect(out.nested).not.toBe(src.nested);
		expect(out.nested.list).not.toBe(src.nested.list);
		expect(out.nested.list[2]).not.toBe(src.nested.list[2]);
	});

	test("mutating the clone does not affect the source", () => {
		const src = { nested: { n: 1 }, arr: [{ x: 1 }] };
		const out = Helpers.deepClone(src);
		out.nested.n = 99;
		out.arr[0].x = 99;
		expect(src.nested.n).toBe(1);
		expect(src.arr[0].x).toBe(1);
	});

	test("preserves shared references (same object referenced twice -> one clone)", () => {
		const shared = { v: 1 };
		const src = { a: shared, b: shared };
		const out = Helpers.deepClone(src);
		expect(out.a).toBe(out.b); // same clone instance
		expect(out.a).not.toBe(shared); // but a copy, not the original
	});

	test("handles a nested circular reference (identity preserved, no infinite loop)", () => {
		const a = { name: "a" };
		const b = { name: "b" };
		a.child = b;
		b.parent = a; // circular
		const out = Helpers.deepClone(a);
		expect(out.name).toBe("a");
		expect(out.child.name).toBe("b");
		expect(out.child.parent).toBe(out); // circular ref points back to the clone of a
		expect(out.child.parent).not.toBe(a);
	});

	test("handles a self (root) circular reference", () => {
		const obj = { name: "root" };
		obj.self = obj;
		const out = Helpers.deepClone(obj);
		expect(out.name).toBe("root");
		expect(out.self).toBe(out);
	});

	test("handles many circular refs without blowing the stack or corrupting identity", () => {
		const root = {};
		let prev = root;
		for (let i = 0; i < 500; i++) {
			const node = { i, back: prev };
			prev.next = node;
			prev = node;
		}
		const out = Helpers.deepClone(root);
		// walk and confirm each node's back-ref resolves to the correct cloned node
		let cur = out;
		let count = 0;
		while (cur.next) {
			expect(cur.next.back).toBe(cur);
			cur = cur.next;
			count++;
		}
		expect(count).toBe(500);
	});
});
