import numberSorter from "../../../src/js/modules/Sort/defaults/sorters/number";

describe("number sorter", () => {
	const asc = "asc";
	const desc = "desc";

	const defaultParams = {
		alignEmptyValues: undefined,
		decimalSeparator: undefined,
		thousandSeparator: undefined,
	};

	test("sorts plain numeric values", () => {
		expect(numberSorter(2, 10, null, null, null, asc, defaultParams)).toBe(-8);
		expect(numberSorter(10, 2, null, null, null, asc, defaultParams)).toBe(8);
		expect(numberSorter(2, 2, null, null, null, asc, defaultParams)).toBe(0);
	});

	test("supports thousand separator normalization", () => {
		const params = {
			...defaultParams,
			thousandSeparator: ",",
		};

		expect(numberSorter("1,200", "900", null, null, null, asc, params)).toBe(300);
		expect(numberSorter("900", "1,200", null, null, null, asc, params)).toBe(-300);
	});

	test("supports decimal separator normalization", () => {
		const params = {
			...defaultParams,
			decimalSeparator: ",",
		};

		expect(numberSorter("1,5", "1,25", null, null, null, asc, params)).toBe(0.25);
	});

	test("handles both values as non-numeric", () => {
		expect(numberSorter("foo", "bar", null, null, null, asc, defaultParams)).toBe(0);
	});

	test("default empty alignment keeps non-numeric first in asc path", () => {
		expect(numberSorter("foo", "1", null, null, null, asc, defaultParams)).toBe(-1);
		expect(numberSorter("1", "foo", null, null, null, asc, defaultParams)).toBe(1);
	});

	test("treats empty primitive values as non-numeric", () => {
		expect(numberSorter("", 1, null, null, null, asc, defaultParams)).toBe(-1);
		expect(numberSorter(null, 1, null, null, null, asc, defaultParams)).toBe(-1);
		expect(numberSorter(undefined, 1, null, null, null, asc, defaultParams)).toBe(-1);
	});

	test("handles mixed numeric primitives and numeric strings", () => {
		const params = {
			...defaultParams,
			thousandSeparator: ",",
		};

		expect(numberSorter(1200, "900", null, null, null, asc, params)).toBe(300);
		expect(numberSorter("1,200", 900, null, null, null, asc, params)).toBe(300);
	});

	test("alignEmptyValues top and bottom flip as expected by direction", () => {
		const topParams = {
			...defaultParams,
			alignEmptyValues: "top",
		};
		const bottomParams = {
			...defaultParams,
			alignEmptyValues: "bottom",
		};

		expect(numberSorter("foo", "1", null, null, null, asc, topParams)).toBe(-1);
		expect(numberSorter("foo", "1", null, null, null, desc, topParams)).toBe(1);

		expect(numberSorter("foo", "1", null, null, null, asc, bottomParams)).toBe(1);
		expect(numberSorter("foo", "1", null, null, null, desc, bottomParams)).toBe(-1);
	});
});
