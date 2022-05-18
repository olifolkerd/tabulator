import Tabulator from "../src/js/core/Tabulator.js";
import test from "ava";

const tableData = [
	{ id: 1, name: "Oli Bob", age: "12", col: "red", dob: "" },
	{ id: 2, name: "Mary May", age: "1", col: "blue", dob: "14/05/1982" },
	{
		id: 3,
		name: "Christine Lobowski",
		age: "42",
		col: "green",
		dob: "22/05/1982",
	},
	{
		id: 4,
		name: "Brendon Philips",
		age: "125",
		col: "orange",
		dob: "01/08/1980",
	},
	{
		id: 5,
		name: "Margret Marmajuke",
		age: "16",
		col: "yellow",
		dob: "31/01/1999",
	},
];
const tableColumns = [
	{ title: "Name", field: "name", width: 150 },
	{ title: "Age", field: "age", hozAlign: "left" },
	{ title: "Favourite Color", field: "col" },
	{ title: "Date Of Birth", field: "dob", hozAlign: "center" },
];

Event = window.Event;

test("it can create", (t) => {
	let el = document.createElement("div");
	let testId = "test-table";
	el.setAttribute("id", testId);
	document.body.appendChild(el);
	let opts = {
		data: tableData,
		columns: tableColumns,
	};
	let table = new Tabulator("#" + testId, opts);
	t.is(table.constructor.name, "Tabulator");
});
